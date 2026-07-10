import { afterEach, describe, expect, it, vi } from 'vitest';

import mainSource from '../../src/main.ts?raw';
import { type KennisAction, renderKennisScreen } from '../../src/ui/screens/kennis';

describe('kennis lit-html scherm', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['#knowledge-filter-form', 'filter'],
    ['.knowledge-item-form', 'item'],
    ['#research-item-form', 'research-item'],
    ['#literature-query-builder-form', 'literature-query'],
    ['.research-relevance-review-form', 'relevance-review'],
    ['#ai-preview-form', 'ai-preview'],
    ['#ai-summary-form', 'ai-summary'],
    ['#ai-settings-form', 'ai-settings'],
    ['#research-network-form', 'research-network'],
  ] as const)('dispatcht %s als %s', (matchedSelector, expectedType) => {
    class TestForm {
      matches(selector: string): boolean {
        return selector === matchedSelector;
      }
    }
    vi.stubGlobal('HTMLFormElement', TestForm);
    const actions: KennisAction[] = [];
    const template = renderKennisScreen('<form data-knowledge-form="ready"></form>', (action) =>
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
    expect(actions).toEqual([{ type: expectedType, form, submitter }]);
  });

  it('dispatcht verificatie via data-kennis-id', () => {
    class TestElement {
      closest(): TestElement {
        return this;
      }
    }
    vi.stubGlobal('Element', TestElement);
    vi.stubGlobal('HTMLButtonElement', TestElement);
    const actions: KennisAction[] = [];
    const template = renderKennisScreen('<button data-kennis-id="item-1"></button>', (action) =>
      actions.push(action),
    );
    const button = new TestElement();

    (template.values[1] as (event: MouseEvent) => void)({
      target: button,
    } as unknown as MouseEvent);

    expect(actions).toEqual([{ type: 'verify', button }]);
  });

  it('behoudt kenniscontracten zonder bindlaag', () => {
    const template = renderKennisScreen(
      '<section data-knowledge-focus-shell="ready"><form id="knowledge-filter-form"></form></section>',
      vi.fn(),
    );
    expect(template.strings.join('')).toContain('data-lit-screen="kennis"');
    expect(template.values[2]).toMatchObject({
      values: [expect.stringContaining('data-knowledge-focus-shell="ready"')],
    });
    expect(mainSource).not.toContain('bindKennisControls');
    expect(mainSource).toContain('dispatchKennisAction');
  });
});
