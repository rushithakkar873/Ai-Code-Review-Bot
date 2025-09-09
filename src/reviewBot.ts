import { Octokit } from '@octokit/rest';
import OpenAI from 'openai';
import { ESLint } from 'eslint';
import * as fs from 'fs';
import * as path from 'path';

interface ESLintResult {
  filePath: string;
  messages: {
    ruleId: string | null;
    severity: number;
    message: string;
    line: number;
    column: number;
  }[];
}

interface ReviewComment {
  path: string;
  line: number;
  body: string;
}

class AICodeReviewBot {
  private octokit: Octokit;
  private openai: OpenAI;
  private eslint: ESLint;

  constructor() {
    const githubToken = process.env.GITHUB_TOKEN;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!githubToken || !openaiApiKey) {
      throw new Error('Missing required environment variables: GITHUB_TOKEN and OPENAI_API_KEY');
    }

    this.octokit = new Octokit({ auth: githubToken });
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.eslint = new ESLint({
      // @ts-ignore
      useEslintrc: true,
      fix: false
    });
  }

  async reviewPullRequest(): Promise<void> {
    const owner = process.env.GITHUB_REPOSITORY?.split('/')[0];
    const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
    const prNumber = parseInt(process.env.GITHUB_PR_NUMBER || '0');

    if (!owner || !repo || !prNumber) {
      throw new Error('Missing GitHub context variables');
    }

    console.log(`Starting review for PR #${prNumber} in ${owner}/${repo}`);

    try {
      // Get changed files from PR
      const changedFiles = await this.getChangedFiles(owner, repo, prNumber);
      console.log(`Found ${changedFiles.length} changed files`);

      // Filter for TypeScript/JavaScript files
      const codeFiles = changedFiles.filter(file => 
        /\.(ts|js|tsx|jsx)$/.test(file.filename) && file.status !== 'removed'
      );

      if (codeFiles.length === 0) {
        console.log('No code files to review');
        return;
      }

      // Run ESLint on changed files
      const eslintResults = await this.runESLint(codeFiles.map(f => f.filename));
      
      // Generate AI review comments
      const reviewComments = await this.generateAIReview(codeFiles, eslintResults);

      // Post review comments
      await this.postReviewComments(owner, repo, prNumber, reviewComments);

      console.log(`Review completed! Posted ${reviewComments.length} comments`);
    } catch (error) {
      console.error('Error during review:', error);
      throw error;
    }
  }

  private async getChangedFiles(owner: string, repo: string, prNumber: number): Promise<any[]> {
    const { data: files } = await this.octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber
    });

    return files;
  }

  private async runESLint(filePaths: string[]): Promise<ESLintResult[]> {
    const results: ESLintResult[] = [];

    for (const filePath of filePaths) {
      if (fs.existsSync(filePath)) {
        try {
          const eslintResults = await this.eslint.lintFiles([filePath]);
          results.push(...eslintResults);
        } catch (error) {
          console.warn(`ESLint failed for ${filePath}:`, error);
        }
      }
    }

    return results;
  }

  private async generateAIReview(changedFiles: any[], eslintResults: ESLintResult[]): Promise<ReviewComment[]> {
    const reviewComments: ReviewComment[] = [];

    // First, add ESLint issues as comments
    for (const result of eslintResults) {
      for (const message of result.messages) {
        if (message.severity === 2) { // Errors only
          reviewComments.push({
            path: result.filePath,
            line: message.line,
            body: `**ESLint Error**: ${message.message}${message.ruleId ? ` (${message.ruleId})` : ''}`
          });
        }
      }
    }

    // Generate AI-powered reviews for each changed file
    for (const file of changedFiles) {
      if (!/\.(ts|js|tsx|jsx)$/.test(file.filename)) continue;

      try {
        const fileContent = fs.readFileSync(file.filename, 'utf-8');
        const aiSuggestions = await this.getAISuggestions(file.filename, fileContent, file.patch);
        
        if (aiSuggestions) {
          // Try to extract line numbers from the patch, default to line 1 if not found
          const lineMatch = file.patch?.match(/@@ -\d+,?\d* \+(\d+)/);
          const startLine = lineMatch ? parseInt(lineMatch[1]) : 1;
          
          reviewComments.push({
            path: file.filename,
            line: startLine,
            body: aiSuggestions
          });
        }
      } catch (error) {
        console.warn(`Failed to generate AI review for ${file.filename}:`, error);
      }
    }

    return reviewComments;
  }

  private async getAISuggestions(fileName: string, fileContent: string, patch?: string): Promise<string | null> {
    try {
      const prompt = `As a senior code reviewer, please review this ${path.extname(fileName)} file and provide constructive feedback focusing on:
1. Code readability and maintainability
2. Naming conventions
3. Potential bugs or improvements
4. Best practices

File: ${fileName}

${patch ? `Changed lines (patch):\n\`\`\`diff\n${patch}\n\`\`\`` : ''}

Full file content:
\`\`\`${path.extname(fileName).slice(1)}
${fileContent.slice(0, 3000)} ${fileContent.length > 3000 ? '...' : ''}
\`\`\`

Please provide specific, actionable feedback. If the code looks good, just say so briefly.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an experienced code reviewer. Provide concise, helpful feedback focusing on code quality, readability, and best practices. Be constructive and specific.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      });

      const suggestion = response.choices[0]?.message?.content?.trim();
      
      // Only return suggestions if AI found something to comment on
      if (suggestion && !suggestion.toLowerCase().includes('looks good') && suggestion.length > 50) {
        return `🤖 **AI Code Review**\n\n${suggestion}`;
      }

      return null;
    } catch (error) {
      console.error('OpenAI API error:', error);
      return null;
    }
  }

  private async postReviewComments(owner: string, repo: string, prNumber: number, comments: ReviewComment[]): Promise<void> {
    if (comments.length === 0) {
      // Post a general comment if no specific issues found
      await this.octokit.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: '✅ **AI Code Review Complete**\n\nNo major issues found! The code looks good to me. 🚀'
      });
      return;
    }

    // Create a review with all comments
    try {
      await this.octokit.pulls.createReview({
        owner,
        repo,
        pull_number: prNumber,
        event: 'COMMENT',
        body: `🤖 **Automated Code Review Results**\n\nFound ${comments.length} items for review. Please check the inline comments below.`,
        comments: comments.map(comment => ({
          path: comment.path,
          line: comment.line,
          body: comment.body
        }))
      });
    } catch (error) {
      console.error('Failed to create review, posting individual comments:', error);
      
      // Fallback: post individual comments
      for (const comment of comments.slice(0, 10)) { // Limit to 10 comments to avoid spam
        try {
          await this.octokit.issues.createComment({
            owner,
            repo,
            issue_number: prNumber,
            body: `**${comment.path}:${comment.line}**\n\n${comment.body}`
          });
        } catch (err) {
          console.error(`Failed to post comment for ${comment.path}:`, err);
        }
      }
    }
  }
}

// Main execution
async function main(): Promise<void> {
  try {
    const bot = new AICodeReviewBot();
    await bot.reviewPullRequest();
  } catch (error) {
    console.error('Review bot failed:', error);
    process.exit(1);
  }
}

// Run the bot if this file is executed directly
if (require.main === module) {
  main();
}