import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';
import workflowRaw from '../.github/workflows/ci.yml?raw';
import packageJsonRaw from '../package.json?raw';
import monitorScriptRaw from '../scripts/central-health-monitor-annotation.mts?raw';
import {
  CENTRAL_HEALTH_MONITOR_CI_FAILURE_PREFIX,
  CENTRAL_HEALTH_MONITOR_CI_RECOVERY_HINT,
  CENTRAL_HEALTH_MONITOR_CI_SUCCESS_ANNOTATION,
} from '../src/storage/centralHealthContract';

const execFileAsync = promisify(execFile);
const TSX_BIN = 'node_modules/.bin/tsx';
const MONITOR_SCRIPT = 'scripts/central-health-monitor-annotation.mts';

describe('G1086 central health monitor annotation CLI fixture', () => {
  it('biedt een npm-command met alleen technische success-annotatie', async () => {
    const pkg = JSON.parse(packageJsonRaw) as { scripts: Record<string, string> };

    expect(pkg.scripts['smoke:central-health-monitor']).toBe(
      'tsx scripts/central-health-monitor-annotation.mts --fixture=ok',
    );
    expect(workflowRaw).toContain('Central health monitor annotation smoke');
    expect(workflowRaw).toContain('npm run smoke:central-health-monitor');

    const { stdout, stderr } = await execFileAsync(TSX_BIN, [MONITOR_SCRIPT], {
      cwd: process.cwd(),
    });
    const output = JSON.parse(stdout) as { status: string; ciAnnotation: string };

    expect(stderr).toBe('');
    expect(output).toEqual({
      status: 'ok',
      ciAnnotation: CENTRAL_HEALTH_MONITOR_CI_SUCCESS_ANNOTATION,
    });
    expectSanitizedMonitorOutput(stdout);
  });

  it('maakt version, field en errorstate drift herkenbaar zonder responsebody', async () => {
    for (const failure of [
      'unexpected-contract-version',
      'unexpected-field',
      'unexpected-error-states',
    ] as const) {
      const output = await runFailingMonitorFixture(failure);

      expect(output).toContain('"status": "failed"');
      expect(output).toContain(
        `"ciAnnotation": "${CENTRAL_HEALTH_MONITOR_CI_FAILURE_PREFIX}${failure} recovery=${CENTRAL_HEALTH_MONITOR_CI_RECOVERY_HINT}"`,
      );
      expectSanitizedMonitorOutput(output);
    }
  });

  it('redigeert privacyveld-fixtures naar alleen het technische annotatielabel', async () => {
    const output = await runFailingMonitorFixture('forbidden-privacy-field');

    expect(output).toContain(
      `"ciAnnotation": "${CENTRAL_HEALTH_MONITOR_CI_FAILURE_PREFIX}forbidden-privacy-field recovery=${CENTRAL_HEALTH_MONITOR_CI_RECOVERY_HINT}"`,
    );
    expectSanitizedMonitorOutput(output);
  });

  it('houdt scriptfixture en contracttermen reviewbaar', () => {
    for (const requiredTerm of [
      'unexpected-contract-version',
      'unexpected-field',
      'unexpected-error-states',
      'forbidden-privacy-field',
      'buildCentralHealthMonitorCiAnnotation',
      'validateCentralHealthContractBody',
    ]) {
      expect(monitorScriptRaw).toContain(requiredTerm);
    }
  });
});

async function runFailingMonitorFixture(fixture: string): Promise<string> {
  try {
    await execFileAsync(TSX_BIN, [MONITOR_SCRIPT, `--fixture=${fixture}`], { cwd: process.cwd() });
  } catch (error) {
    const execError = error as { stdout: string; stderr: string };
    expect(execError.stderr).toBe('');
    return execError.stdout;
  }
  throw new Error(`Monitorfixture ${fixture} had moeten falen.`);
}

function expectSanitizedMonitorOutput(output: string): void {
  for (const forbidden of [
    'user-peter',
    'kiempad-session-secret',
    'record-sensitive',
    'encrypted-ciphertext',
    'Progesteron',
    '123 mg',
    'start behandeling',
    'responsebody',
    'headers',
    'user-id',
    'session-id',
    'record-id',
    'recordcount',
    'ciphertext',
    'gezondheidsdata',
    'diagnose',
    'dosering',
    'kansberekening',
    'behandelkeuzeadvies',
  ]) {
    expect(output).not.toContain(forbidden);
  }
}
