import { base64ToBytes, bytesToBase64, randomBytes } from './encoding';
import type { WebAuthnUnlockMetadata } from './vaultSession';

type PrfExtensionResults = {
  prf?: {
    enabled?: boolean;
    results?: {
      first?: ArrayBuffer;
    };
  };
};

type PublicKeyCredentialWithPrf = PublicKeyCredential & {
  getClientExtensionResults(): PrfExtensionResults;
};

export type WebAuthnPrfEnrollment = {
  credentialId: string;
  prfSalt: Uint8Array;
  prfSecret: Uint8Array;
};

export type WebAuthnRuntimeStatus = {
  beschikbaar: boolean;
  reden: string;
};

export function bepaalWebAuthnRuntimeStatus(
  scope: Window & typeof globalThis = window,
): WebAuthnRuntimeStatus {
  if (!scope.isSecureContext) {
    return {
      beschikbaar: false,
      reden: 'WebAuthn vereist een veilige context zoals HTTPS of localhost.',
    };
  }

  if (!scope.PublicKeyCredential || !scope.navigator?.credentials) {
    return {
      beschikbaar: false,
      reden: 'Deze browser meldt geen WebAuthn-ondersteuning.',
    };
  }

  return {
    beschikbaar: true,
    reden: 'Browser meldt WebAuthn; PRF-ondersteuning wordt tijdens koppelen getest.',
  };
}

export async function koppelWebAuthnPrf(
  label = 'Kiempad encrypted dataset',
): Promise<WebAuthnPrfEnrollment> {
  const status = bepaalWebAuthnRuntimeStatus();
  if (!status.beschikbaar) {
    throw new Error(status.reden);
  }

  const prfSalt = randomBytes(32);
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: toArrayBuffer(randomBytes(32)),
      rp: {
        name: 'Kiempad',
      },
      user: {
        id: toArrayBuffer(randomBytes(16)),
        name: 'kiempad-local',
        displayName: label,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'required',
      },
      attestation: 'none',
      timeout: 60_000,
      extensions: {
        prf: {
          eval: {
            first: toArrayBuffer(prfSalt),
          },
        },
      },
    } as PublicKeyCredentialCreationOptions,
  });

  return {
    credentialId: bytesToBase64(new Uint8Array(assertPublicKeyCredential(credential).rawId)),
    prfSalt,
    prfSecret: extractPrfSecret(
      credential,
      'WebAuthn PRF is niet beschikbaar op deze authenticator.',
    ),
  };
}

export async function vraagWebAuthnPrfSecret(
  metadata: WebAuthnUnlockMetadata,
): Promise<Uint8Array> {
  const status = bepaalWebAuthnRuntimeStatus();
  if (!status.beschikbaar) {
    throw new Error(status.reden);
  }

  const credential = await navigator.credentials.get({
    publicKey: {
      challenge: toArrayBuffer(randomBytes(32)),
      allowCredentials: [
        {
          type: 'public-key',
          id: toArrayBuffer(base64ToBytes(metadata.credentialId)),
        },
      ],
      userVerification: 'required',
      timeout: 60_000,
      extensions: {
        prf: {
          eval: {
            first: toArrayBuffer(base64ToBytes(metadata.prfSalt)),
          },
        },
      },
    } as PublicKeyCredentialRequestOptions,
  });

  return extractPrfSecret(credential, 'WebAuthn PRF gaf geen sleutel voor deze dataset.');
}

function assertPublicKeyCredential(credential: Credential | null): PublicKeyCredentialWithPrf {
  if (!(credential instanceof PublicKeyCredential)) {
    throw new Error('WebAuthn gaf geen public-key credential terug.');
  }

  return credential as PublicKeyCredentialWithPrf;
}

function extractPrfSecret(credential: Credential | null, errorMessage: string): Uint8Array {
  const publicKeyCredential = assertPublicKeyCredential(credential);
  const prfResult = publicKeyCredential.getClientExtensionResults().prf;
  const first = prfResult?.results?.first as ArrayBuffer | undefined;

  if (first?.byteLength !== 32) {
    throw new Error(errorMessage);
  }

  return new Uint8Array(first);
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}
