import { html, type TemplateResult } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

export type StartAction =
  | { type: 'quick-entry'; form: HTMLFormElement }
  | { type: 'feedback-filter'; form: HTMLFormElement; submitter: HTMLElement | null }
  | { type: 'owner-visibility'; form: HTMLFormElement; submitter: HTMLElement | null }
  | { type: 'recommendation'; form: HTMLFormElement; submitter: HTMLElement | null }
  | { type: 'route-focus-close-focus'; button: HTMLButtonElement; status: HTMLElement | null }
  | {
      type: 'route-focus-close-click';
      button: HTMLButtonElement;
      status: HTMLElement | null;
      event: MouseEvent;
    }
  | { type: 'open-feedback-list' };

export function renderStartScreen(
  screenHtml: string,
  dispatch: (action: StartAction) => void,
): TemplateResult {
  const onSubmit = (event: SubmitEvent): void => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const submitter = event.submitter instanceof HTMLElement ? event.submitter : null;
    let action: StartAction | undefined;
    if (form.id === 'quick-entry-form') action = { type: 'quick-entry', form };
    else if (form.matches('[data-daily-recommendation-feedback-control="ready"]')) {
      action = { type: 'feedback-filter', form, submitter };
    } else if (form.matches('[data-daily-recommendation-owner-visibility-card]')) {
      action = { type: 'owner-visibility', form, submitter };
    } else if (
      form.matches('.daily-recommendation-action-form, .supplement-artscheck-action-form')
    ) {
      action = { type: 'recommendation', form, submitter };
    }
    if (!action) return;
    event.preventDefault();
    dispatch(action);
  };
  const onFocusIn = (event: FocusEvent): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>(
      '[data-daily-recommendation-reset-route-focus-close="ready"]',
    );
    if (!button) return;
    dispatch({
      type: 'route-focus-close-focus',
      button,
      status: button.closest<HTMLElement>('[data-daily-recommendation-reset-route-focus="ready"]'),
    });
  };
  const onClick = (event: MouseEvent): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const close = target.closest<HTMLButtonElement>(
      '[data-daily-recommendation-reset-route-focus-close="ready"]',
    );
    if (close) {
      dispatch({
        type: 'route-focus-close-click',
        button: close,
        status: close.closest<HTMLElement>('[data-daily-recommendation-reset-route-focus="ready"]'),
        event,
      });
    } else if (target.closest('[data-daily-advice-feedback-list-open="ready"]')) {
      dispatch({ type: 'open-feedback-list' });
    }
  };

  return html`<div
    data-lit-screen="start"
    @submit=${onSubmit}
    @focusin=${onFocusIn}
    @click=${onClick}
  >${unsafeHTML(screenHtml)}</div>`;
}
