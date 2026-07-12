import { afterEach, describe, expect, it, vi } from 'vitest';

import mainSource from '../../src/runtime.ts?raw';
import { renderWelzijnScreen, type WelzijnSubmitAction } from '../../src/ui/screens/welzijn';

describe('welzijn lit-html scherm', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['mental-check-in-form', 'mental-check-in'],
    ['symptom-log-form', 'symptom-log'],
    ['cycle-data-form', 'cycle-data'],
  ] as const)('dispatcht submit van %s als %s', (formId, expectedType) => {
    class TestForm {
      constructor(readonly id: string) {}
    }
    vi.stubGlobal('HTMLFormElement', TestForm);
    const actions: WelzijnSubmitAction[] = [];
    const template = renderWelzijnScreen(
      `<form id="${formId}" data-wellbeing-form="ready"></form>`,
      (action) => actions.push(action),
    );
    const submitHandler = template.values.find(
      (value): value is (event: SubmitEvent) => void => typeof value === 'function',
    );
    const preventDefault = vi.fn();
    const form = new TestForm(formId);

    submitHandler?.({ target: form, preventDefault } as unknown as SubmitEvent);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(actions).toEqual([{ type: expectedType, form }]);
  });

  it('behoudt de legacy data-attributen binnen de lit-template tijdens de migratie', () => {
    const template = renderWelzijnScreen(
      '<section data-wellbeing-focus-shell="ready"><form id="mental-check-in-form"></form></section>',
      vi.fn(),
    );

    expect(template.strings.join('')).toContain('data-lit-screen="welzijn"');
    expect(template.values[1]).toMatchObject({
      values: [expect.stringContaining('data-wellbeing-focus-shell="ready"')],
    });
  });

  it('gebruikt geen bindWelzijnControls-laag meer', () => {
    expect(mainSource).not.toContain('bindWelzijnControls');
    expect(mainSource).toContain('dispatchWelzijnAction');
    expect(mainSource).toContain('renderWelzijnScreen');
  });
});
