import { runCentralDatasetBootstrapSmoke } from '../src/storage/centralDatasetBootstrapSmoke';
import { MemoryCentralDatabasePersistence } from '../src/storage/centralDatabase';

const FAILURE_INJECTION_NEEDLE = 'Centrale bootstrap poging';

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

  if (
    !result.firstDeviceWriteVisible ||
    !result.secondDeviceReadVisible ||
    !result.restartedReadVisible ||
    !result.wrongPassphraseRejected ||
    !result.plaintextBoundary.inspected ||
    result.plaintextBoundary.leaked
  ) {
    throw new Error('central-bootstrap-smoke-failed');
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
  const code = error instanceof Error ? error.message : 'central-bootstrap-smoke-failed';
  console.error(`Central dataset bootstrap smoke failed: ${code}`);
  process.exit(1);
});
