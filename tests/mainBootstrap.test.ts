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
});
