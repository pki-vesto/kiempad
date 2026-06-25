import { describe, expect, it } from 'vitest';

import mainSource from '../src/main.ts?raw';

describe('main bootstrap', () => {
  it('toont een centrale opslagfout zonder legacy fallback wanneer openClientStorage faalt', () => {
    expect(mainSource).toContain('try {');
    expect(mainSource).toContain('storage = await openClientStorage()');
    expect(mainSource).toContain('catch (error: unknown)');
    expect(mainSource).toContain('renderStorageBootstrapError(formatStorageBootstrapError(error))');
    expect(mainSource).toContain('return;');
  });

  it('geeft storage-mode context door aan de vergrendelde vault-gate', () => {
    expect(mainSource).toContain(
      'renderVaultGate(state.hasVault, state.error, state.webAuthnStatus, {',
    );
    expect(mainSource).toContain('storageMode: state.storageMode');
    expect(mainSource).toContain('storageLabel: state.storageLabel');
  });

  it('houdt back-up en sync-statussen storage-mode bewust', () => {
    expect(mainSource).toContain('Centrale encrypted noodexport lokaal als download aangeboden.');
    expect(mainSource).toContain(
      'Encrypted recordpakket voor dezelfde centrale dataset klaargezet voor download.',
    );
    expect(mainSource).toContain('centrale apparaten openen normaal dezelfde API-dataset');
    expect(mainSource).toContain('Recordpakket geïmporteerd in centrale dataset');
  });

  it('houdt WebAuthn enrollment-labels storage-mode bewust', () => {
    expect(mainSource).toContain('Kiempad centrale encrypted dataset');
    expect(mainSource).toContain('Kiempad legacy lokale kluis');
    expect(mainSource).toContain(
      'WebAuthn/biometrie is lokaal gekoppeld als ontgrendelgemak voor je centrale encrypted dataset.',
    );
    expect(mainSource).toContain(
      'Lokale PRF-keywrap toegevoegd voor centrale encrypted dataset; passphrase blijft fallback.',
    );
  });
});
