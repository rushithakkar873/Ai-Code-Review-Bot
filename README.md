# 🤖 AI-Powered Code Review Bot

An intelligent GitHub Action that automatically reviews Pull Requests using **ESLint** for static analysis and **OpenAI GPT-4** for advanced code quality suggestions.

## 🚀 Features

- ✅ **Automated PR Reviews**: Triggers on every pull request
- 🔍 **ESLint Integration**: Catches syntax errors and style issues
- 🤖 **AI-Powered Analysis**: GPT-4 provides intelligent feedback on:
  - Code readability and maintainability
  - Naming conventions
  - Potential bugs and improvements
  - Best practices and patterns
- 💬 **Smart Comments**: Posts targeted inline comments on specific lines
- 🎯 **Focused Reviews**: Only analyzes changed files to save API costs
- 📊 **Multiple Languages**: Supports TypeScript, JavaScript, TSX, JSX

## 🛠️ Setup Instructions

### 1. Fork or Clone This Repository

```bash
git clone https://github.com/yourusername/ai-code-review-bot.git
cd ai-code-review-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure OpenAI API Key

1. Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Go to your GitHub repository settings
3. Navigate to **Settings → Secrets and variables → Actions**
4. Add a new repository secret:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key

### 4. Test Locally (Optional)

```bash
# Build the project
npm run build

# Set environment variables
export OPENAI_API_KEY="your-key-here"
export GITHUB_TOKEN="your-github-token"
export GITHUB_REPOSITORY="owner/repo"
export GITHUB_PR_NUMBER="1"

# Run the bot
npm start
```

### 5. Enable GitHub Actions

The workflow is automatically enabled when you push the `.github/workflows/code-review.yml` file to your repository.

## 📁 Project Structure

```
ai-code-review-bot/
├── src/
│   └── reviewBot.ts          # Main review logic
├── .github/
│   └── workflows/
│       └── code-review.yml   # GitHub Action workflow
├── .eslintrc.json            # ESLint configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## 🎯 How It Works

1. **Trigger**: GitHub Action runs when a PR is opened, updated, or reopened
2. **File Analysis**: Bot identifies changed TypeScript/JavaScript files
3. **ESLint Check**: Runs static analysis to catch errors and style issues
4. **AI Review**: Sends code snippets to GPT-4 for intelligent analysis
5. **Comment Generation**: Creates targeted feedback as PR review comments
6. **Results**: Posts comprehensive review with both ESLint and AI insights

## 🧪 Demo Instructions

### Create a Test PR

1. **Fork this repository**
2. **Create a new branch**:
   ```bash
   git checkout -b test-review-bot
   ```

3. **Add some code to test** (create `example.ts`):
   ```typescript
   // This code has intentional issues for testing
   function calculateTotal(items: any) {
       let total = 0;
       for(var i = 0; i < items.length; i++) {
           total += items[i].price
       }
       return total
   }

   const user_name = "john_doe";  // Poor naming
   console.log(user_name);        // Unnecessary console.log
   ```

4. **Commit and push**:
   ```bash
   git add example.ts
   git commit -m "Add example code for review"
   git push origin test-review-bot
   ```

5. **Create a Pull Request** on GitHub

6. **Watch the magic happen**! The bot will:
   - Run ESLint checks
   - Analyze code with AI
   - Post detailed review comments

## 🔧 Configuration

### ESLint Rules

Customize rules in `.eslintrc.json`:

```json
{
  "rules": {
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### AI Review Prompts

Modify the prompt in `src/reviewBot.ts` to focus on specific aspects:

```typescript
const prompt = `As a senior code reviewer, please review this code focusing on:
1. Security vulnerabilities
2. Performance optimizations  
3. Code architecture
// ... customize as needed
`;
```

## 📊 Cost Considerations

- **OpenAI API**: ~$0.01-0.05 per review (depending on file size)
- **GitHub Actions**: Free for public repositories
- **Optimization**: Bot only analyzes changed files to minimize costs

## 🛡️ Security & Privacy

- API keys are stored securely in GitHub Secrets
- Only changed files are sent to OpenAI (not entire codebase)
- No sensitive data is logged or stored
- Review comments are posted using GitHub's API

## 🚀 Advanced Features

### Custom Review Rules

Add custom review logic in `reviewBot.ts`:

```typescript
private async customSecurityCheck(fileContent: string): Promise<string[]> {
  const issues = [];
  if (fileContent.includes('eval(')) {
    issues.push('Avoid using eval() - security risk');
  }
  return issues;
}
```

### Integration with Other Tools

Extend the bot to work with:
- **Prettier** for code formatting
- **Jest** for test coverage analysis
- **SonarQube** for additional quality metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - feel free to use this in your projects!

## 🆘 Troubleshooting

### Common Issues

**Bot not running?**
- Check that `OPENAI_API_KEY` is set in repository secrets
- Verify GitHub Actions are enabled for your repository
- Check the Actions tab for error logs

**No comments posted?**
- Ensure the bot has write permissions on PRs
- Check if files match the supported extensions (.ts, .js, .tsx, .jsx)
- Verify the PR has actual code changes

**Rate limiting?**
- OpenAI has rate limits - the bot handles this gracefully
- Consider reducing file size limits for large PRs

### Debug Mode

Enable verbose logging by setting environment variable:
```bash
export DEBUG=true
```

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/ai-code-review-bot/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/ai-code-review-bot/discussions)
- 📧 **Contact**: your-email@example.com

---

**Happy Coding!** 🎉 Let the AI help make your code reviews more thorough and consistent.