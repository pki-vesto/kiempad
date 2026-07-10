import { html, type TemplateResult } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

export type MedicatieAction =
  | { type: 'save'; form: HTMLFormElement }
  | { type: 'import'; form: HTMLFormElement }
  | { type: 'dose'; form: HTMLFormElement; submitter: HTMLElement | null }
  | { type: 'delete'; button: HTMLButtonElement };

export function renderMedicatieScreen(
  screenHtml: string,
  dispatch: (action: MedicatieAction) => void,
): TemplateResult {
  const onSubmit = (event: SubmitEvent): void => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const type = form.matches('#medicatie-form')
      ? 'save'
      : form.matches('#medicatie-import-form')
        ? 'import'
        : form.matches('.dose-log-form')
          ? 'dose'
          : undefined;
    if (!type) return;
    event.preventDefault();
    if (type === 'dose') dispatch({ type, form, submitter: event.submitter });
    else dispatch({ type, form });
  };
  const onClick = (event: MouseEvent): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>('#delete-medicatie');
    if (button) dispatch({ type: 'delete', button });
  };

  return html`<div data-lit-screen="medicatie" @submit=${onSubmit} @click=${onClick}
    >${unsafeHTML(screenHtml)}</div
  >`;
}
