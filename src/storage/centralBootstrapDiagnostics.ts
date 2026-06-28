export type BootstrapSmokePhaseCode =
  | 'first-device-write'
  | 'second-device-read'
  | 'restart-read'
  | 'wrong-key'
  | 'plaintext-boundary'
  | 'snapshot-inspection'
  | 'runtime';

export type BootstrapSmokeRedactionCategory =
  | 'passphrase'
  | 'bearer-token'
  | 'filename'
  | 'ocr-base64'
  | 'medical-plaintext';

export type BootstrapSmokeDiagnosticInjection = {
  envName: string;
  phaseCode: BootstrapSmokePhaseCode;
  redactionCategories: readonly BootstrapSmokeRedactionCategory[];
};

export const BOOTSTRAP_SMOKE_REDACTION_CATEGORIES = [
  'passphrase',
  'bearer-token',
  'filename',
  'ocr-base64',
  'medical-plaintext',
] as const satisfies readonly BootstrapSmokeRedactionCategory[];

export const BOOTSTRAP_SMOKE_RUNTIME_FAILURE_FIXTURE_TEXT =
  'central bootstrap smoke passphrase kiempad-session-forged echo-foto-privenaam.jpg OCR base64 gevoelige fertiliteitsnotitie';

export const BOOTSTRAP_SMOKE_DIAGNOSTIC_INJECTIONS = [
  {
    envName: 'KIEMPAD_BOOTSTRAP_SMOKE_FORCE_FIRST_DEVICE_FAILURE',
    phaseCode: 'first-device-write',
    redactionCategories: BOOTSTRAP_SMOKE_REDACTION_CATEGORIES,
  },
  {
    envName: 'KIEMPAD_BOOTSTRAP_SMOKE_FORCE_SECOND_DEVICE_FAILURE',
    phaseCode: 'second-device-read',
    redactionCategories: BOOTSTRAP_SMOKE_REDACTION_CATEGORIES,
  },
  {
    envName: 'KIEMPAD_BOOTSTRAP_SMOKE_FORCE_RESTART_FAILURE',
    phaseCode: 'restart-read',
    redactionCategories: BOOTSTRAP_SMOKE_REDACTION_CATEGORIES,
  },
  {
    envName: 'KIEMPAD_BOOTSTRAP_SMOKE_FORCE_WRONG_KEY_FAILURE',
    phaseCode: 'wrong-key',
    redactionCategories: BOOTSTRAP_SMOKE_REDACTION_CATEGORIES,
  },
  {
    envName: 'KIEMPAD_BOOTSTRAP_SMOKE_FORCE_SNAPSHOT_INSPECTION_FAILURE',
    phaseCode: 'snapshot-inspection',
    redactionCategories: BOOTSTRAP_SMOKE_REDACTION_CATEGORIES,
  },
  {
    envName: 'KIEMPAD_BOOTSTRAP_SMOKE_INJECT_PLAINTEXT_LEAK',
    phaseCode: 'plaintext-boundary',
    redactionCategories: BOOTSTRAP_SMOKE_REDACTION_CATEGORIES,
  },
  {
    envName: 'KIEMPAD_BOOTSTRAP_SMOKE_FORCE_RUNTIME_FAILURE',
    phaseCode: 'runtime',
    redactionCategories: BOOTSTRAP_SMOKE_REDACTION_CATEGORIES,
  },
] as const satisfies readonly BootstrapSmokeDiagnosticInjection[];

export const BOOTSTRAP_SMOKE_PHASE_CODES = BOOTSTRAP_SMOKE_DIAGNOSTIC_INJECTIONS.map(
  (injection) => injection.phaseCode,
);

export function bootstrapSmokeInjectionEnvForPhase(
  phaseCode: BootstrapSmokePhaseCode,
): string | undefined {
  return BOOTSTRAP_SMOKE_DIAGNOSTIC_INJECTIONS.find(
    (injection) => injection.phaseCode === phaseCode,
  )?.envName;
}

export function isBootstrapSmokeDiagnosticInjectionEnabled(
  env: NodeJS.ProcessEnv,
  phaseCode: BootstrapSmokePhaseCode,
): boolean {
  const envName = bootstrapSmokeInjectionEnvForPhase(phaseCode);
  return envName !== undefined && env[envName] === '1';
}
