# ADR Review Evidence Index

Deze index koppelt alle huidige `ADR Needed: yes` doelen aan hun ADR-review evidence.
Zolang een review nog niet is uitgevoerd, blijft de evidence location expliciet
`pending` en is de follow-up status `required before implementation`.

Leg in deze index alleen architectuurcontext vast. Geen gebruikersdata, tokens,
providerpayloads, lokale dossierdetails of volledige runtimepayloads.

| Goal | Evidence location | Decision outcome | Follow-up status |
|---|---|---|---|
| G266 | pending: use `docs/ADR_REVIEW_EVIDENCE_TEMPLATE.md` | pending review | required before implementation |
| G304 | pending: use `docs/ADR_REVIEW_EVIDENCE_TEMPLATE.md` | pending review | required before implementation |
| G315 | pending: use `docs/ADR_REVIEW_EVIDENCE_TEMPLATE.md` | pending review | required before implementation |
| G323 | pending: use `docs/ADR_REVIEW_EVIDENCE_TEMPLATE.md` | pending review | required before implementation |
| G344 | pending: use `docs/ADR_REVIEW_EVIDENCE_TEMPLATE.md` | pending review | required before implementation |

## Onderhoud

- Voeg elke nieuwe `ADR Needed: yes` goal direct toe met `pending` evidence.
- Werk `Evidence location` bij naar een PR-link of reviewdocument zodra de review is
  uitgevoerd.
- Gebruik `Decision outcome` waarden uit het template: `existing ADR sufficient`,
  `update existing ADR`, `create new ADR` of `defer goal`.
- Werk `Follow-up status` bij naar `required before merge`, `complete` of een korte
  concrete status wanneer de review evidence dat bewijst.
- Verwijder geen afgeronde evidence uit de index; traceerbaarheid blijft belangrijker
  dan compactheid.
