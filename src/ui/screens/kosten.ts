import { html, type TemplateResult } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

export type KostenAction =
  | { type: 'save'; form: HTMLFormElement }
  | { type: 'delete'; button: HTMLButtonElement };

export type KostenScreenDispatch = (action: KostenAction) => void;

export function renderKostenScreen(
  screenHtml: string,
  dispatch: KostenScreenDispatch,
): TemplateResult {
  const onSubmit = (event: SubmitEvent): void => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.classList.contains('kosten-form')) return;
    event.preventDefault();
    dispatch({ type: 'save', form });
  };
  const onClick = (event: MouseEvent): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>('.delete-kosten');
    if (!button) return;
    dispatch({ type: 'delete', button });
  };

  return html`<div data-lit-screen="kosten" @submit=${onSubmit} @click=${onClick}
    >${unsafeHTML(screenHtml)}</div
  >`;
}
