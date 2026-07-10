import { html, render as renderTemplate } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

import type { ScreenId } from './router';

const RENDER_ROUTE_ATTRIBUTE = 'data-render-route';
const initializedScreenBoundaries = new WeakSet<HTMLElement>();

export function mountView(root: HTMLElement, shellHtml: string, routeKey: string): void {
  renderTemplate(html`${unsafeHTML(shellHtml)}`, root);
  root.setAttribute(RENDER_ROUTE_ATTRIBUTE, routeKey);
}

export function canRenderTargeted(root: HTMLElement, routeKey: string, screen: ScreenId): boolean {
  const boundary = root.querySelector<HTMLElement>('#screen-root');
  return (
    boundary !== null &&
    root.getAttribute(RENDER_ROUTE_ATTRIBUTE) === routeKey &&
    boundary.dataset.screenRoot === screen
  );
}

export function renderScreen(root: HTMLElement, screenHtml: string): void {
  const boundary = root.querySelector<HTMLElement>('#screen-root');
  if (!boundary) throw new Error('De #screen-root render-boundary ontbreekt.');

  const scrollTop = boundary.scrollTop;
  const scrollLeft = boundary.scrollLeft;
  const activeElement = boundary.ownerDocument.activeElement;
  const focusId =
    typeof HTMLElement !== 'undefined' &&
    activeElement instanceof HTMLElement &&
    boundary.contains(activeElement) &&
    activeElement.id
      ? activeElement.id
      : undefined;
  const selection =
    (typeof HTMLInputElement !== 'undefined' && activeElement instanceof HTMLInputElement) ||
    (typeof HTMLTextAreaElement !== 'undefined' && activeElement instanceof HTMLTextAreaElement)
      ? { start: activeElement.selectionStart, end: activeElement.selectionEnd }
      : undefined;
  if (!initializedScreenBoundaries.has(boundary)) {
    boundary.replaceChildren();
    initializedScreenBoundaries.add(boundary);
  }
  renderTemplate(html`${unsafeHTML(screenHtml)}`, boundary);
  boundary.scrollTop = scrollTop;
  boundary.scrollLeft = scrollLeft;

  if (focusId) {
    const focusTarget = boundary.ownerDocument.getElementById(focusId);
    if (
      typeof HTMLElement !== 'undefined' &&
      focusTarget instanceof HTMLElement &&
      boundary.contains(focusTarget)
    ) {
      focusTarget.focus({ preventScroll: true });
      if (
        selection &&
        ((typeof HTMLInputElement !== 'undefined' && focusTarget instanceof HTMLInputElement) ||
          (typeof HTMLTextAreaElement !== 'undefined' &&
            focusTarget instanceof HTMLTextAreaElement))
      ) {
        focusTarget.setSelectionRange(selection.start, selection.end);
      }
    }
  }
}
