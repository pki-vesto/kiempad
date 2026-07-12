import { afterEach, describe, expect, it, vi } from 'vitest';
import runtimeSource from '../../src/runtime.ts?raw';
import { printHtmlInIframe } from '../../src/ui/iframePrint';

describe('consultprint via iframe', () => {
  afterEach(() => vi.useRealTimers());

  it('print na iframe-load zonder popup en ruimt op na afterprint', () => {
    vi.useFakeTimers();
    const focus = vi.fn();
    const print = vi.fn();
    const remove = vi.fn();
    let loadHandler: (() => void) | undefined;
    let afterPrintHandler: (() => void) | undefined;
    const iframe = {
      hidden: false,
      title: '',
      srcdoc: '',
      contentWindow: {
        focus,
        print,
        addEventListener: vi.fn((_type: string, handler: () => void) => {
          afterPrintHandler = handler;
        }),
      },
      setAttribute: vi.fn(),
      addEventListener: vi.fn((_type: string, handler: () => void) => {
        loadHandler = handler;
      }),
      remove,
    };
    const append = vi.fn();
    const documentRef = {
      createElement: vi.fn(() => iframe),
      body: { append },
    } as unknown as Document;

    const result = printHtmlInIframe('<!doctype html><title>Consult</title>', documentRef);
    loadHandler?.();

    expect(result).toBe(iframe);
    expect(iframe.hidden).toBe(true);
    expect(iframe.srcdoc).toContain('<title>Consult</title>');
    expect(append).toHaveBeenCalledWith(iframe);
    expect(focus).toHaveBeenCalledOnce();
    expect(print).toHaveBeenCalledOnce();
    expect(remove).not.toHaveBeenCalled();

    afterPrintHandler?.();
    expect(remove).toHaveBeenCalledOnce();
    vi.runAllTimers();
    expect(remove).toHaveBeenCalledOnce();
  });

  it('gebruikt geen popup of document.write meer', () => {
    expect(runtimeSource).toContain('printHtmlInIframe(');
    expect(runtimeSource).not.toContain("window.open('', '_blank')");
    expect(runtimeSource).not.toContain('printWindow.document.write');
  });
});
