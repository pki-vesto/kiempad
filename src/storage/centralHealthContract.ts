import type { CentralHealthResponse } from './centralHttpApi';

export type CentralHealthContractFailure =
  | 'invalid-json'
  | 'invalid-shape'
  | 'missing-field'
  | 'unexpected-field'
  | 'unexpected-contract-version'
  | 'unexpected-value'
  | 'unexpected-error-states'
  | 'forbidden-privacy-field';

export type CentralHealthContractValidation =
  | { ok: true; contractVersion: 1 }
  | { ok: false; failure: CentralHealthContractFailure };

export type CentralHealthMonitorCiAnnotation =
  | { ok: true; ciAnnotation: 'central-health-contract ok: contractVersion=1' }
  | {
      ok: false;
      ciAnnotation: `central-health-contract failed: failure=${CentralHealthContractFailure} recovery=review-contractVersion-and-run-health-smokes`;
    };

const EXPECTED_HEALTH_CONTRACT: CentralHealthResponse = {
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
};

const EXPECTED_HEALTH_KEYS = Object.keys(EXPECTED_HEALTH_CONTRACT).sort();
const hasOwn = Object.prototype.hasOwnProperty;
const FORBIDDEN_HEALTH_PRIVACY_FIELDS = [
  'ownerUserId',
  'userId',
  'sessionId',
  'recordId',
  'recordCount',
  'ciphertext',
  'api key',
  'diagnose',
  'dosering',
  'kansberekening',
  'behandelkeuzeadvies',
] as const;

export function validateCentralHealthContractBody(body: string): CentralHealthContractValidation {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch (_error) {
    return { ok: false, failure: 'invalid-json' };
  }
  return validateCentralHealthContract(parsed);
}

export function validateCentralHealthContract(value: unknown): CentralHealthContractValidation {
  if (!isRecord(value)) {
    return { ok: false, failure: 'invalid-shape' };
  }

  const actualKeys = Object.keys(value).sort();
  const serialized = JSON.stringify(value);
  if (FORBIDDEN_HEALTH_PRIVACY_FIELDS.some((field) => serialized.includes(field))) {
    return { ok: false, failure: 'forbidden-privacy-field' };
  }

  if (EXPECTED_HEALTH_KEYS.some((key) => !hasOwn.call(value, key))) {
    return { ok: false, failure: 'missing-field' };
  }
  if (actualKeys.some((key) => !EXPECTED_HEALTH_KEYS.includes(key))) {
    return { ok: false, failure: 'unexpected-field' };
  }
  if (value.contractVersion !== EXPECTED_HEALTH_CONTRACT.contractVersion) {
    return { ok: false, failure: 'unexpected-contract-version' };
  }

  for (const [key, expected] of Object.entries(EXPECTED_HEALTH_CONTRACT)) {
    if (key === 'errorStates') continue;
    if (value[key] !== expected) {
      return { ok: false, failure: 'unexpected-value' };
    }
  }

  if (
    !Array.isArray(value.errorStates) ||
    JSON.stringify(value.errorStates) !== JSON.stringify(EXPECTED_HEALTH_CONTRACT.errorStates)
  ) {
    return { ok: false, failure: 'unexpected-error-states' };
  }

  return { ok: true, contractVersion: 1 };
}

export function buildCentralHealthMonitorCiAnnotation(
  validation: CentralHealthContractValidation,
): CentralHealthMonitorCiAnnotation {
  if (validation.ok) {
    return {
      ok: true,
      ciAnnotation: 'central-health-contract ok: contractVersion=1',
    };
  }

  return {
    ok: false,
    ciAnnotation: `central-health-contract failed: failure=${validation.failure} recovery=review-contractVersion-and-run-health-smokes`,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
