import { describe, expect, it } from 'vitest';

import {
  validateCentralHealthContract,
  validateCentralHealthContractBody,
} from '../src/storage/centralHealthContract';

const validHealthContract = {
  status: 'ok',
  contractVersion: 1,
  service: 'kiempad-central-encrypted-api',
  storageMode: 'central-api',
  encryptionBoundary: 'client-side-encrypted-envelopes',
  backendVisibility: 'technical-metadata-only',
  medicalPlaintext: false,
  dataRoutes: 'bearer-session-required',
  emptyState: 'no-user-dataset-opened',
  errorStates: ['unauthorized', 'forbidden', 'central-api-error'],
} as const;

describe('G1082 central health monitor compatibility fixture', () => {
  it('accepteert het huidige contractVersion=1 health-contract', () => {
    expect(validateCentralHealthContractBody(JSON.stringify(validHealthContract))).toEqual({
      ok: true,
      contractVersion: 1,
    });
  });

  it('faalt veilig met gesanitized foutlabels voor ongeldige input', () => {
    expect(validateCentralHealthContractBody('{')).toEqual({
      ok: false,
      failure: 'invalid-json',
    });
    expect(validateCentralHealthContract(null)).toEqual({
      ok: false,
      failure: 'invalid-shape',
    });
  });

  it('detecteert ontbrekende en onverwachte velden zonder payload te lekken', () => {
    const missingService: Partial<Record<keyof typeof validHealthContract, unknown>> = {
      ...validHealthContract,
    };
    delete missingService.service;

    expect(validateCentralHealthContract(missingService)).toEqual({
      ok: false,
      failure: 'missing-field',
    });
    expect(
      validateCentralHealthContract({
        ...validHealthContract,
        uptimeSeconds: 123,
      }),
    ).toEqual({
      ok: false,
      failure: 'unexpected-field',
    });
  });

  it('detecteert version drift, waarde-drift en errorstate-drift', () => {
    expect(validateCentralHealthContract({ ...validHealthContract, contractVersion: 2 })).toEqual({
      ok: false,
      failure: 'unexpected-contract-version',
    });
    expect(
      validateCentralHealthContract({
        ...validHealthContract,
        backendVisibility: 'health-data-visible',
      }),
    ).toEqual({
      ok: false,
      failure: 'unexpected-value',
    });
    expect(
      validateCentralHealthContract({
        ...validHealthContract,
        errorStates: ['unauthorized', 'central-api-error'],
      }),
    ).toEqual({
      ok: false,
      failure: 'unexpected-error-states',
    });
  });

  it('blokkeert privacyvelden met alleen een technisch foutlabel', () => {
    const result = validateCentralHealthContract({
      ...validHealthContract,
      service: 'diagnose',
    });

    expect(result).toEqual({
      ok: false,
      failure: 'forbidden-privacy-field',
    });
    expect(JSON.stringify(result)).not.toContain('diagnose');
  });

  it('lekt geen gevoelige fixturewaarden in failure-output', () => {
    const sensitiveFixture = {
      ...validHealthContract,
      userId: 'user-peter',
      sessionId: 'kiempad-session-secret',
      recordId: 'record-sensitive',
      ciphertext: 'encrypted-ciphertext',
      diagnose: 'Progesteron',
      dosering: '123 mg',
      behandelkeuzeadvies: 'start behandeling',
    };
    const result = validateCentralHealthContract(sensitiveFixture);
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      ok: false,
      failure: 'forbidden-privacy-field',
    });
    for (const forbidden of [
      'user-peter',
      'kiempad-session-secret',
      'record-sensitive',
      'encrypted-ciphertext',
      'Progesteron',
      '123 mg',
      'behandelkeuzeadvies',
      'start behandeling',
    ]) {
      expect(serializedResult).not.toContain(forbidden);
    }
  });
});
