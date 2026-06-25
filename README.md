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
- **Grondhouding:** privacy-first en **centraal encrypted** — nieuwe data hoort
  beschikbaar te zijn op gekoppelde apparaten, maar medische inhoud blijft
  client-side versleuteld; standaard gaat er **niets** naar derden zonder expliciete
  keuze.
- **Status:** F1 is gestart met een eerste app-shell bovenop het fundament. Zie
  [`CURRENT_STATE.md`](CURRENT_STATE.md) voor wat wél/niet gebouwd is.
- **Plek in het ecosysteem:** eigen **publieke** repo onder `pki-vesto`, naast de
  andere apps. De **code en docs zijn publiek**; de **gezondheidsdata blijft
  encrypted en privé** en staat niet in de repo. Bewust **buiten** de Sentinel
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
herinneringen, vragen-voor-de-arts en een basis-kennisbank — met centrale encrypted
opslag als nieuwe richting en de lokale vault als legacy/compatibiliteit.

## Setup (fresh checkout)

> Vereist: Node ≥ 20.19 en npm. Een Docker-setup is optioneel (zie hieronder).

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

De app gebruikt een client-side encryptielaag. Bij eerste gebruik kies je een
**wachtwoord (passphrase)**; daarvan wordt een sleutel afgeleid waarmee gevoelige
payloads worden versleuteld (zie [`SECURITY.md`](SECURITY.md)). Zonder dat
wachtwoord is de data niet leesbaar. Bestaande lokale vaults hoeven niet te worden
gemigreerd; nieuwe data beweegt naar het centrale encrypted model.

## Tests & build

```bash
npm run typecheck    # TypeScript-typecheck (tsc --noEmit)
npm run test         # of: make test  — Vitest unit-/integratietests
npm run build        # productiebuild (statische PWA in dist/)
npm run assets:check # controleert bron- en buildassets op externe asset-URL's
npm run secrets:check # lichte scan op gangbare credentialpatronen
npm run fixtures:check # scan testfixtures op niet-synthetische gevoelige data
npm run smoke:offline # Playwright-smoke: eerste bezoek, offline reload via service worker
npm run smoke:central # Playwright-smoke: PWA tegen echte centrale backend + encrypted persistence
npm run drill:backup # export/import/ontgrendel-drill met representatieve encrypted records
npm run backlog:health # bewaakt backlogdrift en vereist standaard minimaal 100 open doelen
```

`npm run backlog:health` gebruikt standaard `--minimum-open-goals 100`. Gebruik alleen
voor lokale experimenten of kleine fixtures een tijdelijke custom drempel, bijvoorbeeld
`npm run backlog:health -- --minimum-open-goals 2`; de permanente backlogregel blijft
minimaal 100 open doelen.

Optionele GitHub issue-driftcheck zonder issue bodies:

```bash
gh issue list --state all --limit 200 --json number,title,state,url > /tmp/kiempad-issues.json
stat -c %y /tmp/kiempad-issues.json
npm run backlog:health -- --issues-json /tmp/kiempad-issues.json
rm -f /tmp/kiempad-issues.json
```

Grotere issuehistorie valideren:

```bash
gh issue list --state all --limit 500 --json number,title,state,url > /tmp/kiempad-issues.json
npm run backlog:health -- --issues-json /tmp/kiempad-issues.json --issue-snapshot-limit 500
rm -f /tmp/kiempad-issues.json
```

Bewaar deze snapshot niet in de repo; hij bevat alleen issue-nummer, titel, state en
URL. Maak hem direct voor validatie, controleer de timestamp bij twijfel en ruim
`/tmp/kiempad-issues.json` na lokale validatie direct op. Als de snapshot precies
200 issues bevat, raakt hij de standaardlimiet; verhoog dan de `--limit` voordat je
op de issue-driftcheck vertrouwt en geef dezelfde waarde mee aan backlog-health,
bijvoorbeeld `npm run backlog:health -- --issues-json /tmp/kiempad-issues.json --issue-snapshot-limit 500`.
Bij een dubbele goal-id in de snapshot: controleer eerst oude gesloten verzamelissues
en hernoem titels die nog een `G###` patroon bevatten; exporteer geen issue bodies.
Gebruik `--json` wanneer automation de gesanitized
`issueSnapshot.duplicateIssues`, `issueSnapshot.missingIssueLinks` of
`issueSnapshot.nonOpenIssueLinks` wil lezen. Voor afgeronde doelen met nog open
issues staat dezelfde veilige issuevorm in `issueSnapshot.completedGoalOpenIssues`.
Zie [`docs/BACKLOG_HEALTH_JSON_REFERENCE.md`](docs/BACKLOG_HEALTH_JSON_REFERENCE.md)
voor de stabiele JSON-shape.

Optioneel zelf-hosten van de statische build:

```bash
docker compose up -d --build    # of: make up   — serveert op http://localhost:8088
```

Publicatie via een aparte Tailscale HTTPS-node draait op
`https://kiempad.tail9d0c71.ts.net`; beheer loopt via
`docker-compose.tailscale.yml` en `npm run deploy:tailscale`; zie
[`docs/TAILSCALE_DEPLOY.md`](docs/TAILSCALE_DEPLOY.md).

De centrale encrypted API kan lokaal apart gestart worden:

```bash
KIEMPAD_CENTRAL_PERSISTENCE_FILE=/tmp/kiempad-central-db.json npm run backend:central
```

Koppel de PWA aan die API via `.env`:

```bash
VITE_KIEMPAD_CENTRAL_API_URL=http://127.0.0.1:8099
VITE_KIEMPAD_CENTRAL_USER_ID=kiempad-private-user
```

Als `VITE_KIEMPAD_CENTRAL_API_URL` ontbreekt, start de app bewust in de legacy
lokale IndexedDB-kluis. Als de centrale URL wel gezet is maar sessie-uitgifte faalt,
valt de app niet stilletjes terug naar lokaal; de PWA toont dan een centrale
bootstrapfout met backend/env-controlepunten.

De backend staat standaard alleen `kiempad-private-user` toe voor sessie-uitgifte.
Gebruik `KIEMPAD_CENTRAL_ALLOWED_USER_IDS=kiempad-private-user` om die server-side
owner-policy expliciet te zetten; de `VITE_...USER_ID` in de frontend is geen
autoriteit. Browserclients moeten daarnaast vanaf een toegestane origin komen; voor
lokale ontwikkeling zijn `http://localhost:5173`, `http://127.0.0.1:5173` en
previewpoorten standaard toegestaan via `KIEMPAD_CENTRAL_ALLOWED_ORIGINS`.

Voor een containerwrapper:

```bash
docker compose -f docker-compose.central.yml up -d --build
```

Details en beveiligingsnotities staan in
[`docs/CENTRAL_ENCRYPTED_BACKEND.md`](docs/CENTRAL_ENCRYPTED_BACKEND.md).

## Architecture Summary

- **Client-side PWA** in TypeScript (Vite), met een centrale encrypted data-API als
  primaire opslagrichting wanneer `VITE_KIEMPAD_CENTRAL_API_URL` is ingesteld.
- **Centrale encrypted opslag/API:** minimale server-side indexmetadata plus
  **client-side versleutelde** payloads (Web Crypto, AES-GCM; sleutel afgeleid van
  een passphrase). API-toegang loopt via opaque sessietokens; de server resolveert
  tokens naar user-scoped sessies en geeft alleen sessies uit voor server-side
  toegestane users. De fetch-client kan een verlopen token één keer vernieuwen voor
  dezelfde centrale user-scope zonder passphrase of secrets in de frontend op te
  slaan. Het HTTP-style contract heeft `/sessions`, `/meta/*` en `/records/*`
  endpoints met veilige foutmapping.
- **Duurzame centrale persistence:** server-side snapshots/adapters bewaren alleen
  owner/indexmetadata en encrypted envelopes; medische payloads blijven onleesbaar
  zonder client key.
- **Node backend boundary:** `createCentralNodeHttpServer` wiret de centrale API,
  sessies en file-backed persistence over `node:http`; oversized JSON requests
  worden begrensd via `KIEMPAD_CENTRAL_MAX_REQUEST_BODY_BYTES`; zie
  [`docs/CENTRAL_ENCRYPTED_BACKEND.md`](docs/CENTRAL_ENCRYPTED_BACKEND.md).
- **CSP:** `index.html` bevat een strikte Content Security Policy die scripts tot de
  eigen origin beperkt en alleen de eigen origin plus localhost-connecties toestaat.
- **Legacy/back-up:** lokale IndexedDB-vault en versleutelde export/import blijven
  beschikbaar als expliciete legacy/fallback wanneer geen centrale API is
  geconfigureerd.
- **Ontgrendelen:** passphrase als basis; optioneel WebAuthn/biometrie via lokale
  PRF-keywrap als gemak op ondersteunde HTTPS/localhost-browsers.
- **AI (optioneel, opt-in):** alleen op expliciet verzoek; samenvatten van research
  met waarschuwingslabels en bronvermelding, **nooit** dosering/diagnose/behandelkeuze.
  De on-device AI-verkenning toont alleen passief lokale browsermogelijkheden; Kiempad
  start daarbij geen sessie en downloadt geen model.
  Promptcontracten staan centraal in [`docs/AI_PROMPT_REGISTRY.md`](docs/AI_PROMPT_REGISTRY.md).
- **Multi-device:** gekoppelde apparaten gebruiken dezelfde centrale encrypted
  records via API-sessies; een backend/relay ziet enkel onleesbare blobs.

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
| Dependency review | [`docs/DEPENDENCY_REVIEW.md`](docs/DEPENDENCY_REVIEW.md) |
| Werkwijze/bijdragen | [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| Bouwopdracht voor Codex (`/goal`) | [`CODEX_BUILD_PROMPT.md`](CODEX_BUILD_PROMPT.md) |

De **canonieke bron** voor wat we bouwen is `PRODUCT_BACKLOG.md` (de doelen) samen
met `ROADMAP.md` (de volgorde). Documenten gaan vóór losse aantekeningen.
