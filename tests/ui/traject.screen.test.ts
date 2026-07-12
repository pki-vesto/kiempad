import { afterEach, describe, expect, it, vi } from 'vitest';

import mainSource from '../../src/runtime.ts?raw';
import { renderTrajectScreen, type TrajectAction } from '../../src/ui/screens/traject';

describe('traject lit-html scherm', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['#traject-form, #traject-new-form', 'save'],
    ['#graph-filter-form', 'graph-filter'],
    ['#timeline-filter-form', 'timeline-filter'],
  ] as const)('dispatcht %s als %s', (matchedSelector, expectedType) => {
    class TestForm {
      matches(selector: string): boolean {
        return selector === matchedSelector;
      }
    }
    vi.stubGlobal('HTMLFormElement', TestForm);
    const actions: TrajectAction[] = [];
    const template = renderTrajectScreen('<form data-treatment-form="ready"></form>', (action) =>
      actions.push(action),
    );
    const form = new TestForm();
    const preventDefault = vi.fn();

    (template.values[0] as (event: SubmitEvent) => void)({
      target: form,
      preventDefault,
    } as unknown as SubmitEvent);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(actions).toEqual([{ type: expectedType, form }]);
  });

  it.each([
    ['delete-traject', '', 'delete'],
    ['', 'archive-traject', 'archive'],
    ['', 'phase-button', 'phase'],
  ] as const)('dispatcht knop als %s', (id, className, expectedType) => {
    class TestElement {
      constructor(readonly id: string) {}
      closest(): TestElement {
        return this;
      }
      matches(selector: string): boolean {
        return selector === `.${className}`;
      }
    }
    vi.stubGlobal('Element', TestElement);
    vi.stubGlobal('HTMLButtonElement', TestElement);
    const actions: TrajectAction[] = [];
    const template = renderTrajectScreen(
      '<button data-treatment-action="ready"></button>',
      (action) => actions.push(action),
    );
    const button = new TestElement(id);

    (template.values[1] as (event: MouseEvent) => void)({
      target: button,
    } as unknown as MouseEvent);

    expect(actions).toEqual([{ type: expectedType, button }]);
  });

  it('behoudt trajectcontracten zonder bindlaag', () => {
    const template = renderTrajectScreen(
      '<section data-treatment-focus-shell="ready"><button class="phase-button"></button></section>',
      vi.fn(),
    );
    expect(template.strings.join('')).toContain('data-lit-screen="traject"');
    expect(template.values[2]).toMatchObject({
      values: [expect.stringContaining('data-treatment-focus-shell="ready"')],
    });
    expect(mainSource).not.toContain('bindTrajectControls');
    expect(mainSource).toContain('dispatchTrajectAction');
  });
});
