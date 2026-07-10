import { html, type TemplateResult } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

export type HerinneringenAction =
  | { type: 'save'; form: HTMLFormElement }
  | { type: 'request-permission' }
  | { type: 'save-privacy'; form: HTMLFormElement }
  | { type: 'save-warning-default'; form: HTMLFormElement }
  | { type: 'reschedule'; form: HTMLFormElement; submitter: HTMLElement | null };

export function renderHerinneringenScreen(
  screenHtml: string,
  dispatch: (action: HerinneringenAction) => void,
): TemplateResult {
  const onSubmit = (event: SubmitEvent): void => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    let action: HerinneringenAction | undefined;
    if (form.id === 'eigen-herinnering-form') action = { type: 'save', form };
    else if (form.id === 'notification-privacy-form') action = { type: 'save-privacy', form };
    else if (form.id === 'warning-default-form') action = { type: 'save-warning-default', form };
    else if (form.classList.contains('reminder-reschedule-form')) {
      action = {
        type: 'reschedule',
        form,
        submitter: event.submitter instanceof HTMLElement ? event.submitter : null,
      };
    }
    if (!action) return;
    event.preventDefault();
    dispatch(action);
  };
  const onClick = (event: MouseEvent): void => {
    const target = event.target;
    if (!(target instanceof Element) || !target.closest('#request-notifications')) return;
    dispatch({ type: 'request-permission' });
  };

  return html`<div data-lit-screen="herinneringen" @submit=${onSubmit} @click=${onClick}
    >${unsafeHTML(screenHtml)}</div
  >`;
}
