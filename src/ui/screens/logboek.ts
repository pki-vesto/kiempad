import { html, type TemplateResult } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

export function renderLogboekScreen(screenHtml: string): TemplateResult {
  return html`<div data-lit-screen="logboek">${unsafeHTML(screenHtml)}</div>`;
}
