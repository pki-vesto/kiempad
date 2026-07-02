import {
  buildCentralHealthMonitorCiAnnotation,
  validateCentralHealthContractBody,
} from '../src/storage/centralHealthContract';

type HealthMonitorFixture =
  | 'ok'
  | 'unexpected-contract-version'
  | 'unexpected-field'
  | 'unexpected-error-states'
  | 'forbidden-privacy-field';

const HEALTH_MONITOR_FIXTURES: Record<HealthMonitorFixture, unknown> = {
  ok: {
    status: 'ok',
    contractVersion: 1,
    service: 'kiempad-central-encrypted-api',
    storageMode: 'central-api',
    encryptionBoundary: 'client-side-encrypted-envelopes',
    backendVisibility: 'technical-metadata-only',
    medicalPlaintext: false,
    dataRoutes: 'bearer-session-required',
    emptyState: 'no-user-dataset-opened',
    errorStates: ['unauthorized', 'forbidden', 'central-api-error', 'central-replay-conflict'],
  },
  'unexpected-contract-version': {
    status: 'ok',
    contractVersion: 2,
    service: 'kiempad-central-encrypted-api',
    storageMode: 'central-api',
    encryptionBoundary: 'client-side-encrypted-envelopes',
    backendVisibility: 'technical-metadata-only',
    medicalPlaintext: false,
    dataRoutes: 'bearer-session-required',
    emptyState: 'no-user-dataset-opened',
    errorStates: ['unauthorized', 'forbidden', 'central-api-error', 'central-replay-conflict'],
  },
  'unexpected-field': {
    status: 'ok',
    contractVersion: 1,
    service: 'kiempad-central-encrypted-api',
    storageMode: 'central-api',
    encryptionBoundary: 'client-side-encrypted-envelopes',
    backendVisibility: 'technical-metadata-only',
    medicalPlaintext: false,
    dataRoutes: 'bearer-session-required',
    emptyState: 'no-user-dataset-opened',
    errorStates: ['unauthorized', 'forbidden', 'central-api-error', 'central-replay-conflict'],
    uptimeSeconds: 123,
  },
  'unexpected-error-states': {
    status: 'ok',
    contractVersion: 1,
    service: 'kiempad-central-encrypted-api',
    storageMode: 'central-api',
    encryptionBoundary: 'client-side-encrypted-envelopes',
    backendVisibility: 'technical-metadata-only',
    medicalPlaintext: false,
    dataRoutes: 'bearer-session-required',
    emptyState: 'no-user-dataset-opened',
    errorStates: ['unauthorized', 'central-api-error'],
  },
  'forbidden-privacy-field': {
    status: 'ok',
    contractVersion: 1,
    service: 'kiempad-central-encrypted-api',
    storageMode: 'central-api',
    encryptionBoundary: 'client-side-encrypted-envelopes',
    backendVisibility: 'technical-metadata-only',
    medicalPlaintext: false,
    dataRoutes: 'bearer-session-required',
    emptyState: 'no-user-dataset-opened',
    errorStates: ['unauthorized', 'forbidden', 'central-api-error', 'central-replay-conflict'],
    userId: 'user-peter',
    sessionId: 'kiempad-session-secret',
    recordId: 'record-sensitive',
    ciphertext: 'encrypted-ciphertext',
    diagnose: 'Progesteron',
    dosering: '123 mg',
    behandelkeuzeadvies: 'start behandeling',
  },
};

const fixture = parseFixture(process.argv.slice(2));
const validation = validateCentralHealthContractBody(JSON.stringify(HEALTH_MONITOR_FIXTURES[fixture]));
const annotation = buildCentralHealthMonitorCiAnnotation(validation);

console.log(
  JSON.stringify(
    {
      status: annotation.ok ? 'ok' : 'failed',
      ciAnnotation: annotation.ciAnnotation,
    },
    null,
    2,
  ),
);
process.exit(annotation.ok ? 0 : 1);

function parseFixture(args: string[]): HealthMonitorFixture {
  const fixtureArg = args.find((arg) => arg.startsWith('--fixture='));
  const fixture = fixtureArg?.slice('--fixture='.length) ?? 'ok';
  if (isHealthMonitorFixture(fixture)) return fixture;

  console.error(
    JSON.stringify(
      {
        status: 'failed',
        ciAnnotation:
          'central-health-contract failed: failure=invalid-shape recovery=review-contractVersion-and-run-health-smokes',
      },
      null,
      2,
    ),
  );
  process.exit(2);
}

function isHealthMonitorFixture(value: string): value is HealthMonitorFixture {
  return Object.hasOwn(HEALTH_MONITOR_FIXTURES, value);
}
