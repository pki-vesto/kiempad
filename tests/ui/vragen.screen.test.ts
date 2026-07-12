import { afterEach, describe, expect, it, vi } from 'vitest';

import mainSource from '../../src/runtime.ts?raw';
import { renderVragenScreen, type VragenAction } from '../../src/ui/screens/vragen';

describe('vragen lit-html scherm', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['vraag-form', '', 'save'],
    ['', 'priority', 'priority'],
    ['', 'review', 'artscheck-review'],
  ] as const)('dispatcht formulier %s als %s', (id, match, expectedType) => {
    class TestForm {
      matches(selector: string): boolean {
        if (selector === '#vraag-form') return id === 'vraag-form';
        if (selector === '.question-priority-form') return match === 'priority';
        if (selector === '.question-artscheck-review-form') return match === 'review';
        return false;
      }
    }
    vi.stubGlobal('HTMLFormElement', TestForm);
    const actions: VragenAction[] = [];
    const template = renderVragenScreen('<form data-question-form="ready"></form>', (action) =>
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
    if (expectedType === 'priority') expect(actions[0]).toMatchObject({ submitter });
  });

  it.each([
    ['export-consult-pdf', 'export-consult'],
    ['delete-vraag', 'delete'],
  ] as const)('dispatcht knop %s als %s', (id, expectedType) => {
    class TestElement {
      constructor(readonly id: string) {}
      closest(): TestElement {
        return this;
      }
    }
    vi.stubGlobal('Element', TestElement);
    vi.stubGlobal('HTMLButtonElement', TestElement);
    const actions: VragenAction[] = [];
    const template = renderVragenScreen(
      '<button data-question-action="ready"></button>',
      (action) => actions.push(action),
    );
    const button = new TestElement(id);

    (template.values[1] as (event: MouseEvent) => void)({
      target: button,
    } as unknown as MouseEvent);

    expect(actions[0]).toMatchObject({ type: expectedType });
    if (expectedType === 'delete') expect(actions[0]).toMatchObject({ button });
  });

  it('behoudt vragencontracten zonder bindlaag', () => {
    const template = renderVragenScreen(
      '<section data-question-focus-shell="ready"><form class="question-priority-form"></form></section>',
      vi.fn(),
    );

    expect(template.strings.join('')).toContain('data-lit-screen="vragen"');
    expect(template.values[2]).toMatchObject({
      values: [expect.stringContaining('data-question-focus-shell="ready"')],
    });
    expect(mainSource).not.toContain('bindVraagControls');
    expect(mainSource).toContain('dispatchVragenAction');
  });
});
