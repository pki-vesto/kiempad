import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';
import workflowRaw from '../.github/workflows/ci.yml?raw';
import packageJsonRaw from '../package.json?raw';
import governanceScriptRaw from '../scripts/bootstrap-governance-freshness.mjs?raw';

const execFileAsync = promisify(execFile);

describe('bootstrap diagnostic governance freshness gate', () => {
  it('biedt een npm- en CI-gate voor de governancechecklist', () => {
    const pkg = JSON.parse(packageJsonRaw) as { scripts: Record<string, string> };

    expect(pkg.scripts['governance:bootstrap']).toBe(
      'node scripts/bootstrap-governance-freshness.mjs',
    );
    expect(workflowRaw).toContain('Bootstrap governance freshness');
    expect(workflowRaw).toContain('npm run governance:bootstrap');
    expect(governanceScriptRaw).toContain('bootstrap-governance-freshness');
    expect(governanceScriptRaw).toContain('REQUIRED_CHECKLIST_MARKERS');
  });

  it('rapporteert checklistdekking met gesanitized technische output', async () => {
    const { stdout, stderr } = await execFileAsync('node', [
      'scripts/bootstrap-governance-freshness.mjs',
    ]);
    const report = JSON.parse(stdout) as {
      status: string;
      gate: string;
      coverage: Record<string, string>;
    };

    expect(stderr).toBe('');
    expect(report).toEqual({
      status: 'ok',
      gate: 'bootstrap-governance-freshness',
      coverage: {
        registry: 'ok',
        schemaGuard: 'ok',
        snapshot: 'ok',
        runbookReview: 'ok',
        ciStep: 'ok',
      },
    });

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
    }
  });
});
