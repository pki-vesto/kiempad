import { describe, expect, it } from 'vitest';
import { KDF_ITERATIONS, decryptJson, deriveAesKey, encryptJson } from '../src/storage/crypto';
import { randomBytes } from '../src/storage/encoding';

describe('storage crypto', () => {
  it('versleutelt en ontsleutelt JSON met een niet-exporteerbare AES-256-GCM sleutel', async () => {
    const key = await deriveAesKey('een lange veilige passphrase', randomBytes(16), 1);
    const envelope = await encryptJson({ naam: 'Poging 1', notitie: 'gevoelig' }, key);

    expect(key.extractable).toBe(false);
    expect(envelope.alg).toBe('AES-256-GCM');
    expect(envelope.iv).not.toHaveLength(0);
    expect(envelope.ciphertext).not.toContain('gevoelig');

    await expect(decryptJson(envelope, key)).resolves.toEqual({
      naam: 'Poging 1',
      notitie: 'gevoelig',
    });
  });

  it('weigert ontsleutelen met een andere passphrase', async () => {
    const salt = randomBytes(16);
    const correctKey = await deriveAesKey('correcte passphrase', salt, 1);
    const wrongKey = await deriveAesKey('verkeerde passphrase', salt, 1);
    const envelope = await encryptJson({ vraag: 'Wat moeten we meenemen?' }, correctKey);

    await expect(decryptJson(envelope, wrongKey)).rejects.toThrow();
  });

  it('legt een hoge PBKDF2-iteratietelling vast voor echte kluizen', () => {
    expect(KDF_ITERATIONS).toBeGreaterThanOrEqual(300_000);
  });
});
