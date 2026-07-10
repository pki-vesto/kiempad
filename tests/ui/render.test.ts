import { beforeEach, describe, expect, it, vi } from 'vitest';

const { renderTemplate } = vi.hoisted(() => ({ renderTemplate: vi.fn() }));

vi.mock('lit-html', () => ({
  html: (strings: TemplateStringsArray, ...values: unknown[]) => ({ strings, values }),
  render: renderTemplate,
}));
vi.mock('lit-html/directives/unsafe-html.js', () => ({
  unsafeHTML: (value: string) => value,
}));

import { canRenderTargeted, mountView, renderScreen } from '../../src/ui/render';

describe('UI render-boundary', () => {
  beforeEach(() => renderTemplate.mockReset());

  it('mount de volledige shell alleen in de opgegeven root', () => {
    const attributes = new Map<string, string>();
    const root = {
      setAttribute: (name: string, value: string) => attributes.set(name, value),
    } as unknown as HTMLElement;

    mountView(root, '<main>Start</main>', '#start');

    expect(renderTemplate).toHaveBeenCalledOnce();
    expect(renderTemplate.mock.calls[0]?.[1]).toBe(root);
    expect(attributes.get('data-render-route')).toBe('#start');
  });

  it('rendert een same-screen mutatie gericht en behoudt boundary-scroll en chrome-focus', () => {
    const focusedChromeControl = { id: 'lock-button' };
    const boundary = {
      dataset: { screenRoot: 'welzijn' },
      ownerDocument: { activeElement: focusedChromeControl },
      replaceChildren: vi.fn(),
      scrollTop: 240,
      scrollLeft: 12,
    } as unknown as HTMLElement;
    const root = {
      activeElement: focusedChromeControl,
      getAttribute: (name: string) => (name === 'data-render-route' ? '#welzijn' : null),
      querySelector: (selector: string) => (selector === '#screen-root' ? boundary : null),
    } as unknown as HTMLElement;

    expect(canRenderTargeted(root, '#welzijn', 'welzijn')).toBe(true);
    renderScreen(root, '<section>Bijgewerkt</section>');

    expect(renderTemplate).toHaveBeenCalledOnce();
    expect(renderTemplate.mock.calls[0]?.[1]).toBe(boundary);
    expect(boundary.scrollTop).toBe(240);
    expect(boundary.scrollLeft).toBe(12);
    expect((root as unknown as { activeElement: unknown }).activeElement).toBe(
      focusedChromeControl,
    );
  });

  it('weigert targeted rendering na navigatie of bij een ander scherm', () => {
    const boundary = { dataset: { screenRoot: 'welzijn' } };
    const root = {
      getAttribute: () => '#welzijn',
      querySelector: () => boundary,
    } as unknown as HTMLElement;

    expect(canRenderTargeted(root, '#kosten', 'welzijn')).toBe(false);
    expect(canRenderTargeted(root, '#welzijn', 'kosten')).toBe(false);
  });
});
