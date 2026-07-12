import { afterEach, describe, expect, it, vi } from 'vitest';

import mainSource from '../../src/runtime.ts?raw';
import { type DossierAction, renderDossierScreen } from '../../src/ui/screens/dossier';

describe('dossier lit-html scherm', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['#dossier-upload-form', 'upload'],
    ['#embryo-quality-form', 'embryo-quality'],
    ['#embryo-status-event-form', 'embryo-status'],
    ['.embryo-source-label-correction-form', 'embryo-source'],
    ['#consult-verslag-form', 'consult'],
    ['.consult-samenvatting-review-form', 'consult-summary'],
    ['.consult-question-link-review-form', 'consult-question-link'],
    ['#dossier-search-form', 'search'],
    ['.dossier-import-retry-form', 'import-retry'],
    ['#imaging-filter-form', 'imaging-filter'],
    ['.imaging-metadata-review-form', 'imaging-review'],
    ['.historical-timeline-review-form', 'timeline-review'],
    ['.metadata-normalization-correction-form', 'metadata-normalization'],
    ['.ocr-review-correction-form', 'ocr-review'],
  ] as const)('dispatcht %s als %s', (matchedSelector, expectedType) => {
    class TestForm {
      matches(selector: string): boolean {
        return selector === matchedSelector;
      }
    }
    vi.stubGlobal('HTMLFormElement', TestForm);
    const actions: DossierAction[] = [];
    const template = renderDossierScreen('<form data-dossier-form="ready"></form>', (action) =>
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

  it('dispatcht upload-previewwijzigingen', () => {
    class TestForm {}
    const form = new TestForm();
    class TestElement {
      matches(): boolean {
        return true;
      }
      closest(): TestForm {
        return form;
      }
    }
    vi.stubGlobal('Element', TestElement);
    vi.stubGlobal('HTMLFormElement', TestForm);
    const actions: DossierAction[] = [];
    const template = renderDossierScreen('<input name="dossierBestanden">', (action) =>
      actions.push(action),
    );

    (template.values[1] as (event: Event) => void)({
      target: new TestElement(),
    } as unknown as Event);

    expect(actions).toEqual([{ type: 'upload-change', form }]);
  });

  it('behoudt dossiercontracten zonder bindlaag', () => {
    const template = renderDossierScreen(
      '<section data-dossier-focus-shell="ready"><form id="dossier-upload-form"></form></section>',
      vi.fn(),
    );
    expect(template.strings.join('')).toContain('data-lit-screen="dossier"');
    expect(template.values[3]).toMatchObject({
      values: [expect.stringContaining('data-dossier-focus-shell="ready"')],
    });
    expect(mainSource).not.toContain('bindDossierControls');
    expect(mainSource).toContain('dispatchDossierAction');
    expect(mainSource).toContain('initializeDossierForm');
  });
});
