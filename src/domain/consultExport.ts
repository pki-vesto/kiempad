import type { Afspraak, Medicatie, Vraag } from './types';

export type ConsultExportPayload = {
  afspraken: readonly Afspraak[];
  vragen: readonly Vraag[];
  medicatie: readonly Medicatie[];
  gegenereerdOp?: string;
};

export function maakConsultPrintHtml(payload: ConsultExportPayload): string {
  const generatedAt = payload.gegenereerdOp ?? new Date().toISOString();
  const afspraken = [...payload.afspraken].sort((a, b) => a.datumTijd.localeCompare(b.datumTijd));
  const vragen = [...payload.vragen].sort((a, b) => (a.prioriteit ?? 999) - (b.prioriteit ?? 999));
  const medicatie = [...payload.medicatie].sort((a, b) => a.naam.localeCompare(b.naam));

  return `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <title>Kiempad consultoverzicht</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 32px; color: #1f2b24; }
    h1, h2 { margin-bottom: 8px; }
    section { margin-top: 24px; }
    li { margin-bottom: 8px; }
    .muted { color: #465148; }
    @media print { button { display: none; } }
  </style>
</head>
<body>
  <button onclick="window.print()">Sla op als PDF</button>
  <h1>Kiempad consultoverzicht</h1>
  <p class="muted">Lokaal gegenereerd op ${escapeHtml(generatedAt.slice(0, 16).replace('T', ' '))}. Geen medisch advies.</p>
  <section>
    <h2>Afspraken</h2>
    ${renderList(afspraken, renderAfspraak)}
  </section>
  <section>
    <h2>Vragen voor de arts</h2>
    ${renderList(vragen, renderVraag)}
  </section>
  <section>
    <h2>Medicatie</h2>
    ${renderList(medicatie, renderMedicatie)}
  </section>
</body>
</html>`;
}

function renderList<T>(items: readonly T[], renderItem: (item: T) => string): string {
  if (items.length === 0) return '<p class="muted">Geen gegevens vastgelegd.</p>';
  return `<ol>${items.map(renderItem).join('')}</ol>`;
}

function renderAfspraak(afspraak: Afspraak): string {
  return `<li><strong>${escapeHtml(afspraak.titel)}</strong> · ${escapeHtml(afspraak.datumTijd.replace('T', ' '))}${afspraak.locatie ? ` · ${escapeHtml(afspraak.locatie)}` : ''}${afspraak.voorbereiding ? `<br />Voorbereiding: ${escapeHtml(afspraak.voorbereiding)}` : ''}</li>`;
}

function renderVraag(vraag: Vraag): string {
  return `<li><strong>${escapeHtml(vraag.vraag)}</strong>${vraag.beantwoord && vraag.antwoord ? `<br />Antwoord: ${escapeHtml(vraag.antwoord)}` : ''}</li>`;
}

function renderMedicatie(medicatie: Medicatie): string {
  return `<li><strong>${escapeHtml(medicatie.naam)}</strong>${medicatie.voorgeschrevenDosis ? ` · ${escapeHtml(medicatie.voorgeschrevenDosis)}` : ''}${medicatie.instructie ? `<br />Instructie: ${escapeHtml(medicatie.instructie)}` : ''}</li>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
