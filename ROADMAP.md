# Kiempad — ROADMAP

> De huisstijl-fasen ("Durable Substrate", "Planning & Memory", …) zijn
> platformtaal van Sentinel en passen niet bij een persoonlijke product-app. Deze
> roadmap is daarom productgericht en gefaseerd, **MVP eerst**. De fasenummers hier
> (F0–F4) komen één-op-één terug als de `fase`-kolom in
> [`PRODUCT_BACKLOG.md`](PRODUCT_BACKLOG.md).

## 0. Kernprincipe

**Klein beginnen en snel waarde leveren.** Liever een kleine, betrouwbare,
privacy-veilige basis die we echt gebruiken, dan een groot bouwwerk dat half af is.
Elke fase is op zichzelf bruikbaar. Privacy en de niet-medische grondhouding zijn in
elke fase non-negotiable.

## F0 — Fundament (nu)

**Doel:** een heldere, onderhoudbare basis. Documentatieset, repo-scaffold,
datamodel-schets, keuzes vastgelegd als ADR's.

- Documentatieset compleet (deze repo).
- Repo-scaffold: TypeScript/Vite, tests (Vitest), CI, .github-templates.
- Datamodel-kernvormen in `src/domain/types.ts`.
- **Mijlpaal M0:** repo staat, docs kloppen, `npm run test`/`typecheck` groen.

## F1 — MVP (must-have)

**Doel:** dagelijks bruikbaar overzicht + de dingen die je niet mag missen.

- **Centrale encrypted opslag** (passphrase → sleutel, AES-GCM payloads, centrale
  user-scoped database; lokale vault alleen legacy/fallback).
- **Trajectoverzicht & fasen** — waar zitten we, wat is de volgende stap.
- **Agenda & afspraken** — afspraken vastleggen en zien.
- **Medicatie- & injectieschema** — middelen, voorgeschreven dosis (zoals door de
  kliniek opgegeven), inname/injectie afvinken (DoseLog).
- **Herinneringen** — betrouwbare lokale notificaties voor medicatie en afspraken.
- **Vragen-voor-de-arts** — verzamelen, meenemen, beantwoord vastleggen.
- **Basis-kennisbank** — vaste NL-inhoud over fasen/leefstijl/kosten met disclaimer.
- **Disclaimer** zichtbaar in de app.
- **Mijlpaal M1:** een volledige cyclus is te plannen, te volgen en geen inname
  wordt gemist; alle gevoelige data staat versleuteld at rest.

## F2 — Nice-to-have

**Doel:** meer grip en context, zonder de basis te verzwaren.

- **Kosten-/vergoedingenoverzicht** (NL 2026: 3 vergoede pogingen <43 jr, eigen
  risico, "telt pas na geslaagde punctie").
- **Symptoom-/cyclus-logging.**
- **Research-bibliotheek** + **AI-samenvatting** (opt-in, met waarborgen).
- **Dossieruploads** voor onderzoeken, beeldmateriaal, gespreksverslagen en
  embryokwaliteit, centraal encrypted en koppelbaar aan trajectcontext.
- **Gedeelde modus** voor beide partners (twee profielen, één dataset).
- **Afwegingen/beslisnotities** (Decision-entiteit).
- **Mentale check-in.**
- **Versleutelde back-up/export & import** als bestand.
- **Mijlpaal M2:** kosten inzichtelijk, research vindbaar en (opt-in) samen te
  vatten, en de app voelt voor beide partners van ons samen.

## F3 — Later

**Doel:** comfort en continuïteit over apparaten en cycli.

- **Multi-device continuiteit** via centrale encrypted records tussen apparaten.
- **PDF-export** voor het consult.
- **Agenda-integratie (ICS).**
- **Trends over meerdere cycli.**
- **Mijlpaal M3:** beide partners werken op eigen toestel met dezelfde data; een
  consult is met één export voor te bereiden.

## F4 — Toekomst (optioneel/onderzoekend)

- On-device AI (geen cloud-stap meer nodig).
- Rijkere lokale zoekindex over research.
- Bredere toegankelijkheids- en taalopties.

## 90-dagen plan (indicatief)

- **Dag 1–14:** F0 afronden + centrale encrypted opslag/versleuteling
  (F1-fundament) werkend.
- **Dag 15–45:** F1 traject/agenda/medicatie/herinneringen/vragen + kennisbank.
- **Dag 46–90:** F1 afmaken + verfijnen, eerste F2-items (kosten, back-up/export).

Dit is richtinggevend, geen verplichting; tempo volgt het echte traject.

## Verwante documenten

- Doelen/backlog: [`PRODUCT_BACKLOG.md`](PRODUCT_BACKLOG.md)
- Architectuur: [`ARCHITECTURE.md`](ARCHITECTURE.md)
- Huidige status: [`CURRENT_STATE.md`](CURRENT_STATE.md)
- Beslissingen: [`docs/adr/`](docs/adr/)
