import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';
import workflowRaw from '../.github/workflows/ci.yml?raw';
import packageJsonRaw from '../package.json?raw';

const execFileAsync = promisify(execFile);
const TSX_BIN = 'node_modules/.bin/tsx';
const SMOKE_SCRIPT = 'scripts/central-dataset-bootstrap-smoke.mts';

describe('central dataset bootstrap smoke command', () => {
  it('biedt een dedicated npm- en CI-command met technische output', async () => {
    const pkg = JSON.parse(packageJsonRaw) as { scripts: Record<string, string> };

    expect(pkg.scripts['smoke:central-bootstrap']).toBe(
      'tsx scripts/central-dataset-bootstrap-smoke.mts',
    );
    expect(workflowRaw).toContain('npm run smoke:central-bootstrap');

    const { stdout, stderr } = await execFileAsync(TSX_BIN, [SMOKE_SCRIPT], { cwd: process.cwd() });

    expect(stderr).toBe('');
    expect(stdout).toContain('"status": "ok"');
    expect(stdout).toContain('"mode": "central-encrypted"');
    expect(stdout).toContain('"secondDeviceReadVisible": true');
    expect(stdout).toContain('"wrongPassphraseRejected": true');
    expect(stdout).toContain('"leaked": false');
    expect(stdout).not.toContain('central bootstrap smoke passphrase');
    expect(stdout).not.toContain('kiempad-session-');
    expect(stdout).not.toContain('Centrale bootstrap poging');
    expect(stdout).not.toContain('gevoelige fertiliteitsnotitie');
  }, 15_000);

  it('faalt met generieke output wanneer de plaintext-boundary faalt', async () => {
    const output = await runFailingSmoke({
      KIEMPAD_BOOTSTRAP_SMOKE_INJECT_PLAINTEXT_LEAK: '1',
    });

    expect(output).toContain('"status": "failed"');
    expect(output).toContain('"phaseCode": "plaintext-boundary"');
    expect(output).toContain('"recoveryHint"');
    expectSanitizedSmokeOutput(output);
  }, 15_000);

  it('faalt met fasecode wanneer tweede-device read niet zichtbaar is', async () => {
    const output = await runFailingSmoke({
      KIEMPAD_BOOTSTRAP_SMOKE_FORCE_SECOND_DEVICE_FAILURE: '1',
    });

    expect(output).toContain('"status": "failed"');
    expect(output).toContain('"phaseCode": "second-device-read"');
    expect(output).toContain('"recoveryHint"');
    expectSanitizedSmokeOutput(output);
  }, 15_000);

  it('redigeert alle bekende bootstrap failurediagnostics', async () => {
    for (const { phaseCode, env } of [
      {
        phaseCode: 'first-device-write',
        env: { KIEMPAD_BOOTSTRAP_SMOKE_FORCE_FIRST_DEVICE_FAILURE: '1' },
      },
      {
        phaseCode: 'second-device-read',
        env: { KIEMPAD_BOOTSTRAP_SMOKE_FORCE_SECOND_DEVICE_FAILURE: '1' },
      },
      {
        phaseCode: 'restart-read',
        env: { KIEMPAD_BOOTSTRAP_SMOKE_FORCE_RESTART_FAILURE: '1' },
      },
      {
        phaseCode: 'wrong-key',
        env: { KIEMPAD_BOOTSTRAP_SMOKE_FORCE_WRONG_KEY_FAILURE: '1' },
      },
      {
        phaseCode: 'snapshot-inspection',
        env: { KIEMPAD_BOOTSTRAP_SMOKE_FORCE_SNAPSHOT_INSPECTION_FAILURE: '1' },
      },
      {
        phaseCode: 'plaintext-boundary',
        env: { KIEMPAD_BOOTSTRAP_SMOKE_INJECT_PLAINTEXT_LEAK: '1' },
      },
    ]) {
      const output = await runFailingSmoke(env);
      expect(output).toContain('"status": "failed"');
      expect(output).toContain(`"phaseCode": "${phaseCode}"`);
      expect(output).toContain('"recoveryHint"');
      expectSanitizedSmokeOutput(output);
    }
  }, 30_000);
});

async function runFailingSmoke(env: Record<string, string>): Promise<string> {
  try {
    await execFileAsync(TSX_BIN, [SMOKE_SCRIPT], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        ...env,
      },
    });
  } catch (error) {
    return `${String((error as { stdout?: unknown }).stdout ?? '')}\n${String(
      (error as { stderr?: unknown }).stderr ?? '',
    )}`;
  }

  throw new Error('Expected smoke command to fail.');
}

function expectSanitizedSmokeOutput(output: string): void {
  expect(output).not.toContain('central bootstrap smoke passphrase');
  expect(output).not.toContain('kiempad-session-');
  expect(output).not.toContain('Centrale bootstrap poging');
  expect(output).not.toContain('gevoelige fertiliteitsnotitie');
  expect(output).not.toContain('filename');
  expect(output).not.toContain('base64');
  expect(output).not.toContain('OCR');
}
