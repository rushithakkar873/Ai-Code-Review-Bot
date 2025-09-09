declare module 'eslint' {
  export interface ESLintResult {
    filePath: string;
    messages: Array<{
      ruleId: string | null;
      severity: number;
      message: string;
      line: number;
      column: number;
    }>;
  }

  export class ESLint {
    constructor(options?: any);
    lintFiles(patterns: string[]): Promise<ESLintResult[]>;
  }
}