# Kiempad — ARCHITECTURE

> Onderbouwing van de gekozen opzet, met afgewogen alternatieven. De huisstijl-secties
> zijn aangehouden; sectie 3 ("Sentinel-primitieven" bij de andere apps) is hier
> bewust vervangen door **Opslag- & versleutelingsarchitectuur**, omdat Kiempad geen
> Sentinel-koppeling heeft (zie [`docs/adr/0005-buiten-sentinel-governance.md`](docs/adr/0005-buiten-sentinel-governance.md)).

## 1. Applicatiearchitectuur

Kiempad is een **client-side Progressive Web App (PWA)** in **TypeScript**, gebouwd
met **Vite**. Voor de MVP is er **geen verplichte backend**: alle logica en data
leven in de browser op het toestel.

```
┌──────────────────────────────────────────────────────────┐
│  Browser / geinstalleerde PWA (toestel van de gebruiker)   │
│                                                            │
│  UI-laag (componenten, schermen)                           │
│      │                                                     │
│  Domeinlaag (traject, fasen, medicatie, herinneringen …)   │
│      │                                                     │
│  Opslaglaag  ── versleuteling (Web Crypto, AES-GCM) ──┐    │
│      │                                                │    │
│  IndexedDB  (alleen versleutelde records)             │    │
│                                                        │    │
│  Service worker (offline cache, notificaties)          │    │
└────────────────────────────────────────────────────────┘
                 │ (alleen opt-in, expliciet)
                 ▼
   Externe AI-provider   |   E2E-sync-relay (later)
   (samenvatten, opt-in) |   (ziet enkel versleutelde blobs)
```

Lagen:

- **UI-laag** — schermen en componenten; warm, rustig, toegankelijk. Framework:
  React (sluit aan op de frontend-conventie van `sentinel` en `nova-studio`).
- **Domeinlaag** — pure TypeScript-logica en types (zie [`src/domain/`](src/domain/)
  en [`DATAMODEL.md`](DATAMODEL.md)). Bevat geen UI en geen opslagdetails; goed
  testbaar met Vitest.
- **Opslaglaag** — een dunne repository-interface boven IndexedDB; versleutelt/
  ontsleutelt records transparant (sectie 3).
- **Service worker** — offline-werking en lokale notificaties/herinneringen.

## 2. Domeinarchitectuur

Het domein draait om een klein aantal entiteiten (volledige uitwerking in
[`DATAMODEL.md`](DATAMODEL.md)):

- **Traject** (cyclus/poging) met **Fasen**.
- **Afspraken** in een agenda.
- **Medicatie** met **DoseLogs** (inname/injectie) en **Herinneringen**.
- **Vragen** voor de arts.
- **KennisItems** (kennisbank), met de markeringen `ai_gegenereerd` en
  `geverifieerd_met_arts`.
- Later: **SymptomLog**, **CycleData**, **CostItem**, **Decision** (afweging),
  **Settings**.

Domeinregels zijn **puur en deterministisch** (bv. "een poging telt pas mee voor
vergoeding na een geslaagde punctie", zie `src/domain/vergoeding.ts`). De app
**genereert nooit zelf medische beslissingen** (dosering, diagnose, behandelkeuze) —
zie [`docs/adr/0004-geen-medisch-hulpmiddel.md`](docs/adr/0004-geen-medisch-hulpmiddel.md).

## 3. Opslag- & versleutelingsarchitectuur (local-first)

Het hart van Kiempad. Uitgangspunt: gezondheidsdata is **AVG-bijzondere persoonsgegevens**
en blijft **lokaal en versleuteld**.

- **Opslag:** IndexedDB (ruim, gestructureerd, offline). Elk record wordt **versleuteld
  opgeslagen**; alleen niet-gevoelige indexsleutels staan in klare tekst voor zoeken.
- **Versleuteling:** Web Crypto API, **AES-256-GCM** per record. De sleutel wordt
  **afgeleid uit een passphrase** met **PBKDF2** (hoge iteratietelling) of Argon2id,
  met een per-installatie salt. De sleutel staat **alleen in geheugen** zolang de
  sessie ontgrendeld is; hij wordt nooit platgeschreven of geëxporteerd.
- **Toegang:** ontgrendelen met passphrase; waar beschikbaar biometrie/WebAuthn als
  extra ontgrendelgemak (de afgeleide sleutel blijft de basis).
- **Back-up:** **versleutelde export** naar een bestand (`*.kiempad-export`), te
  importeren op hetzelfde of een ander toestel. De gebruiker beheert de back-up zelf.

Detail en bedreigingsmodel: [`SECURITY.md`](SECURITY.md). Beslissing:
[`docs/adr/0002-local-first-versleutelde-opslag.md`](docs/adr/0002-local-first-versleutelde-opslag.md).

## 4. Integratiearchitectuur

Alle externe koppelingen zijn **opt-in en uit by default**:

- **AI-samenvatting (optioneel):** alleen op expliciet verzoek stuurt de app een
  geminimaliseerde, zo veel mogelijk gede-identificeerde tekst naar een
  AI-provider. Output krijgt een waarschuwingslabel + bronvermelding, en **nooit**
  dosering/diagnose/behandelkeuze. Beslissing:
  [`docs/adr/0003-ai-met-waarborgen.md`](docs/adr/0003-ai-met-waarborgen.md).
- **E2E-sync:** optionele synchronisatie tussen gekoppelde apparaten via
  syncpakketten of een relay die enkel **versleutelde blobs** ziet; de sleutel
  verlaat het toestel nooit.
- **Agenda-export:** **ICS**-export/import van afspraken, lokaal gegenereerd.
- **PDF-export:** lokaal gegenereerde samenvatting voor het consult.

## 5. Datamodel

Samengevat hierboven (sectie 2). De volledige entiteiten, velden en relaties staan in
[`DATAMODEL.md`](DATAMODEL.md); de stabiele kernvormen zijn in code vastgelegd in
[`src/domain/types.ts`](src/domain/types.ts) zodat docs en code synchroon blijven.

## 6. Self-host-topologie

- **Primair:** de PWA wordt **geïnstalleerd op het toestel** en draait offline; geen
  server nodig.
- **Optioneel hosten:** de statische build kan via Docker Compose op een eigen knooppunt
  (bv. de tailnet, zoals de andere apps) worden geserveerd. De container is **stateless**
  en bevat **geen** gebruikersdata (zie [`Dockerfile`](Dockerfile)).
- **Optionele sync-relay:** een minimale dienst kan uitsluitend versleutelde blobs
  doorgeven/bewaren; het huidige syncpakketcontract werkt ook handmatig.

## 7. Kostenraming

- **Hosting:** ~€0 — local-first; optioneel zelf-hosten op bestaande hardware/tailnet.
- **AI (opt-in):** alleen bij gebruik; verbruik onder de eigen abonnements-/API-sleutel
  van de gebruiker, met goedkope modellen voor samenvatten. Default uit ⇒ €0.
- **Sync-relay:** verwaarloosbaar; minimale opslag van onleesbare blobs.
- Geen licenties, geen betaalde diensten in de MVP.

## 8. Toekomstige Architectuur

- Meerdere trajecten/cycli met **trends over de tijd**.
- **Gedeelde modus** met twee profielen op één gedeelde, versleutelde dataset (en
  later E2E-sync zodat beide partners op eigen toestel werken).
- Rijkere **research-bibliotheek** met lokale full-text zoekindex.
- Optionele, lokaal draaiende AI (on-device) om ook de opt-in cloud-stap te vermijden.

## Afgewogen alternatieven

| Keuze | Gekozen | Overwogen alternatief | Waarom niet |
|---|---|---|---|
| Opslag | Local-first, versleutelde IndexedDB | Server + Postgres (de ecosysteem-default) | Een server-DB is het tegenovergestelde van local-first en vergroot het privacyrisico; niet nodig voor één stel. |
| Platform | PWA (web, mobielvriendelijk) | Native iOS/Android app | Eén codebase, snel itereren, geen app-store; PWA dekt offline + notificaties voldoende. |
| Backend | Geen verplichte backend | Thin API direct vanaf start | Onnodige complexiteit en aanvalsvlak; sync werkt via E2E-versleutelde pakketten en heeft hooguit een blob-relay nodig. |
| Stack | TypeScript + Vite + React | Python + losse frontend (Sentinel-stijl) | Eén taal, client-side, sluit aan op `nova-studio`; lichter voor een MVP. |
| AI | Opt-in cloud-samenvatting met waarborgen | Standaard ingebouwde AI | Privacy: data mag niet ongevraagd naar derden; AI moet bewust en geminimaliseerd. |
| Governance | Handmatig (met AI-assistentie) | Onder Sentinel autonome build | Privé-app met gevoelige data hoort niet in een automatische, op publieke repos gerichte pipeline (ADR-0005). |
