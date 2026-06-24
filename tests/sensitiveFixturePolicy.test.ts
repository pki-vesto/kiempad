import { describe, expect, it } from 'vitest';
import sensitiveFixturePolicy from '../docs/SENSITIVE_FIXTURE_POLICY.md?raw';
import packageJson from '../package.json?raw';
import {
  scanSensitiveFixtureFiles,
  scanSensitiveFixtureText,
} from '../scripts/check-sensitive-fixtures.mjs';

describe('sensitive fixture policy', () => {
  it('documenteert synthetische-only fixture regels', () => {
    expect(sensitiveFixturePolicy).toContain('Testpersoon A');
    expect(sensitiveFixturePolicy).toContain('voorbeeld.test');
    expect(sensitiveFixturePolicy).toContain('BSN: 111111111');
    expect(sensitiveFixturePolicy).toContain('npm run fixtures:check');
    expect(sensitiveFixturePolicy).toContain('geen echte patiënt');
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
});
