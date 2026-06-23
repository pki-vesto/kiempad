# Kiempad

> **"Kiem"** (de prille aanleg, het zaadje) **+ "pad"** (de reis die we samen lopen).
> Een warme, niet-klinische, persoonlijke tool die ons helpt grip te houden op ons
> IVF/ICSI-traject.

> ⚠️ **Geen medisch advies.** Kiempad is een **informatie- en organisatietool** voor
> eigen gebruik, **geen medisch hulpmiddel** en **geen vervanging van medisch advies**.
> Schema's volgen altijd wat de kliniek voorschrijft. AI-output is **ongeverifieerd**
> tot een behandelaar het bevestigt. Zie [`PRIVACY.md`](PRIVACY.md) en
> [`docs/adr/0004-geen-medisch-hulpmiddel.md`](docs/adr/0004-geen-medisch-hulpmiddel.md).

---

## Core Context

- **Wat:** een persoonlijke web-app (PWA) ter ondersteuning van het IVF/ICSI-traject
  van **één stel** (Peter & partner).
- **Voor wie:** uitsluitend dit stel. **Geen distributie, geen externe gebruikers.**
- **Regio:** Nederland (vergoedingen, AVG-context, bronnen op NL afgestemd).
- **Grondhouding:** privacy-first en **local-first** — gezondheidsdata blijft
  **lokaal en versleuteld** op het toestel; standaard gaat er **niets** naar derden
  zonder expliciete keuze.
- **Status:** documentatie- en fundamentfase (v0.1). Zie
  [`CURRENT_STATE.md`](CURRENT_STATE.md) voor wat wél/niet gebouwd is.
- **Plek in het ecosysteem:** eigen **publieke** repo onder `pki-vesto`, naast de
  andere apps. De **code en docs zijn publiek**; de **gezondheidsdata blijft
  local-first en privé** en staat niet in de repo. Bewust **buiten** de Sentinel
  autonome build-governance: dit is een persoonlijke app die met de hand (met
  AI-assistentie) wordt gebouwd. Zie [`MASTER_CONTEXT.md`](MASTER_CONTEXT.md) en
  [`docs/adr/0006-repo-publiek.md`](docs/adr/0006-repo-publiek.md).

## Concept

Kiempad lost vijf concrete problemen op gedurende het traject:

1. **Overzicht** over de fasen en planning van het traject.
2. **Leefstijl & gezondheid** — wat je zelf kunt doen, met NL-bronnen.
3. **Kosten & vergoedingen** — grip op het financiële plaatje (NL 2026).
4. **Research** verzamelen en (optioneel, opt-in) samenvatten met AI.
5. **Afwegingen** tussen opties gestructureerd vastleggen.

De MVP richt zich op overzicht, agenda, het medicatie-/injectieschema met
herinneringen, vragen-voor-de-arts en een basis-kennisbank — alles op een
versleutelde, lokale opslag.

## Setup (fresh checkout)

> Vereist: Node ≥ 20 en npm. Een Docker-setup is optioneel (zie hieronder).

```bash
git clone git@github.com:pki-vesto/kiempad.git
cd kiempad
cp .env.example .env      # standaard hoeft hier niets ingevuld te worden
npm install
```

## Local Development

```bash
npm run dev          # of: make dev   — start de Vite dev-server (PWA)
```

De app draait volledig client-side. Bij eerste gebruik kies je een **wachtwoord
(passphrase)**; daarvan wordt een sleutel afgeleid waarmee alle lokale data wordt
versleuteld (zie [`SECURITY.md`](SECURITY.md)). Zonder dat wachtwoord is de data
niet leesbaar.

## Tests & build

```bash
npm run typecheck    # TypeScript-typecheck (tsc --noEmit)
npm run test         # of: make test  — Vitest unit-/integratietests
npm run build        # productiebuild (statische PWA in dist/)
```

Optioneel zelf-hosten van de statische build:

```bash
docker compose up -d --build    # of: make up   — serveert op http://localhost:8088
```

## Architecture Summary

- **Client-side PWA** in TypeScript (Vite). Geen verplichte backend voor de MVP.
- **Local-first opslag:** IndexedDB met **client-side versleuteling** (Web Crypto,
  AES-GCM; sleutel afgeleid van een passphrase).
- **Back-up:** versleutelde export/import als bestand (handmatig, op je eigen
  apparaat).
- **AI (optioneel, opt-in):** alleen op expliciet verzoek; samenvatten van research
  met waarschuwingslabels en bronvermelding, **nooit** dosering/diagnose/behandelkeuze.
- **Sync (later):** optionele end-to-end versleutelde sync tussen apparaten; de
  server ziet enkel onleesbare blobs.

Volledige uitwerking en afgewogen alternatieven: [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Observability

Bewust **minimaal en privacyvriendelijk**: **geen** analytics, tracking of
telemetrie naar buiten. "Observability" beperkt zich tot lokale, in-app feedback:
een lokaal gebeurtenissenlog (zichtbaar in de app, blijft op het toestel) en
duidelijke foutmeldingen. Zie [`PRIVACY.md`](PRIVACY.md).

## Source Of Truth

| Onderwerp | Document |
|---|---|
| Visie & succes | [`VISIE.md`](VISIE.md) |
| Doelen (100+) & backlog | [`PRODUCT_BACKLOG.md`](PRODUCT_BACKLOG.md) |
| Architectuur & alternatieven | [`ARCHITECTURE.md`](ARCHITECTURE.md) |
| Datamodel | [`DATAMODEL.md`](DATAMODEL.md) |
| Roadmap (gefaseerd, MVP eerst) | [`ROADMAP.md`](ROADMAP.md) |
| Huidige status | [`CURRENT_STATE.md`](CURRENT_STATE.md) |
| Productinvarianten & werkafspraken | [`MASTER_CONTEXT.md`](MASTER_CONTEXT.md) |
| Privacy & AVG | [`PRIVACY.md`](PRIVACY.md) |
| Beveiliging | [`SECURITY.md`](SECURITY.md) |
| Beslissingen (ADR's) | [`docs/adr/`](docs/adr/) |
| Kennisbank-inhoud & NL-bronnen | [`docs/KENNISBANK.md`](docs/KENNISBANK.md) |
| Operationeel/runbook | [`docs/RUNBOOK.md`](docs/RUNBOOK.md) |
| Werkwijze/bijdragen | [`CONTRIBUTING.md`](CONTRIBUTING.md) |

De **canonieke bron** voor wat we bouwen is `PRODUCT_BACKLOG.md` (de doelen) samen
met `ROADMAP.md` (de volgorde). Documenten gaan vóór losse aantekeningen.
