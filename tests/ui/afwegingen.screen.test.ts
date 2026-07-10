import { afterEach, describe, expect, it, vi } from 'vitest';

import mainSource from '../../src/main.ts?raw';
import { type AfwegingAction, renderAfwegingenScreen } from '../../src/ui/screens/afwegingen';

describe('afwegingen lit-html scherm', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['decision-form', false, 'save-decision'],
    ['', true, 'save-choice'],
  ] as const)('dispatcht formulier %s als %s', (id, isChoice, expectedType) => {
    class TestForm {
      classList = { contains: (value: string) => isChoice && value === 'decision-choice-form' };
      constructor(readonly id: string) {}
    }
    vi.stubGlobal('HTMLFormElement', TestForm);
    const actions: AfwegingAction[] = [];
    const template = renderAfwegingenScreen('<form data-decision-form="ready"></form>', (action) =>
      actions.push(action),
    );
    const handler = template.values.find(
      (value): value is (event: SubmitEvent) => void => typeof value === 'function',
    );
    const form = new TestForm(id);
    const preventDefault = vi.fn();

    handler?.({ target: form, preventDefault } as unknown as SubmitEvent);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(actions).toEqual([{ type: expectedType, form }]);
  });

  it('behoudt het afwegingencontract zonder bindlaag', () => {
    const template = renderAfwegingenScreen(
      '<section data-decision-console="ready"><form id="decision-form"></form></section>',
      vi.fn(),
    );

    expect(template.strings.join('')).toContain('data-lit-screen="afwegingen"');
    expect(template.values[1]).toMatchObject({
      values: [expect.stringContaining('data-decision-console="ready"')],
    });
    expect(mainSource).not.toContain('bindAfwegingControls');
    expect(mainSource).toContain('dispatchAfwegingAction');
  });
});
