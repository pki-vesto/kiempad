import { describe, expect, it } from 'vitest';
import { MemoryCentralDatabasePersistence } from '../src/storage/centralDatabase';
import { runCentralDatasetBootstrapSmoke } from '../src/storage/centralDatasetBootstrapSmoke';

describe('central dataset bootstrap smoke', () => {
  it('doorloopt centrale dataset bootstrap over tweede apparaat en restart zonder plaintext leak', async () => {
    const persistence = new MemoryCentralDatabasePersistence();

    const result = await runCentralDatasetBootstrapSmoke({
      persistence,
      userId: 'peter-en-partner',
      passphrase: 'rooktest centrale passphrase',
      inspectSerializedSnapshot: () => persistence.unsafeSerializedSnapshotForTest(),
    });

    expect(result).toEqual({
      mode: 'central-encrypted',
      userId: 'peter-en-partner',
      initialRecordCount: 0,
      firstDeviceWriteVisible: true,
      secondDeviceReadVisible: true,
      restartedReadVisible: true,
      wrongPassphraseRejected: true,
      plaintextBoundary: {
        inspected: true,
        leaked: false,
        checkedNeedleCount: 5,
      },
    });

    const serialized = persistence.unsafeSerializedSnapshotForTest();
    expect(serialized).toContain('"ownerUserId":"peter-en-partner"');
    expect(serialized).toContain('"alg":"AES-256-GCM"');
    expect(serialized).toContain('"replayProtection"');
    expect(serialized).not.toContain('Centrale bootstrap poging');
    expect(serialized).not.toContain('gevoelige fertiliteitsnotitie blijft encrypted');
    expect(serialized).not.toContain('rooktest centrale passphrase');
    expect(serialized).not.toContain('central bootstrap smoke wrong passphrase');
  });

  it('rapporteert expliciet wanneer snapshotinspectie niet beschikbaar is', async () => {
    const result = await runCentralDatasetBootstrapSmoke({
      persistence: new MemoryCentralDatabasePersistence(),
    });

    expect(result).toMatchObject({
      mode: 'central-encrypted',
      initialRecordCount: 0,
      firstDeviceWriteVisible: true,
      secondDeviceReadVisible: true,
      restartedReadVisible: true,
      wrongPassphraseRejected: true,
      plaintextBoundary: {
        inspected: false,
        leaked: false,
        checkedNeedleCount: 0,
      },
    });
    expect(JSON.stringify(result)).not.toContain('central bootstrap smoke passphrase');
    expect(JSON.stringify(result)).not.toContain('gevoelige fertiliteitsnotitie');
  });
});
