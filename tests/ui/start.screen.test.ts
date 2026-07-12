import { afterEach, describe, expect, it, vi } from 'vitest';

import mainSource from '../../src/runtime.ts?raw';
import { renderStartScreen, type StartAction } from '../../src/ui/screens/start';

describe('start lit-html scherm', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['quick-entry-form', '', 'quick-entry'],
    ['', 'feedback', 'feedback-filter'],
    ['', 'owner', 'owner-visibility'],
    ['', 'recommendation', 'recommendation'],
  ] as const)('dispatcht startformulier %s als %s', (id, match, expectedType) => {
    class TestElement {}
    class TestForm extends TestElement {
      constructor(readonly id: string) {
        super();
      }
      matches(selector: string): boolean {
        if (match === 'feedback') return selector.includes('feedback-control');
        if (match === 'owner') return selector.includes('owner-visibility');
        if (match === 'recommendation') return selector.includes('recommendation-action-form');
        return false;
      }
    }
    vi.stubGlobal('HTMLElement', TestElement);
    vi.stubGlobal('HTMLFormElement', TestForm);
    const actions: StartAction[] = [];
    const template = renderStartScreen('<form data-start-form="ready"></form>', (action) =>
      actions.push(action),
    );
    const form = new TestForm(id);
    const preventDefault = vi.fn();

    (template.values[0] as (event: SubmitEvent) => void)({
      target: form,
      submitter: null,
      preventDefault,
    } as unknown as SubmitEvent);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(actions[0]).toMatchObject({ type: expectedType, form });
  });

  it('dispatcht het openen van de gefilterde dagadvieslijst', () => {
    class TestElement {
      closest(selector: string): object | null {
        return selector.includes('feedback-list-open') ? this : null;
      }
    }
    vi.stubGlobal('Element', TestElement);
    const actions: StartAction[] = [];
    const template = renderStartScreen(
      '<button data-daily-advice-feedback-list-open="ready"></button>',
      (action) => actions.push(action),
    );

    (template.values[2] as (event: MouseEvent) => void)({
      target: new TestElement(),
    } as unknown as MouseEvent);

    expect(actions).toEqual([{ type: 'open-feedback-list' }]);
  });

  it('behoudt start- en dagadviescontracten zonder bindlagen', () => {
    const template = renderStartScreen(
      '<section data-start-launchpad="ready"><form data-daily-recommendation-feedback-control="ready"></form></section>',
      vi.fn(),
    );

    expect(template.strings.join('')).toContain('data-lit-screen="start"');
    expect(template.values[3]).toMatchObject({
      values: [expect.stringContaining('data-start-launchpad="ready"')],
    });
    expect(mainSource).not.toContain('bindQuickEntryControls');
    expect(mainSource).not.toContain('bindDailyRecommendationControls');
    expect(mainSource).toContain('dispatchStartAction');
  });
});
