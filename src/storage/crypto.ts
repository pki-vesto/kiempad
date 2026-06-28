import { base64ToBytes, bytesToBase64, randomBytes } from './encoding';

export const KDF_ITERATIONS = 310_000;
export const KDF_ALGORITHM = 'PBKDF2-SHA-256';
export const ENCRYPTION_ALGORITHM = 'AES-256-GCM';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export type EncryptionEnvelope = {
  v: 1;
  alg: typeof ENCRYPTION_ALGORITHM;
  iv: string;
  ciphertext: string;
};

export type AttachmentEnvelopeMetadata = {
  kind: 'attachment';
  contentType: string;
  sizeBytes: number;
  sha256: string;
};

export type AttachmentEncryptionEnvelope = EncryptionEnvelope & {
  attachment: AttachmentEnvelopeMetadata;
};

export async function deriveAesKey(
  passphrase: string,
  salt: Uint8Array,
  iterations = KDF_ITERATIONS,
): Promise<CryptoKey> {
  const rawKey = await deriveAesKeyBytes(passphrase, salt, iterations);
  return importAesKey(rawKey);
}

export async function deriveAesKeyBytes(
  passphrase: string,
  salt: Uint8Array,
  iterations = KDF_ITERATIONS,
): Promise<Uint8Array> {
  const material = await globalThis.crypto.subtle.importKey(
    'raw',
    textEncoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const bits = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: toArrayBuffer(salt),
      iterations,
    },
    material,
    256,
  );

  return new Uint8Array(bits);
}

export async function importAesKey(rawKey: Uint8Array): Promise<CryptoKey> {
  if (rawKey.byteLength !== 32) {
    throw new Error('AES-256 sleutel moet 32 bytes zijn.');
  }

  return globalThis.crypto.subtle.importKey(
    'raw',
    toArrayBuffer(rawKey),
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptJson(value: unknown, key: CryptoKey): Promise<EncryptionEnvelope> {
  const iv = randomBytes(12);
  const encoded = textEncoder.encode(JSON.stringify(value));
  const encrypted = await globalThis.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(encoded),
  );

  return {
    v: 1,
    alg: ENCRYPTION_ALGORITHM,
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
  };
}

export async function decryptJson<T>(envelope: EncryptionEnvelope, key: CryptoKey): Promise<T> {
  if (envelope.v !== 1 || envelope.alg !== ENCRYPTION_ALGORITHM) {
    throw new Error('Onbekend versleutelingsformaat.');
  }

  const decrypted = await globalThis.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(base64ToBytes(envelope.iv)) },
    key,
    toArrayBuffer(base64ToBytes(envelope.ciphertext)),
  );

  return JSON.parse(textDecoder.decode(decrypted)) as T;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}
