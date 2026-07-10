import { afterEach, describe, expect, it, vi } from 'vitest';

import mainSource from '../../src/main.ts?raw';
import { type MedicatieAction, renderMedicatieScreen } from '../../src/ui/screens/medicatie';

describe('medicatie lit-html scherm', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['save', 'save'],
    ['import', 'import'],
    ['dose', 'dose'],
  ] as const)('dispatcht %s-formulier', (match, expectedType) => {
    class TestForm {
      matches(selector: string): boolean {
        if (match === 'save') return selector === '#medicatie-form';
        if (match === 'import') return selector === '#medicatie-import-form';
        return selector === '.dose-log-form';
      }
    }
    vi.stubGlobal('HTMLFormElement', TestForm);
    const actions: MedicatieAction[] = [];
    const template = renderMedicatieScreen('<form data-medication-form="ready"></form>', (action) =>
      actions.push(action),
    );
    const form = new TestForm();
    const submitter = {} as HTMLElement;
    const preventDefault = vi.fn();

    (template.values[0] as (event: SubmitEvent) => void)({
      target: form,
      submitter,
      preventDefault,
    } as unknown as SubmitEvent);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(actions[0]).toMatchObject({ type: expectedType, form });
    if (expectedType === 'dose') expect(actions[0]).toMatchObject({ submitter });
  });

  it('dispatcht verwijderen via de schermboundary', () => {
    class TestElement {
      closest(): TestElement {
        return this;
      }
    }
    vi.stubGlobal('Element', TestElement);
    vi.stubGlobal('HTMLButtonElement', TestElement);
    const actions: MedicatieAction[] = [];
    const template = renderMedicatieScreen('<button id="delete-medicatie"></button>', (action) =>
      actions.push(action),
    );
    const button = new TestElement();

    (template.values[1] as (event: MouseEvent) => void)({
      target: button,
    } as unknown as MouseEvent);

    expect(actions).toEqual([{ type: 'delete', button }]);
  });

  it('behoudt medicatiecontracten zonder bindlaag', () => {
    const template = renderMedicatieScreen(
      '<section data-medication-focus-shell="ready"><form class="dose-log-form"></form></section>',
      vi.fn(),
    );

    expect(template.strings.join('')).toContain('data-lit-screen="medicatie"');
    expect(template.values[2]).toMatchObject({
      values: [expect.stringContaining('data-medication-focus-shell="ready"')],
    });
    expect(mainSource).not.toContain('bindMedicatieControls');
    expect(mainSource).toContain('dispatchMedicatieAction');
  });
});
