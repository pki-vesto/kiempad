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
    try {
      await execFileAsync(TSX_BIN, [SMOKE_SCRIPT], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          KIEMPAD_BOOTSTRAP_SMOKE_INJECT_PLAINTEXT_LEAK: '1',
        },
      });
    } catch (error) {
      const output = `${String((error as { stdout?: unknown }).stdout ?? '')}\n${String(
        (error as { stderr?: unknown }).stderr ?? '',
      )}`;
      expect(output).not.toContain('central bootstrap smoke passphrase');
      expect(output).not.toContain('kiempad-session-');
      expect(output).not.toContain('Centrale bootstrap poging');
      expect(output).not.toContain('gevoelige fertiliteitsnotitie');
      expect(output).toContain('Central dataset bootstrap smoke failed');
      return;
    }

    throw new Error('Expected smoke command to fail with injected plaintext boundary.');
  }, 15_000);
});
