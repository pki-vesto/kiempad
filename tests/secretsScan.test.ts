import { describe, expect, it } from 'vitest';
import {
  ALLOWED_SECRET_EXAMPLES,
  scanSecretText,
  validateSecretAllowlist,
} from '../scripts/check-secrets.mjs';

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
    expect(ALLOWED_SECRET_EXAMPLES.map((entry) => entry.value).sort()).toEqual([
      'sk-test-secret',
      'tskey-auth-...',
    ]);
    expect(validateSecretAllowlist(ALLOWED_SECRET_EXAMPLES)).toEqual([]);
    expect(scanSecretText('settingsStore.test.ts', 'apiKey: "sk-test-secret"')).toEqual([]);
    expect(scanSecretText('runbook.md', 'TS_AUTHKEY=tskey-auth-...')).toEqual([]);
    expect(
      validateSecretAllowlist([
        {
          value: `${'sk-'}example-placeholder`,
          reason: '',
        },
      ]),
    ).toEqual([`Allowlist-entry ${'sk-'}example-placeholder mist een concrete rationale.`]);
  });

  it('staat projectplaceholders toe maar blijft realistische AI- en Tailscale-keys blokkeren', () => {
    const forbiddenAiKey = `${'sk-ant-'}AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`;
    const forbiddenTailscaleKey = `${'tskey-auth-'}AbCdEfGhIjKlMnOpQrStUvWxYz123456`;

    expect(scanSecretText('.env.example', 'OPENAI_API_KEY=')).toEqual([]);
    expect(scanSecretText('docs/example.md', 'AI sleutel: sk-...')).toEqual([]);
    expect(scanSecretText('docs/example.md', `ANTHROPIC_API_KEY=${forbiddenAiKey}`)).toEqual([
      {
        filePath: 'docs/example.md',
        line: 1,
        pattern: 'anthropic-api-key',
        preview: 'sk-a...7890',
      },
    ]);
    expect(scanSecretText('docs/tailscale.md', `TS_AUTHKEY=${forbiddenTailscaleKey}`)).toEqual([
      {
        filePath: 'docs/tailscale.md',
        line: 1,
        pattern: 'tailscale-auth-key',
        preview: 'tske...3456',
      },
    ]);
  });
});
