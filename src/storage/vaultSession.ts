import {
  KDF_ALGORITHM,
  KDF_ITERATIONS,
  decryptJson,
  deriveAesKey,
  encryptJson,
  type EncryptionEnvelope,
} from './crypto';
import { base64ToBytes, bytesToBase64, randomBytes } from './encoding';
import type { EncryptedStorageDriver } from './records';
import { nowIso } from './records';

const CRYPTO_META_KEY = 'crypto';

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

export type VaultSessionOptions = {
  autoLockMs?: number;
};

export class VaultSession {
  private key: CryptoKey | null = null;
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
    if (this.autoLockTimer !== undefined) {
      clearTimeout(this.autoLockTimer);
      this.autoLockTimer = undefined;
    }
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
    const key = await deriveAesKey(passphrase, salt, KDF_ITERATIONS);
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

    this.key = key;
    this.touch();
  }

  private async unlockExistingVault(passphrase: string, metadata: CryptoMetadata): Promise<void> {
    const key = await deriveAesKey(passphrase, base64ToBytes(metadata.salt), metadata.iterations);

    try {
      const verifier = await decryptJson<VerifierPayload>(metadata.verifier, key);
      if (verifier.purpose !== 'kiempad-passphrase-verifier') {
        throw new Error('Ongeldige kluisverificatie.');
      }
    } catch (error) {
      throw new Error('Passphrase klopt niet voor deze Kiempad-kluis.', { cause: error });
    }

    this.key = key;
    this.touch();
  }
}
