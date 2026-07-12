const PRINT_IFRAME_CLEANUP_MS = 60_000;

export function printHtmlInIframe(
  html: string,
  documentRef: Document = document,
): HTMLIFrameElement {
  const iframe = documentRef.createElement('iframe');
  iframe.hidden = true;
  iframe.title = 'Kiempad consultoverzicht afdrukken';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.srcdoc = html;

  iframe.addEventListener(
    'load',
    () => {
      const printWindow = iframe.contentWindow;
      if (!printWindow) {
        iframe.remove();
        return;
      }
      let cleaned = false;
      const cleanup = (): void => {
        if (cleaned) return;
        cleaned = true;
        iframe.remove();
      };
      printWindow.addEventListener('afterprint', cleanup, { once: true });
      printWindow.focus();
      printWindow.print();
      globalThis.setTimeout(cleanup, PRINT_IFRAME_CLEANUP_MS);
    },
    { once: true },
  );

  documentRef.body.append(iframe);
  return iframe;
}
