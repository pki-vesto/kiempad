declare module '*.mjs' {
  export const ISSUE_SNAPSHOT_CLEANUP_COMMAND: string;
  export const ISSUE_SNAPSHOT_COMMAND: string;
  export const ISSUE_SNAPSHOT_EXAMPLE_LIMIT: number;
  export const ISSUE_SNAPSHOT_FRESHNESS_COMMAND: string;
  export const ISSUE_SNAPSHOT_LIMIT: number;
  export function buildIssueSnapshotCommand(limit?: number): string;
  export function buildIssueSnapshotValidationCommand(limit?: number): string;
  export function parseBacklog(markdown: string): {
    goals: Array<Record<string, unknown>>;
    byId: Map<string, Record<string, unknown>>;
    duplicates: string[];
  };
  export function parseExecutionGoals(markdown: string): {
    goals: Array<Record<string, unknown>>;
    byId: Map<string, Record<string, unknown>>;
    duplicates: string[];
  };
  export function parseIssueSnapshot(jsonText: string): {
    issues: unknown[];
    byGoalId: Map<string, Record<string, unknown>>;
    duplicates: string[];
    duplicateIssues: Array<{ id: string; issues: Array<Record<string, unknown>> }>;
    totalIssues: number;
  };
  export function buildActiveGoalDriftFindings(
    backlog: { goals: Array<Record<string, unknown>> },
    execution: { goals: Array<Record<string, unknown>> },
    minimumOpenGoals?: number,
  ): Array<Record<string, unknown>>;
  export function buildBacklogHealthReport(input: {
    backlogMarkdown: string;
    executionGoalsMarkdown: string;
    issueSnapshotJson?: string;
    activeGoalMinimum?: number;
    issueSnapshotLimit?: number;
  }): {
    summary: Record<string, unknown>;
    issueSnapshot?: {
      duplicateIssues: Array<{ id: string; issues: Array<Record<string, unknown>> }>;
      missingIssueLinks: Array<{ id: string; title: string }>;
      nonOpenIssueLinks: Array<{
        id: string;
        title: string;
        issue: Record<string, unknown>;
      }>;
      completedGoalOpenIssues: Array<{
        id: string;
        title: string;
        issue: Record<string, unknown>;
      }>;
    };
    findings: Array<Record<string, unknown>>;
  };
  export function readNumberArg(argv: string[], flag: string, fallback: number): number;
  export function formatBacklogHealthMarkdown(report: {
    summary: Record<string, unknown>;
    findings: Array<Record<string, unknown>>;
  }): string;
  export function scoreGoal(goal: { fields: Record<string, unknown> }): number;
  export function rankExecutionGoals(markdown: string): Array<{
    id: string;
    title: string;
    fields: Record<string, unknown>;
    score: number;
    status?: string;
  }>;
  export function formatGoalScoreMarkdown(
    rankedGoals: Array<{
      id: string;
      title: string;
      fields: Record<string, unknown>;
      score: number;
    }>,
    limit?: number,
  ): string;
  export function scanAssetText(
    filePath: string,
    text: string,
  ): Array<{ filePath: string; url: string; context: string }>;
  export const ALLOWED_REMOTE_ASSET_URLS: Array<{ url: string; reason: string }>;
  export function validateAssetAllowlist(
    entries?: Array<{ url: string; reason: string }>,
  ): string[];
  export function listScannableAssetFiles(rootDir: string, extraFiles?: string[]): string[];
  export function scanAssetFiles(
    rootDir?: string,
  ): Array<{ filePath: string; url: string; context: string }>;
  export const ALLOWED_SECRET_EXAMPLES: Array<{ value: string; reason: string }>;
  export function validateSecretAllowlist(
    entries?: Array<{ value: string; reason: string }>,
  ): string[];
  export function scanSecretText(
    filePath: string,
    text: string,
  ): Array<{ filePath: string; pattern: string; line: number; preview: string }>;
  export function listSecretScanFiles(rootDir?: string): string[];
  export function scanSecretFiles(
    rootDir?: string,
  ): Array<{ filePath: string; pattern: string; line: number; preview: string }>;
  export function scanSensitiveFixtureText(
    filePath: string,
    text: string,
  ): Array<{ filePath: string; pattern: string; line: number; message: string }>;
  export const ALLOWED_SENSITIVE_FIXTURE_EXAMPLES: Array<{ value: string; reason: string }>;
  export function validateSensitiveFixtureAllowlist(
    entries?: Array<{ value: string; reason: string }>,
  ): string[];
  export function listSensitiveFixtureFiles(rootDir?: string): string[];
  export function scanSensitiveFixtureFiles(
    rootDir?: string,
  ): Array<{ filePath: string; pattern: string; line: number; message: string }>;
}
