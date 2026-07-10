import { html, type TemplateResult } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

export type TrajectAction =
  | { type: 'save'; form: HTMLFormElement }
  | { type: 'graph-filter'; form: HTMLFormElement }
  | { type: 'timeline-filter'; form: HTMLFormElement }
  | { type: 'phase'; button: HTMLButtonElement }
  | { type: 'delete'; button: HTMLButtonElement }
  | { type: 'archive'; button: HTMLButtonElement };

export function renderTrajectScreen(
  screenHtml: string,
  dispatch: (action: TrajectAction) => void,
): TemplateResult {
  const onSubmit = (event: SubmitEvent): void => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const type = form.matches('#traject-form, #traject-new-form')
      ? 'save'
      : form.matches('#graph-filter-form')
        ? 'graph-filter'
        : form.matches('#timeline-filter-form')
          ? 'timeline-filter'
          : undefined;
    if (!type) return;
    event.preventDefault();
    dispatch({ type, form });
  };
  const onClick = (event: MouseEvent): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>('button');
    if (!button) return;
    if (button.id === 'delete-traject') dispatch({ type: 'delete', button });
    else if (button.matches('.archive-traject')) dispatch({ type: 'archive', button });
    else if (button.matches('.phase-button')) dispatch({ type: 'phase', button });
  };

  return html`<div data-lit-screen="traject" @submit=${onSubmit} @click=${onClick}
    >${unsafeHTML(screenHtml)}</div
  >`;
}
