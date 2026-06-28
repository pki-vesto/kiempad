import { runCentralDatasetBootstrapSmoke } from '../src/storage/centralDatasetBootstrapSmoke';
import { MemoryCentralDatabasePersistence } from '../src/storage/centralDatabase';

const FAILURE_INJECTION_NEEDLE = 'Centrale bootstrap poging';
type BootstrapSmokePhaseCode =
  | 'first-device-write'
  | 'second-device-read'
  | 'restart-read'
  | 'wrong-key'
  | 'plaintext-boundary'
  | 'snapshot-inspection'
  | 'runtime';

type BootstrapSmokeDiagnostic = {
  status: 'failed';
  phaseCode: BootstrapSmokePhaseCode;
  recoveryHint: string;
};

async function main(): Promise<void> {
  const persistence = new MemoryCentralDatabasePersistence();
  const result = await runCentralDatasetBootstrapSmoke({
    persistence,
    inspectSerializedSnapshot: () => {
      const serialized = persistence.unsafeSerializedSnapshotForTest();
      if (process.env.KIEMPAD_BOOTSTRAP_SMOKE_INJECT_PLAINTEXT_LEAK === '1') {
        return `${serialized}\n${FAILURE_INJECTION_NEEDLE}`;
      }
      return serialized;
    },
  });
  if (process.env.KIEMPAD_BOOTSTRAP_SMOKE_FORCE_SECOND_DEVICE_FAILURE === '1') {
    result.secondDeviceReadVisible = false;
  }

  const diagnostic = diagnoseBootstrapSmokeFailure(result);
  if (diagnostic) {
    writeDiagnostic(diagnostic);
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        status: 'ok',
        mode: result.mode,
        initialRecordCount: result.initialRecordCount,
        firstDeviceWriteVisible: result.firstDeviceWriteVisible,
        secondDeviceReadVisible: result.secondDeviceReadVisible,
        restartedReadVisible: result.restartedReadVisible,
        wrongPassphraseRejected: result.wrongPassphraseRejected,
        plaintextBoundary: result.plaintextBoundary,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

main().catch((error) => {
  writeDiagnostic({
    status: 'failed',
    phaseCode: 'runtime',
    recoveryHint: error instanceof Error ? 'Controleer centrale bootstrap runtime.' : 'Onbekende runtimefout.',
  });
  process.exit(1);
});

function diagnoseBootstrapSmokeFailure(
  result: Awaited<ReturnType<typeof runCentralDatasetBootstrapSmoke>>,
): BootstrapSmokeDiagnostic | undefined {
  if (!result.firstDeviceWriteVisible) {
    return {
      status: 'failed',
      phaseCode: 'first-device-write',
      recoveryHint: 'Controleer centrale sessie, encrypted repository write en persistence.',
    };
  }
  if (!result.secondDeviceReadVisible) {
    return {
      status: 'failed',
      phaseCode: 'second-device-read',
      recoveryHint: 'Controleer gedeelde centrale user-scope, sleutelmetadata en recordlist.',
    };
  }
  if (!result.restartedReadVisible) {
    return {
      status: 'failed',
      phaseCode: 'restart-read',
      recoveryHint: 'Controleer centrale persistence save/load en snapshotvalidatie.',
    };
  }
  if (!result.wrongPassphraseRejected) {
    return {
      status: 'failed',
      phaseCode: 'wrong-key',
      recoveryHint: 'Controleer passphrase verifier en sleutelvalidatie.',
    };
  }
  if (!result.plaintextBoundary.inspected) {
    return {
      status: 'failed',
      phaseCode: 'snapshot-inspection',
      recoveryHint: 'Controleer of de smoke toegang heeft tot de technische snapshotinspectie.',
    };
  }
  if (result.plaintextBoundary.leaked) {
    return {
      status: 'failed',
      phaseCode: 'plaintext-boundary',
      recoveryHint: 'Controleer encrypted envelope boundary en centrale snapshotserialisatie.',
    };
  }
  return undefined;
}

function writeDiagnostic(diagnostic: BootstrapSmokeDiagnostic): void {
  console.error(JSON.stringify(diagnostic, null, 2));
}
