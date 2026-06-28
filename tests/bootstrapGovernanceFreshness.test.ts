import { execFile } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';
import workflowRaw from '../.github/workflows/ci.yml?raw';
import runbookRaw from '../docs/RUNBOOK.md?raw';
import packageJsonRaw from '../package.json?raw';
import governanceScriptRaw from '../scripts/bootstrap-governance-freshness.mjs?raw';
import governanceContract from '../scripts/bootstrap-governance-freshness-contract.json';

const execFileAsync = promisify(execFile);

describe('bootstrap diagnostic governance freshness gate', () => {
  it('biedt een npm- en CI-gate voor de governancechecklist', () => {
    const pkg = JSON.parse(packageJsonRaw) as { scripts: Record<string, string> };

    expect(pkg.scripts['governance:bootstrap']).toBe(
      'node scripts/bootstrap-governance-freshness.mjs',
    );
    expect(workflowRaw).toContain('Bootstrap governance freshness');
    expect(workflowRaw).toContain('npm run governance:bootstrap');
    expect(governanceScriptRaw).toContain('bootstrap-governance-freshness-contract.json');
    expect(governanceScriptRaw).toContain('contract.sourceFields');
    expect(governanceScriptRaw).toContain('contract.coverageFields');
  });

  it('rapporteert checklistdekking met gesanitized technische output', async () => {
    const { stdout, stderr } = await execFileAsync('node', [
      'scripts/bootstrap-governance-freshness.mjs',
    ]);
    const report = JSON.parse(stdout) as GovernanceGateReport;
    const docsSnapshotText = extractBootstrapGovernanceFreshnessDocsSnapshot();
    const docsSnapshot = JSON.parse(docsSnapshotText) as GovernanceGateReport;

    expect(stderr).toBe('');
    expect(report).toEqual({
      status: 'ok',
      gate: governanceContract.gate,
      sources: {
        runbookChecklist: {
          status: 'ok',
          missingCount: 0,
        },
        registryReference: {
          status: 'ok',
          missingCount: 0,
        },
        ciStep: {
          status: 'ok',
          missingCount: 0,
        },
      },
      coverage: {
        registry: 'ok',
        schemaGuard: 'ok',
        snapshot: 'ok',
        runbookReview: 'ok',
        ciStep: 'ok',
      },
    });
    expect(docsSnapshot).toEqual(report);
    expect(Object.keys(report.sources)).toEqual(governanceContract.sourceFields);
    expect(Object.keys(report.coverage)).toEqual(governanceContract.coverageFields);
    expect(Object.keys(docsSnapshot.sources)).toEqual(governanceContract.sourceFields);
    expect(Object.keys(docsSnapshot.coverage)).toEqual(governanceContract.coverageFields);

    for (const forbiddenTerm of [
      'payload',
      'passphrase',
      'secret',
      'token',
      'bestandsnaam',
      'filename',
      'OCR',
      'base64',
      'medische',
      'fertiliteitsnotitie',
    ]) {
      expect(stdout).not.toContain(forbiddenTerm);
      expect(docsSnapshotText).not.toContain(forbiddenTerm);
    }
  });

  it('onderscheidt ontbrekende runbookchecklist-markers in faaloutput', async () => {
    const output = await runGovernanceGateWithFixture({
      runbook: buildRunbookFixture({ includeChecklist: false }),
      workflow: buildWorkflowFixture({ includeCiStep: true }),
    });

    expect(output.status).toBe('failed');
    expect(output.sources.runbookChecklist).toEqual({ status: 'missing', missingCount: 4 });
    expect(output.sources.registryReference).toEqual({ status: 'ok', missingCount: 0 });
    expect(output.sources.ciStep).toEqual({ status: 'ok', missingCount: 0 });
  });

  it('onderscheidt ontbrekende registryverwijzingen in faaloutput', async () => {
    const output = await runGovernanceGateWithFixture({
      runbook: buildRunbookFixture({ includeRegistryReferences: false }),
      workflow: buildWorkflowFixture({ includeCiStep: true }),
    });

    expect(output.status).toBe('failed');
    expect(output.sources.runbookChecklist).toEqual({ status: 'ok', missingCount: 0 });
    expect(output.sources.registryReference).toEqual({ status: 'missing', missingCount: 3 });
    expect(output.sources.ciStep).toEqual({ status: 'ok', missingCount: 0 });
  });

  it('onderscheidt ontbrekende CI-step in faaloutput', async () => {
    const output = await runGovernanceGateWithFixture({
      runbook: buildRunbookFixture({ includeChecklist: true }),
      workflow: buildWorkflowFixture({ includeCiStep: false }),
    });

    expect(output.status).toBe('failed');
    expect(output.sources.runbookChecklist).toEqual({ status: 'ok', missingCount: 0 });
    expect(output.sources.registryReference).toEqual({ status: 'ok', missingCount: 0 });
    expect(output.sources.ciStep).toEqual({ status: 'missing', missingCount: 2 });
  });

  it('rapporteert onbekende sourcevelden als gesanitized schemafout', async () => {
    const output = await runGovernanceGateWithUnknownField({
      KIEMPAD_BOOTSTRAP_GOVERNANCE_INJECT_UNKNOWN_SOURCE_FIELD: '1',
    });

    expect(output).toEqual({
      status: 'failed',
      gate: governanceContract.gate,
      schemaValidation: {
        status: 'failed',
        unknownSourceFieldCount: 1,
        unknownCoverageFieldCount: 0,
      },
    });
    expect(JSON.stringify(output)).not.toContain('unexpectedSource');
    expectSanitizedGovernanceOutput(JSON.stringify(output));
  });

  it('rapporteert onbekende coveragevelden als gesanitized schemafout', async () => {
    const output = await runGovernanceGateWithUnknownField({
      KIEMPAD_BOOTSTRAP_GOVERNANCE_INJECT_UNKNOWN_COVERAGE_FIELD: '1',
    });

    expect(output).toEqual({
      status: 'failed',
      gate: governanceContract.gate,
      schemaValidation: {
        status: 'failed',
        unknownSourceFieldCount: 0,
        unknownCoverageFieldCount: 1,
      },
    });
    expect(JSON.stringify(output)).not.toContain('unexpectedCoverage');
    expectSanitizedGovernanceOutput(JSON.stringify(output));
  });
});

function extractBootstrapGovernanceFreshnessDocsSnapshot(): string {
  const snapshot = runbookRaw.match(
    /Succesvolle freshness-outputsnapshot:\n\n\s*```json\n([\s\S]*?)\n\s*```/,
  )?.[1];

  if (!snapshot) {
    throw new Error('Bootstrap governance freshness docsnapshot ontbreekt in de runbook.');
  }

  return snapshot;
}

type GovernanceGateReport = {
  status: string;
  gate: string;
  sources: Record<string, { status: string; missingCount: number }>;
  coverage: Record<string, string>;
};

type GovernanceSchemaFailureReport = {
  status: string;
  gate: string;
  schemaValidation: {
    status: string;
    unknownSourceFieldCount: number;
    unknownCoverageFieldCount: number;
  };
};

async function runGovernanceGateWithFixture({
  runbook,
  workflow,
}: {
  runbook: string;
  workflow: string;
}): Promise<GovernanceGateReport> {
  const fixtureDir = await mkdtemp(join(tmpdir(), 'kiempad-governance-'));
  const runbookPath = join(fixtureDir, 'RUNBOOK.md');
  const workflowPath = join(fixtureDir, 'ci.yml');
  await writeFile(runbookPath, runbook);
  await writeFile(workflowPath, workflow);

  try {
    const { stdout } = await execFileAsync('node', ['scripts/bootstrap-governance-freshness.mjs'], {
      env: {
        ...process.env,
        KIEMPAD_BOOTSTRAP_GOVERNANCE_RUNBOOK_PATH: runbookPath,
        KIEMPAD_BOOTSTRAP_GOVERNANCE_WORKFLOW_PATH: workflowPath,
      },
    });
    return JSON.parse(stdout) as GovernanceGateReport;
  } catch (error) {
    const failedRun = error as { stdout?: string };
    return JSON.parse(failedRun.stdout ?? '{}') as GovernanceGateReport;
  }
}

function buildRunbookFixture({
  includeChecklist = true,
  includeRegistryReferences = true,
}: {
  includeChecklist?: boolean;
  includeRegistryReferences?: boolean;
}): string {
  return [
    includeChecklist
      ? ['- [ ] Registry:', '- [ ] Schema guard:', '- [ ] Snapshot:', '- [ ] Runbookreview:'].join(
          '\n',
        )
      : 'Checklist ontbreekt.',
    includeRegistryReferences
      ? [
          'src/storage/centralBootstrapDiagnostics.ts',
          'diagnosticRegistry',
          'phaseCode-matrix',
        ].join('\n')
      : 'Registryverwijzing ontbreekt.',
  ].join('\n');
}

function buildWorkflowFixture({ includeCiStep }: { includeCiStep: boolean }): string {
  return includeCiStep
    ? ['Bootstrap governance freshness', 'npm run governance:bootstrap'].join('\n')
    : 'build-test: true';
}

async function runGovernanceGateWithUnknownField(
  env: Record<string, string>,
): Promise<GovernanceSchemaFailureReport> {
  try {
    const { stdout } = await execFileAsync('node', ['scripts/bootstrap-governance-freshness.mjs'], {
      env: {
        ...process.env,
        ...env,
      },
    });
    return JSON.parse(stdout) as GovernanceSchemaFailureReport;
  } catch (error) {
    const failedRun = error as { stdout?: string };
    return JSON.parse(failedRun.stdout ?? '{}') as GovernanceSchemaFailureReport;
  }
}

function expectSanitizedGovernanceOutput(output: string): void {
  for (const forbiddenTerm of [
    'payload',
    'passphrase',
    'secret',
    'token',
    'bestandsnaam',
    'filename',
    'OCR',
    'base64',
    'medische',
    'fertiliteitsnotitie',
  ]) {
    expect(output).not.toContain(forbiddenTerm);
  }
}
