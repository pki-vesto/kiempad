import {
  CentralEncryptedApiClientDriver,
  CentralEncryptedApiServer,
  MemoryCentralSessionStore,
} from './centralApi';
import type { CentralDatabasePersistence } from './centralDatabase';
import { PersistedCentralEncryptedDatabase } from './centralDatabase';
import { EncryptedRecordRepository } from './encryptedRepository';
import { VaultSession } from './vaultSession';

export type CentralDatasetBootstrapSmokeOptions = {
  persistence: CentralDatabasePersistence;
  userId?: string;
  passphrase?: string;
  inspectSerializedSnapshot?: () => string | undefined;
};

export type CentralDatasetBootstrapSmokeResult = {
  mode: 'central-encrypted';
  userId: string;
  initialRecordCount: number;
  firstDeviceWriteVisible: boolean;
  secondDeviceReadVisible: boolean;
  restartedReadVisible: boolean;
  wrongPassphraseRejected: boolean;
  plaintextBoundary: {
    inspected: boolean;
    leaked: boolean;
    checkedNeedleCount: number;
  };
};

type SmokeRecord = {
  id: string;
  titel: string;
  gevoeligeNotitie: string;
};

const DEFAULT_USER_ID = 'central-bootstrap-smoke-user';
const DEFAULT_PASSPHRASE = 'central bootstrap smoke passphrase';
const WRONG_PASSPHRASE = 'central bootstrap smoke wrong passphrase';
const SMOKE_RECORD_ID = 'central-bootstrap-smoke-record';
const SMOKE_RECORD: SmokeRecord = {
  id: SMOKE_RECORD_ID,
  titel: 'Centrale bootstrap poging',
  gevoeligeNotitie: 'gevoelige fertiliteitsnotitie blijft encrypted',
};
const PLAINTEXT_NEEDLES = [
  SMOKE_RECORD.titel,
  SMOKE_RECORD.gevoeligeNotitie,
  DEFAULT_PASSPHRASE,
  WRONG_PASSPHRASE,
];

export async function runCentralDatasetBootstrapSmoke(
  options: CentralDatasetBootstrapSmokeOptions,
): Promise<CentralDatasetBootstrapSmokeResult> {
  const userId = options.userId?.trim() || DEFAULT_USER_ID;
  const passphrase = options.passphrase?.trim() || DEFAULT_PASSPHRASE;

  const firstServer = await createSmokeServer(options.persistence);
  const firstDriver = await createSmokeDriver(firstServer, userId);
  const initialRecordCount = (await firstDriver.listRecords()).length;
  const firstVault = new VaultSession(firstDriver, { autoLockMs: 60_000 });
  await firstVault.initializeOrUnlock(passphrase);
  await new EncryptedRecordRepository<SmokeRecord>(firstDriver, firstVault, 'traject').saveWithId(
    SMOKE_RECORD,
  );

  const firstDeviceWriteVisible = Boolean(
    await new EncryptedRecordRepository<SmokeRecord>(firstDriver, firstVault, 'traject').get(
      SMOKE_RECORD_ID,
    ),
  );
  const secondDriver = await createSmokeDriver(firstServer, userId);
  const secondVault = new VaultSession(secondDriver, { autoLockMs: 60_000 });
  await secondVault.initializeOrUnlock(passphrase);
  const secondDeviceReadVisible = Boolean(
    await new EncryptedRecordRepository<SmokeRecord>(secondDriver, secondVault, 'traject').get(
      SMOKE_RECORD_ID,
    ),
  );

  const restartedServer = await createSmokeServer(options.persistence);
  const wrongKeyDriver = await createSmokeDriver(restartedServer, userId);
  const wrongKeyVault = new VaultSession(wrongKeyDriver, { autoLockMs: 60_000 });
  const wrongPassphraseRejected = await rejectsWrongPassphrase(wrongKeyVault);
  const restartedDriver = await createSmokeDriver(restartedServer, userId);
  const restartedVault = new VaultSession(restartedDriver, { autoLockMs: 60_000 });
  await restartedVault.initializeOrUnlock(passphrase);
  const restartedReadVisible = Boolean(
    await new EncryptedRecordRepository<SmokeRecord>(
      restartedDriver,
      restartedVault,
      'traject',
    ).get(SMOKE_RECORD_ID),
  );

  const plaintextBoundary = inspectPlaintextBoundary(
    options.inspectSerializedSnapshot?.(),
    passphrase,
  );

  return {
    mode: 'central-encrypted',
    userId,
    initialRecordCount,
    firstDeviceWriteVisible,
    secondDeviceReadVisible,
    restartedReadVisible,
    wrongPassphraseRejected,
    plaintextBoundary,
  };
}

async function createSmokeServer(
  persistence: CentralDatabasePersistence,
): Promise<CentralEncryptedApiServer> {
  return new CentralEncryptedApiServer(
    await PersistedCentralEncryptedDatabase.open(persistence),
    new MemoryCentralSessionStore(),
  );
}

async function createSmokeDriver(
  server: CentralEncryptedApiServer,
  userId: string,
): Promise<CentralEncryptedApiClientDriver> {
  const ticket = await server.issueSession({ userId });
  return new CentralEncryptedApiClientDriver(server, ticket.token);
}

async function rejectsWrongPassphrase(vault: VaultSession): Promise<boolean> {
  try {
    await vault.initializeOrUnlock(WRONG_PASSPHRASE);
    return false;
  } catch (_error) {
    return true;
  }
}

function inspectPlaintextBoundary(
  serializedSnapshot: string | undefined,
  passphrase: string,
): CentralDatasetBootstrapSmokeResult['plaintextBoundary'] {
  if (serializedSnapshot === undefined) {
    return {
      inspected: false,
      leaked: false,
      checkedNeedleCount: 0,
    };
  }

  const needles = [...PLAINTEXT_NEEDLES, passphrase];
  return {
    inspected: true,
    leaked: needles.some((needle) => serializedSnapshot.includes(needle)),
    checkedNeedleCount: needles.length,
  };
}
