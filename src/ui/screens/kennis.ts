import { html, type TemplateResult } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

export type KennisSubmitType =
  | 'filter'
  | 'item'
  | 'research-item'
  | 'literature-query'
  | 'relevance-review'
  | 'ai-preview'
  | 'ai-summary'
  | 'ai-settings'
  | 'research-network';

export type KennisAction =
  | { type: KennisSubmitType; form: HTMLFormElement; submitter: HTMLElement | null }
  | { type: 'verify'; button: HTMLButtonElement };

export function renderKennisScreen(
  screenHtml: string,
  dispatch: (action: KennisAction) => void,
): TemplateResult {
  const onSubmit = (event: SubmitEvent): void => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const type: KennisSubmitType | undefined = form.matches('#knowledge-filter-form')
      ? 'filter'
      : form.matches('.knowledge-item-form')
        ? 'item'
        : form.matches('#research-item-form')
          ? 'research-item'
          : form.matches('#literature-query-builder-form')
            ? 'literature-query'
            : form.matches('.research-relevance-review-form')
              ? 'relevance-review'
              : form.matches('#ai-preview-form')
                ? 'ai-preview'
                : form.matches('#ai-summary-form')
                  ? 'ai-summary'
                  : form.matches('#ai-settings-form')
                    ? 'ai-settings'
                    : form.matches('#research-network-form')
                      ? 'research-network'
                      : undefined;
    if (!type) return;
    event.preventDefault();
    dispatch({ type, form, submitter: event.submitter });
  };
  const onClick = (event: MouseEvent): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>('button[data-kennis-id]');
    if (button) dispatch({ type: 'verify', button });
  };

  return html`<div data-lit-screen="kennis" @submit=${onSubmit} @click=${onClick}
    >${unsafeHTML(screenHtml)}</div
  >`;
}
