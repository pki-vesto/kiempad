import { describe, expect, it } from 'vitest';
import { ALLOWED_SECRET_EXAMPLES, scanSecretText } from '../scripts/check-secrets.mjs';

describe('secrets scan', () => {
  it('detecteert gangbare API keys, tokens en private keys', () => {
    const findings = scanSecretText(
      'fixture.txt',
      [
        `OPENAI_API_KEY=${'sk-proj-'}AbCdEfGhIjKlMnOpQrStUvWxYz123456`,
        `GITHUB_TOKEN=${'ghp_'}abcdefghijklmnopqrstuvwxyz1234567890`,
        `TS_AUTHKEY=${'tskey-auth-'}AbCdEfGhIjKlMnOpQrStUvWxYz123456`,
        `AWS_ACCESS_KEY_ID=${'AKIA'}1234567890ABCDEF`,
        `${'-----BEGIN '}PRIVATE KEY-----`,
      ].join('\n'),
    );

    expect(findings.map((finding) => finding.pattern)).toEqual([
      'generic-sk-api-key',
      'github-token',
      'tailscale-auth-key',
      'aws-access-key',
      'private-key-block',
    ]);
    expect(findings[0]).toMatchObject({
      filePath: 'fixture.txt',
      line: 1,
      preview: 'sk-p...3456',
    });
  });

  it('houdt de allowlist expliciet en beperkt tot synthetische voorbeelden', () => {
    expect([...ALLOWED_SECRET_EXAMPLES].sort()).toEqual(['sk-test-secret', 'tskey-auth-...']);
    expect(scanSecretText('settingsStore.test.ts', 'apiKey: "sk-test-secret"')).toEqual([]);
    expect(scanSecretText('runbook.md', 'TS_AUTHKEY=tskey-auth-...')).toEqual([]);
  });
});
