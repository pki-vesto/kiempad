import { html, type TemplateResult } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

export type BackupAction =
  | { type: 'reload'; button: HTMLButtonElement }
  | { type: 'export-backup' }
  | { type: 'export-sync' }
  | { type: 'copy-summary'; button: HTMLButtonElement }
  | { type: 'import-backup'; form: HTMLFormElement }
  | { type: 'import-sync'; form: HTMLFormElement }
  | { type: 'webauthn-enroll' };

export function renderBackupScreen(
  screenHtml: string,
  dispatch: (action: BackupAction) => void,
): TemplateResult {
  const onSubmit = (event: SubmitEvent): void => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const type =
      form.id === 'import-backup-form'
        ? 'import-backup'
        : form.id === 'import-sync-form'
          ? 'import-sync'
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
    if (
      button.matches(
        '[data-central-session-renewal-action="reload"], [data-central-replay-conflict-action="reload"]',
      )
    )
      dispatch({ type: 'reload', button });
    else if (button.id === 'export-backup') dispatch({ type: 'export-backup' });
    else if (button.id === 'export-sync') dispatch({ type: 'export-sync' });
    else if (button.hasAttribute('data-backup-copy-kind'))
      dispatch({ type: 'copy-summary', button });
    else if (button.id === 'webauthn-enroll') dispatch({ type: 'webauthn-enroll' });
  };

  return html`<div data-lit-screen="backup" @submit=${onSubmit} @click=${onClick}
    >${unsafeHTML(screenHtml)}</div
  >`;
}
