import { html, type TemplateResult } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

export type VragenAction =
  | { type: 'export-consult' }
  | { type: 'save'; form: HTMLFormElement }
  | { type: 'priority'; form: HTMLFormElement; submitter: HTMLElement | null }
  | { type: 'artscheck-review'; form: HTMLFormElement }
  | { type: 'delete'; button: HTMLButtonElement };

export function renderVragenScreen(
  screenHtml: string,
  dispatch: (action: VragenAction) => void,
): TemplateResult {
  const onSubmit = (event: SubmitEvent): void => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const type = form.matches('#vraag-form')
      ? 'save'
      : form.matches('.question-priority-form')
        ? 'priority'
        : form.matches('.question-artscheck-review-form')
          ? 'artscheck-review'
          : undefined;
    if (!type) return;
    event.preventDefault();
    if (type === 'priority') dispatch({ type, form, submitter: event.submitter });
    else dispatch({ type, form });
  };
  const onClick = (event: MouseEvent): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>('button');
    if (!button) return;
    if (button.id === 'export-consult-pdf') dispatch({ type: 'export-consult' });
    else if (button.id === 'delete-vraag') dispatch({ type: 'delete', button });
  };

  return html`<div data-lit-screen="vragen" @submit=${onSubmit} @click=${onClick}
    >${unsafeHTML(screenHtml)}</div
  >`;
}
