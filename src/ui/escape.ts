// Shared HTML-escaping helpers for the string-template UI layer.
// Extracted from appShell.ts so the src/ui component helpers can reuse them
// without importing appShell (avoids a circular dependency).

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function escapeAttribute(value: string): string {
  return escapeHtml(value);
}
