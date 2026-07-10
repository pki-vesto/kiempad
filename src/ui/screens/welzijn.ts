import { html, type TemplateResult } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

export type WelzijnSubmitAction =
  | { type: 'mental-check-in'; form: HTMLFormElement }
  | { type: 'symptom-log'; form: HTMLFormElement }
  | { type: 'cycle-data'; form: HTMLFormElement };

export type WelzijnScreenDispatch = (action: WelzijnSubmitAction) => void;

export function renderWelzijnScreen(
  screenHtml: string,
  dispatch: WelzijnScreenDispatch,
): TemplateResult {
  const onSubmit = (event: SubmitEvent): void => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    const actionType = welzijnActionType(form.id);
    if (!actionType) return;
    event.preventDefault();
    dispatch({ type: actionType, form });
  };

  return html`<div data-lit-screen="welzijn" @submit=${onSubmit}>${unsafeHTML(screenHtml)}</div>`;
}

function welzijnActionType(formId: string): WelzijnSubmitAction['type'] | undefined {
  if (formId === 'mental-check-in-form') return 'mental-check-in';
  if (formId === 'symptom-log-form') return 'symptom-log';
  if (formId === 'cycle-data-form') return 'cycle-data';
  return undefined;
}
