import { describe, expect, it } from 'vitest';
import sensitiveFixturePolicy from '../docs/SENSITIVE_FIXTURE_POLICY.md?raw';
import packageJson from '../package.json?raw';
import {
  ALLOWED_SENSITIVE_FIXTURE_EXAMPLES,
  scanSensitiveFixtureFiles,
  scanSensitiveFixtureText,
  validateSensitiveFixtureAllowlist,
} from '../scripts/check-sensitive-fixtures.mjs';

describe('sensitive fixture policy', () => {
  it('documenteert synthetische-only fixture regels', () => {
    expect(sensitiveFixturePolicy).toContain('Testpersoon A');
    expect(sensitiveFixturePolicy).toContain('voorbeeld.test');
    expect(sensitiveFixturePolicy).toContain('BSN: 111111111');
    expect(sensitiveFixturePolicy).toContain('npm run fixtures:check');
    expect(sensitiveFixturePolicy).toContain('geen echte patiënt');
    expect(sensitiveFixturePolicy).toContain('Allowlist governance');
    expect(sensitiveFixturePolicy).toContain('concrete rationale');
    expect(sensitiveFixturePolicy).toContain('Review de allowlist maandelijks');
  });

  it('detecteert niet-synthetische fixturepatronen', () => {
    const realLookingName = `Naam: ${'Pet'}er`;
    const realLookingEmail = `E-mail: ${'peter'}@example.com`;
    const realLookingBsn = `BSN: ${'123'}456789`;

    const findings = scanSensitiveFixtureText(
      'tests/fixture.test.ts',
      [
        realLookingName,
        realLookingEmail,
        realLookingBsn,
        'Naam: Testpersoon A',
        'E-mail: testpersoon@example.test',
        'BSN: 111111111',
      ].join('\n'),
    );

    expect(findings.map((finding) => finding.pattern).sort()).toEqual([
      'non-synthetic-email',
      'real-person-name-field',
      'realistic-bsn-fixture',
    ]);
  });

  it('heeft een fixturecheck script en houdt bestaande testfixtures schoon', () => {
    expect(JSON.parse(packageJson).scripts['fixtures:check']).toBe(
      'node scripts/check-sensitive-fixtures.mjs',
    );
    expect(scanSensitiveFixtureFiles()).toEqual([]);
  });

  it('vereist rationale voor iedere gevoelige-fixture allowlist entry', () => {
    expect(validateSensitiveFixtureAllowlist(ALLOWED_SENSITIVE_FIXTURE_EXAMPLES)).toEqual([]);
    expect(ALLOWED_SENSITIVE_FIXTURE_EXAMPLES.map((entry) => entry.value).sort()).toEqual([
      'BSN: 111111111',
      'E-mail: testpersoon@example.test',
      'E-mail: testpersoon@voorbeeld.test',
      'Naam: Testpersoon A',
      'Naam: Testpersoon B',
    ]);
    expect(
      validateSensitiveFixtureAllowlist([
        {
          value: 'Naam: Testpersoon C',
          reason: '',
        },
      ]),
    ).toEqual(['Allowlist-entry Naam: Testpersoon C mist een concrete rationale.']);
  });
});
