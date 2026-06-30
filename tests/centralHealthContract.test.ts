import { describe, expect, it } from 'vitest';

import {
  buildCentralHealthMonitorCiAnnotation,
  CENTRAL_HEALTH_MONITOR_CI_FAILURE_PREFIX,
  CENTRAL_HEALTH_MONITOR_CI_RECOVERY_HINT,
  CENTRAL_HEALTH_MONITOR_CI_SUCCESS_ANNOTATION,
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

describe('G1084 central health monitor CI annotation evidence', () => {
  it('maakt een gesanitized success-annotatie voor contractVersion=1', () => {
    expect(buildCentralHealthMonitorCiAnnotation({ ok: true, contractVersion: 1 })).toEqual({
      ok: true,
      ciAnnotation: CENTRAL_HEALTH_MONITOR_CI_SUCCESS_ANNOTATION,
    });
  });

  it('houdt version, field en errorstate drift herkenbaar in CI-annotaties', () => {
    for (const [fixture, expectedFailure] of [
      [{ ...validHealthContract, contractVersion: 2 }, 'unexpected-contract-version'],
      [{ ...validHealthContract, uptimeSeconds: 123 }, 'unexpected-field'],
      [
        { ...validHealthContract, errorStates: ['unauthorized', 'central-api-error'] },
        'unexpected-error-states',
      ],
    ] as const) {
      const validation = validateCentralHealthContract(fixture);

      expect(buildCentralHealthMonitorCiAnnotation(validation)).toEqual({
        ok: false,
        ciAnnotation: `${CENTRAL_HEALTH_MONITOR_CI_FAILURE_PREFIX}${expectedFailure} recovery=${CENTRAL_HEALTH_MONITOR_CI_RECOVERY_HINT}`,
      });
    }
  });

  it('lekt geen responsepayload of gevoelige waarden in CI-annotaties', () => {
    const validation = validateCentralHealthContract({
      ...validHealthContract,
      userId: 'user-peter',
      sessionId: 'kiempad-session-secret',
      recordId: 'record-sensitive',
      ciphertext: 'encrypted-ciphertext',
      diagnose: 'Progesteron',
      dosering: '123 mg',
      behandelkeuzeadvies: 'start behandeling',
    });
    const annotation = buildCentralHealthMonitorCiAnnotation(validation).ciAnnotation;

    expect(annotation).toBe(
      `${CENTRAL_HEALTH_MONITOR_CI_FAILURE_PREFIX}forbidden-privacy-field recovery=${CENTRAL_HEALTH_MONITOR_CI_RECOVERY_HINT}`,
    );
    for (const forbidden of [
      'user-peter',
      'kiempad-session-secret',
      'record-sensitive',
      'encrypted-ciphertext',
      'Progesteron',
      '123 mg',
      'behandelkeuzeadvies',
      'start behandeling',
      'responsebody',
      'headers',
    ]) {
      expect(annotation).not.toContain(forbidden);
    }
  });
});

describe('G1085 central health monitor annotation runbook drift guard', () => {
  it('houdt de CI-annotatie contracttermen centraal voor helper en fixtures', () => {
    expect(CENTRAL_HEALTH_MONITOR_CI_SUCCESS_ANNOTATION).toBe(
      'central-health-contract ok: contractVersion=1',
    );
    expect(CENTRAL_HEALTH_MONITOR_CI_FAILURE_PREFIX).toBe(
      'central-health-contract failed: failure=',
    );
    expect(CENTRAL_HEALTH_MONITOR_CI_RECOVERY_HINT).toBe(
      'review-contractVersion-and-run-health-smokes',
    );

    for (const failure of [
      'unexpected-contract-version',
      'unexpected-field',
      'unexpected-error-states',
    ] as const) {
      expect(buildCentralHealthMonitorCiAnnotation({ ok: false, failure }).ciAnnotation).toBe(
        `${CENTRAL_HEALTH_MONITOR_CI_FAILURE_PREFIX}${failure} recovery=${CENTRAL_HEALTH_MONITOR_CI_RECOVERY_HINT}`,
      );
    }
  });
});
