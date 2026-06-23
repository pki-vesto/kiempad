import {
  decryptJson,
  deriveAesKeyBytes,
  type EncryptionEnvelope,
  encryptJson,
  importAesKey,
  KDF_ALGORITHM,
  KDF_ITERATIONS,
} from './crypto';
import { base64ToBytes, bytesToBase64, randomBytes } from './encoding';
import type { EncryptedStorageDriver } from './records';
import { nowIso } from './records';
import { ensureStorageSchema } from './schema';

const CRYPTO_META_KEY = 'crypto';
export const WEBAUTHN_META_KEY = 'webauthn-unlock';

type CryptoMetadata = {
  version: 1;
  kdf: typeof KDF_ALGORITHM;
  iterations: number;
  salt: string;
  createdAt: string;
  verifier: EncryptionEnvelope;
};

type VerifierPayload = {
  purpose: 'kiempad-passphrase-verifier';
  version: 1;
};

type WrappedVaultKeyPayload = {
  purpose: 'kiempad-webauthn-wrapped-vault-key';
  version: 1;
  rawKey: string;
};

export type WebAuthnUnlockMetadata = {
  version: 1;
  credentialId: string;
  prfSalt: string;
  label: string;
  createdAt: string;
  updatedAt: string;
  wrapper: EncryptionEnvelope;
};

export type VaultSessionOptions = {
  autoLockMs?: number;
};

export class VaultSession {
  private key: CryptoKey | null = null;
  private rawKey: Uint8Array | null = null;
  private autoLockTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly autoLockMs: number;

  constructor(
    private readonly driver: EncryptedStorageDriver,
    options: VaultSessionOptions = {},
  ) {
    this.autoLockMs = options.autoLockMs ?? 10 * 60 * 1000;
  }

  async hasVault(): Promise<boolean> {
    return (await this.driver.getMeta<CryptoMetadata>(CRYPTO_META_KEY)) !== undefined;
  }

  async getWebAuthnUnlockMetadata(): Promise<WebAuthnUnlockMetadata | undefined> {
    return this.driver.getMeta<WebAuthnUnlockMetadata>(WEBAUTHN_META_KEY);
  }

  isUnlocked(): boolean {
    return this.key !== null;
  }

  async initializeOrUnlock(passphrase: string): Promise<void> {
    if (passphrase.length < 8) {
      throw new Error('Gebruik een passphrase van minimaal 8 tekens.');
    }

    const metadata = await this.driver.getMeta<CryptoMetadata>(CRYPTO_META_KEY);
    if (!metadata) {
      await this.createVault(passphrase);
      return;
    }

    await this.unlockExistingVault(passphrase, metadata);
  }

  getKey(): CryptoKey {
    if (!this.key) {
      throw new Error('Kiempad is vergrendeld.');
    }
    this.touch();
    return this.key;
  }

  lock(): void {
    this.key = null;
    this.rawKey = null;
    if (this.autoLockTimer !== undefined) {
      clearTimeout(this.autoLockTimer);
      this.autoLockTimer = undefined;
    }
  }

  async enableWebAuthnUnlock(input: {
    credentialId: string;
    prfSalt: Uint8Array;
    prfSecret: Uint8Array;
    label?: string;
  }): Promise<WebAuthnUnlockMetadata> {
    if (!this.key || !this.rawKey) {
      throw new Error('Ontgrendel eerst met passphrase om WebAuthn te koppelen.');
    }

    const wrappingKey = await importAesKey(normalizePrfSecret(input.prfSecret));
    const now = nowIso();
    const existing = await this.getWebAuthnUnlockMetadata();
    const wrapper = await encryptJson(
      {
        purpose: 'kiempad-webauthn-wrapped-vault-key',
        version: 1,
        rawKey: bytesToBase64(this.rawKey),
      } satisfies WrappedVaultKeyPayload,
      wrappingKey,
    );
    const metadata: WebAuthnUnlockMetadata = {
      version: 1,
      credentialId: input.credentialId,
      prfSalt: bytesToBase64(input.prfSalt),
      label: input.label?.trim() || 'WebAuthn/biometrie',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      wrapper,
    };

    await this.driver.putMeta<WebAuthnUnlockMetadata>(WEBAUTHN_META_KEY, metadata);
    this.touch();
    return metadata;
  }

  async unlockWithWebAuthnPrf(prfSecret: Uint8Array): Promise<void> {
    const metadata = await this.getWebAuthnUnlockMetadata();
    const cryptoMetadata = await this.driver.getMeta<CryptoMetadata>(CRYPTO_META_KEY);
    if (!metadata || !cryptoMetadata) {
      throw new Error('WebAuthn-ontgrendeling is niet ingesteld voor deze kluis.');
    }

    const wrappingKey = await importAesKey(normalizePrfSecret(prfSecret));
    let payload: WrappedVaultKeyPayload;
    try {
      payload = await decryptJson<WrappedVaultKeyPayload>(metadata.wrapper, wrappingKey);
    } catch (error) {
      throw new Error('WebAuthn-verificatie past niet bij deze Kiempad-kluis.', { cause: error });
    }

    if (payload.purpose !== 'kiempad-webauthn-wrapped-vault-key') {
      throw new Error('Ongeldige WebAuthn-kluisverificatie.');
    }

    const rawKey = base64ToBytes(payload.rawKey);
    const key = await importAesKey(rawKey);
    await this.verifyVaultKey(key, cryptoMetadata);

    this.key = key;
    this.rawKey = rawKey;
    await ensureStorageSchema(this.driver);
    this.touch();
  }

  touch(): void {
    if (!this.key) return;
    if (this.autoLockTimer !== undefined) {
      clearTimeout(this.autoLockTimer);
    }
    this.autoLockTimer = setTimeout(() => this.lock(), this.autoLockMs);
  }

  private async createVault(passphrase: string): Promise<void> {
    const salt = randomBytes(16);
    const rawKey = await deriveAesKeyBytes(passphrase, salt, KDF_ITERATIONS);
    const key = await importAesKey(rawKey);
    const verifier = await encryptJson(
      { purpose: 'kiempad-passphrase-verifier', version: 1 } satisfies VerifierPayload,
      key,
    );

    await this.driver.putMeta<CryptoMetadata>(CRYPTO_META_KEY, {
      version: 1,
      kdf: KDF_ALGORITHM,
      iterations: KDF_ITERATIONS,
      salt: bytesToBase64(salt),
      createdAt: nowIso(),
      verifier,
    });
    await ensureStorageSchema(this.driver);

    this.key = key;
    this.rawKey = rawKey;
    this.touch();
  }

  private async unlockExistingVault(passphrase: string, metadata: CryptoMetadata): Promise<void> {
    const rawKey = await deriveAesKeyBytes(
      passphrase,
      base64ToBytes(metadata.salt),
      metadata.iterations,
    );
    const key = await importAesKey(rawKey);

    await this.verifyVaultKey(key, metadata, 'Passphrase klopt niet voor deze Kiempad-kluis.');

    this.key = key;
    this.rawKey = rawKey;
    await ensureStorageSchema(this.driver);
    this.touch();
  }

  private async verifyVaultKey(
    key: CryptoKey,
    metadata: CryptoMetadata,
    failureMessage = 'WebAuthn-sleutel klopt niet voor deze Kiempad-kluis.',
  ): Promise<void> {
    try {
      const verifier = await decryptJson<VerifierPayload>(metadata.verifier, key);
      if (verifier.purpose !== 'kiempad-passphrase-verifier') {
        throw new Error('Ongeldige kluisverificatie.');
      }
    } catch (error) {
      throw new Error(failureMessage, { cause: error });
    }
  }
}

function normalizePrfSecret(prfSecret: Uint8Array): Uint8Array {
  if (prfSecret.byteLength === 32) return prfSecret;
  throw new Error('WebAuthn PRF-output moet 32 bytes zijn.');
}
