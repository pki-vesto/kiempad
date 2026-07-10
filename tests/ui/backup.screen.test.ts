import { afterEach, describe, expect, it, vi } from 'vitest';

import mainSource from '../../src/main.ts?raw';
import { type BackupAction, renderBackupScreen } from '../../src/ui/screens/backup';

describe('backup lit-html scherm', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['import-backup-form', 'import-backup'],
    ['import-sync-form', 'import-sync'],
  ] as const)('dispatcht %s inline', (id, expectedType) => {
    class TestForm {
      constructor(readonly id: string) {}
    }
    vi.stubGlobal('HTMLFormElement', TestForm);
    const actions: BackupAction[] = [];
    const template = renderBackupScreen('<form data-backup-import="ready"></form>', (action) =>
      actions.push(action),
    );
    const form = new TestForm(id);
    const preventDefault = vi.fn();

    (template.values[0] as (event: SubmitEvent) => void)({
      target: form,
      preventDefault,
    } as unknown as SubmitEvent);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(actions[0]).toMatchObject({ type: expectedType, form });
  });

  it.each([
    ['export-backup', 'export-backup'],
    ['export-sync', 'export-sync'],
    ['webauthn-enroll', 'webauthn-enroll'],
  ] as const)('dispatcht knop %s als %s', (id, expectedType) => {
    class TestElement {
      constructor(readonly id: string) {}
      closest(): TestElement {
        return this;
      }
      matches(): boolean {
        return false;
      }
      hasAttribute(): boolean {
        return false;
      }
    }
    vi.stubGlobal('Element', TestElement);
    vi.stubGlobal('HTMLButtonElement', TestElement);
    const actions: BackupAction[] = [];
    const template = renderBackupScreen('<button data-backup-action="ready"></button>', (action) =>
      actions.push(action),
    );

    (template.values[1] as (event: MouseEvent) => void)({
      target: new TestElement(id),
    } as unknown as MouseEvent);

    expect(actions).toEqual([{ type: expectedType }]);
  });

  it('behoudt backupcontracten zonder bindlaag', () => {
    const template = renderBackupScreen(
      '<section data-backup-console="ready"><button data-backup-copy-kind="status"></button></section>',
      vi.fn(),
    );

    expect(template.strings.join('')).toContain('data-lit-screen="backup"');
    expect(template.values[2]).toMatchObject({
      values: [expect.stringContaining('data-backup-copy-kind="status"')],
    });
    expect(mainSource).not.toContain('bindBackupControls');
  });
});
