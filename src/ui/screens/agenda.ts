import { html, type TemplateResult } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

export type AgendaAction =
  | { type: 'export' }
  | { type: 'save'; form: HTMLFormElement }
  | { type: 'import'; form: HTMLFormElement }
  | { type: 'delete'; button: HTMLButtonElement };

export function renderAgendaScreen(
  screenHtml: string,
  dispatch: (action: AgendaAction) => void,
): TemplateResult {
  const onSubmit = (event: SubmitEvent): void => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const formId = form.getAttribute('id');
    const type =
      formId === 'afspraak-form' ? 'save' : formId === 'ics-import-form' ? 'import' : undefined;
    if (!type) return;
    event.preventDefault();
    dispatch({ type, form });
  };
  const onClick = (event: MouseEvent): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>('button');
    if (!button) return;
    if (button.id === 'export-ics') dispatch({ type: 'export' });
    else if (button.id === 'delete-afspraak') dispatch({ type: 'delete', button });
  };

  return html`<div data-lit-screen="agenda" @submit=${onSubmit} @click=${onClick}
    >${unsafeHTML(screenHtml)}</div
  >`;
}
