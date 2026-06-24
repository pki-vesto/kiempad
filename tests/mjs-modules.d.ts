declare module '*.mjs' {
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
  };
  export function buildBacklogHealthReport(input: {
    backlogMarkdown: string;
    executionGoalsMarkdown: string;
    issueSnapshotJson?: string;
  }): {
    summary: Record<string, unknown>;
    findings: Array<Record<string, unknown>>;
  };
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
  export function listSensitiveFixtureFiles(rootDir?: string): string[];
  export function scanSensitiveFixtureFiles(
    rootDir?: string,
  ): Array<{ filePath: string; pattern: string; line: number; message: string }>;
}
