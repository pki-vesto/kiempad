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
}
