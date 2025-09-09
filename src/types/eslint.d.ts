declare module 'eslint' {
  export interface LintMessage {
    ruleId: string | null;
    severity: number;
    message: string;
    line: number;
    column: number;
    nodeType?: string;
    source?: string;
    endLine?: number;
    endColumn?: number;
  }

  export interface LintResult {
    filePath: string;
    messages: LintMessage[];
    suppressedMessages?: LintMessage[];
    errorCount: number;
    warningCount: number;
    fixableErrorCount: number;
    fixableWarningCount: number;
    source?: string;
    usedDeprecatedRules?: any[];
  }

  export interface ESLintOptions {
    useEslintrc?: boolean;
    fix?: boolean;
    fixTypes?: string[];
    overrideConfig?: any;
    overrideConfigFile?: string;
  }

  export class ESLint {
    constructor(options?: ESLintOptions);
    lintFiles(patterns: string | string[]): Promise<LintResult[]>;
    lintText(code: string, options?: { filePath?: string }): Promise<LintResult[]>;
    calculateConfigForFile(filePath: string): Promise<any>;
    isPathIgnored(filePath: string): Promise<boolean>;
    static outputFixes(results: LintResult[]): Promise<void>;
  }
}