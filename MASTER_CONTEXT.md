# Kiempad - Master Context

> De invarianten en werkafspraken die altijd gelden. Als een ander document of een
> implementatie hiermee botst, wint dit document (behalve waar de kliniek iets
> voorschrijft — dan wint de kliniek).

## 1. Definitie

Kiempad is een **persoonlijke, local-first PWA** die **één stel** (Peter & partner)
ondersteunt tijdens hun **IVF/ICSI-traject** in **Nederland**. Het is een
**informatie- en organisatietool**, **geen medisch hulpmiddel** en **geen vervanging
van medisch advies**, en is uitsluitend voor **privégebruik** (geen distributie).

## 2. Productdomeinen

1. **Traject & planning** — cyclus, fasen, voortgang.
2. **Agenda** — afspraken.
3. **Medicatie** — schema, inname/injectie (DoseLog), herinneringen.
4. **Voorbereiding** — vragen voor de arts.
5. **Kennis** — kennisbank (fasen, leefstijl, kosten), met arts-/AI-markeringen.
6. **Kosten & vergoedingen** — NL, 2026.
7. **Research & AI** — verzamelen en (opt-in) samenvatten.
8. **Welzijn** — symptomen/cyclus, mentale check-in.
9. **Afwegingen** — beslisnotities.
10. **Data & privacy** — opslag, versleuteling, back-up, (later) sync.

## 3. Architectuurprincipes

- **Local-first**: het toestel is de bron; werkt offline.
- **Versleuteld at rest**: alle gevoelige data versleuteld (AES-GCM, sleutel uit
  passphrase).
- **Geen standaard uitgaand verkeer**: niets naar derden zonder expliciete opt-in.
- **Eén taal, lichte stack**: TypeScript/Vite/React, Vitest.
- **Pure, testbare domeinlaag**, gescheiden van UI en opslag.
- **Klein beginnen**, gefaseerd uitbreiden.

## 4. Policy Enforcement (harde regels)

- **P1 — Geen medische beslissingen door de app/AI.** Geen dosering, diagnose of
  behandelkeuze. Schema's volgen de kliniek. (ADR-0004)
- **P2 — Privacy by default.** Data lokaal + versleuteld; geen tracking/analytics/ads;
  minimale data naar buiten; sleutel verlaat het toestel nooit. (PRIVACY.md, SECURITY.md)
- **P3 — Opt-in voor alles wat naar buiten gaat.** AI en sync staan uit tot de
  gebruiker ze bewust aanzet, met dataminimalisatie. (ADR-0003)
- **P4 — Markeer herkomst & verificatie.** Kennis/research toont `ai_gegenereerd` en
  `geverifieerd_met_arts`; AI-output draagt een waarschuwingslabel + bron.
- **P5 — Data privé.** Gezondheidsdata blijft **lokaal + versleuteld** en gaat **nooit**
  de repo in; de app wordt **niet als product aan derden** uitgerold. De **repo
  (code+docs) is publiek** (ADR-0006) — er staat geen persoonsdata in, dus de
  AVG-huishoudelijke uitzondering voor de gegevensverwerking blijft gelden. (LICENSE,
  PRIVACY.md)
- **P6 — Disclaimer zichtbaar** in app én documentatie.

## 5. Governance-Grenzen

- **Codex bouwt en merget autonoom** via `/goal`, zonder tussentijdse menselijke
  beslissingen; **groene CI is de harde merge-gate** (ADR-0007). Kiempad blijft wel
  **buiten** de Sentinel autonome build-engine en de portfolio-PR-loops (ADR-0005).
- De **publieke** repo onder `pki-vesto` is de enige plek voor code/docs;
  gezondheidsdata staat er niet in. Nooit secrets of databestanden in git (ADR-0006).
- Medische inhoud in de kennisbank is **concept** tot een behandelaar het bevestigt.

## 6. Prioriteiten

1. Privacy/veiligheid van de data.
2. De "niet missen"-kern: medicatie/injecties + herinneringen.
3. Overzicht: traject/fasen + agenda.
4. Voorbereiding: vragen voor de arts.
5. Daarna: kosten, research/AI, welzijn, afwegingen, sync/export.

## 7. Documenten

Zie de tabel "Source Of Truth" in [`README.md`](README.md). Canon: `PRODUCT_BACKLOG.md`
(doelen) + `ROADMAP.md` (volgorde); keuzes in `docs/adr/`.

## 8. Definition Of Done

Een wijziging is "done" als:

- Functioneel werkend en handmatig geprobeerd op het traject-scenario.
- `npm run typecheck` en `npm run test` groen; relevante tests toegevoegd.
- Privacy-/policy-regels (sectie 4) gerespecteerd; geen nieuwe uitgaande dataroute
  zonder opt-in.
- `CURRENT_STATE.md` en de betreffende doelen in `PRODUCT_BACKLOG.md` bijgewerkt; bij
  een keuze een ADR toegevoegd/aangepast.
- `CHANGELOG.md` bijgewerkt.
