import { html, type TemplateResult } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

export type AfwegingAction =
  | { type: 'save-decision'; form: HTMLFormElement }
  | { type: 'save-choice'; form: HTMLFormElement };

export function renderAfwegingenScreen(
  screenHtml: string,
  dispatch: (action: AfwegingAction) => void,
): TemplateResult {
  const onSubmit = (event: SubmitEvent): void => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (form.id === 'decision-form') {
      event.preventDefault();
      dispatch({ type: 'save-decision', form });
    } else if (form.classList.contains('decision-choice-form')) {
      event.preventDefault();
      dispatch({ type: 'save-choice', form });
    }
  };

  return html`<div data-lit-screen="afwegingen" @submit=${onSubmit}
    >${unsafeHTML(screenHtml)}</div
  >`;
}
