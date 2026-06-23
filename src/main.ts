/**
 * Kiempad — app-entry (placeholder).
 *
 * Dit is bewust nog een minimale shell: het fundament (F0) staat, de echte app
 * (F1) volgt gefaseerd — zie ROADMAP.md en PRODUCT_BACKLOG.md. De disclaimer
 * hieronder is vanaf het eerste moment zichtbaar (doel G018/G130).
 */

const DISCLAIMER =
  'Kiempad is een persoonlijke informatie- en organisatietool, geen medisch ' +
  'hulpmiddel en geen vervanging van medisch advies. Schema’s volgen altijd de kliniek.';

function render(root: HTMLElement): void {
  root.innerHTML = `
    <main style="font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5;">
      <h1>🌱 Kiempad</h1>
      <p>Fundament staat. De app wordt gefaseerd opgebouwd (zie ROADMAP).</p>
      <p role="note" style="background:#f3f7f2; border-left:4px solid #5b8c5a; padding:0.75rem 1rem; border-radius:4px;">
        ⚠️ ${DISCLAIMER}
      </p>
    </main>
  `;
}

const app = document.getElementById('app');
if (app) render(app);

export { render, DISCLAIMER };
