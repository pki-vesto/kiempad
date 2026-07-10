import { html, type TemplateResult } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

export type DossierSubmitType =
  | 'upload'
  | 'embryo-quality'
  | 'embryo-status'
  | 'embryo-source'
  | 'consult'
  | 'consult-summary'
  | 'consult-question-link'
  | 'search'
  | 'import-retry'
  | 'imaging-filter'
  | 'imaging-review'
  | 'timeline-review'
  | 'metadata-normalization'
  | 'ocr-review';

export type DossierAction =
  | { type: DossierSubmitType; form: HTMLFormElement; submitter: HTMLElement | null }
  | { type: 'upload-change'; form: HTMLFormElement }
  | { type: 'focus-return'; link: HTMLAnchorElement; event: MouseEvent }
  | { type: 'search-clear' }
  | { type: 'delete'; button: HTMLButtonElement };

const submitSelectors: Array<[string, DossierSubmitType]> = [
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
];

export function renderDossierScreen(
  screenHtml: string,
  dispatch: (action: DossierAction) => void,
): TemplateResult {
  const onSubmit = (event: SubmitEvent): void => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const type = submitSelectors.find(([selector]) => form.matches(selector))?.[1];
    if (!type) return;
    event.preventDefault();
    dispatch({ type, form, submitter: event.submitter });
  };
  const onChange = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (
      !target.matches(
        'input[name="dossierBestanden"], select[name="categorie"], select[name="uploadProfiel"], select[name="ziekenhuisDocumentTypeCorrectie"]',
      )
    )
      return;
    const form = target.closest<HTMLFormElement>('#dossier-upload-form');
    if (form) dispatch({ type: 'upload-change', form });
  };
  const onClick = (event: MouseEvent): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const focusLink = target.closest<HTMLAnchorElement>('.dossier-submit-focus-return');
    if (focusLink) {
      dispatch({ type: 'focus-return', link: focusLink, event });
      return;
    }
    if (target.closest('[data-dossier-search-clear="filters"]')) {
      dispatch({ type: 'search-clear' });
      return;
    }
    const deleteButton = target.closest<HTMLButtonElement>('.delete-dossier-document');
    if (deleteButton) dispatch({ type: 'delete', button: deleteButton });
  };

  return html`<div
    data-lit-screen="dossier"
    @submit=${onSubmit}
    @change=${onChange}
    @click=${onClick}
  >${unsafeHTML(screenHtml)}</div>`;
}
