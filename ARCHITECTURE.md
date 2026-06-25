# Kiempad — ARCHITECTURE

> Onderbouwing van de gekozen opzet, met afgewogen alternatieven. De huisstijl-secties
> zijn aangehouden; sectie 3 ("Sentinel-primitieven" bij de andere apps) is hier
> bewust vervangen door **Opslag- & versleutelingsarchitectuur**, omdat Kiempad geen
> Sentinel-koppeling heeft (zie [`docs/adr/0005-buiten-sentinel-governance.md`](docs/adr/0005-buiten-sentinel-governance.md)).

## 1. Applicatiearchitectuur

Kiempad is een **Progressive Web App (PWA)** in **TypeScript**, gebouwd met **Vite**.
De client blijft verantwoordelijk voor UI, domeinlogica en encryptie; nieuwe data
gaat via een kleine centrale encrypted data-API zodat gekoppelde apparaten dezelfde
versleutelde records kunnen openen.

```
┌──────────────────────────────────────────────────────────┐
│  Browser / geinstalleerde PWA (toestel van de gebruiker)   │
│                                                            │
│  UI-laag (componenten, schermen)                           │
│      │                                                     │
│  Domeinlaag (traject, fasen, medicatie, herinneringen …)   │
│      │                                                     │
│  Opslagdriver ─ versleuteling (Web Crypto, AES-GCM) ─┐│    │
│      │                                               ││    │
│  Legacy IndexedDB / centrale data-API adapter        ││    │
│                                                        │    │
│  Service worker (offline cache, notificaties)          │    │
└────────────────────────────────────────────────────────┘
                 │ (TLS + encrypted payloads)
                 ▼
   Centrale encrypted database   |   Externe AI-provider
   (owner-scoped blobs)          |   (samenvatten, opt-in)
```

Lagen:

- **UI-laag** — schermen en componenten; warm, rustig, toegankelijk. Framework:
  React (sluit aan op de frontend-conventie van `sentinel` en `nova-studio`).
- **Domeinlaag** — pure TypeScript-logica en types (zie [`src/domain/`](src/domain/)
  en [`DATAMODEL.md`](DATAMODEL.md)). Bevat geen UI en geen opslagdetails; goed
  testbaar met Vitest.
- **Opslaglaag** — een dunne repository-interface boven een centrale encrypted
  database of legacy IndexedDB; versleutelt/ontsleutelt records transparant
  (sectie 3).
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

## 3. Opslag- & versleutelingsarchitectuur (centraal encrypted)

Het hart van Kiempad. Uitgangspunt: gezondheidsdata is **AVG-bijzondere persoonsgegevens**
en blijft ook centraal **versleuteld at rest**.

- **Primair nieuw model:** een centrale encrypted database met per-user recordbezit.
  De database bewaart alleen minimale indexvelden, owner/servermetadata en
  versleutelde payloads. Vrije tekst, medische inhoud, dossierbijlagen en consultdata
  mogen niet centraal in plaintext staan.
- **Server-side datamodel:** `CentralEncryptedRecord` bevat `ownerUserId`, minimale
  clear indexvelden, `serverVersion`, `storedAt` en een `EncryptionEnvelope`.
  `CentralEncryptedDatabase` dwingt actieve sessies en user-isolatie af.
- **API/storage-abstraction:** `CentralEncryptedApiServer` vormt de centrale
  servicegrens. `MemoryCentralSessionStore` geeft opaque sessietokens uit en
  resolveert die server-side naar een `CentralAuthSession`; forged, verlopen of
  ingetrokken tokens worden geweigerd voordat data wordt gelezen. De client gebruikt
  `CentralEncryptedApiClientDriver`, dat het bestaande encrypted-storage contract
  exposeert zonder ownervelden aan appcode te geven.
- **Versleuteling:** **AES-256-GCM** per record. De client versleutelt payloads voor
  persistente opslag; de centrale laag ziet alleen encrypted envelopes plus minimale
  indexmetadata.
- **Sleutelbeheer:** keymetadata hoort bij de centrale gebruiker, niet bij een los
  toestel. Een tweede apparaat kan met dezelfde passphrase dezelfde centrale records
  ontsleutelen zonder een nieuwe lokale kluis te recreeren. Er is geen
  herstelachterdeur: zonder passphrase/keywrap blijft data onleesbaar.
- **Legacy/local compatibility:** de oude IndexedDB-kluis blijft als legacy of offline
  fallback bestaan. Bestaande lokale kluizen hoeven niet gemigreerd te worden; nieuwe
  gebruikers horen het centrale encrypted pad te gebruiken.

Detail en bedreigingsmodel: [`SECURITY.md`](SECURITY.md). Beslissingen:
[`docs/adr/0002-local-first-versleutelde-opslag.md`](docs/adr/0002-local-first-versleutelde-opslag.md)
en [`docs/adr/0009-centrale-versleutelde-data-architectuur.md`](docs/adr/0009-centrale-versleutelde-data-architectuur.md).

## 4. Integratiearchitectuur

Alle externe koppelingen zijn **opt-in en uit by default**:

- **AI-samenvatting (optioneel):** alleen op expliciet verzoek stuurt de app een
  geminimaliseerde, zo veel mogelijk gede-identificeerde tekst naar een
  AI-provider. Output krijgt een waarschuwingslabel + bronvermelding, en **nooit**
  dosering/diagnose/behandelkeuze. Beslissing:
  [`docs/adr/0003-ai-met-waarborgen.md`](docs/adr/0003-ai-met-waarborgen.md).
- **Centrale encrypted sync/API:** gekoppelde apparaten gebruiken dezelfde centrale
  encrypted database via opaque API-sessietokens en zien alleen data waarvoor hun
  centrale sessie en key kloppen. Een backend ziet enkel **versleutelde blobs**; de
  sleutel verlaat het toestel niet in plaintext.
- **Agenda-export:** **ICS**-export/import van afspraken, lokaal gegenereerd.
- **PDF-export:** lokaal gegenereerde samenvatting voor het consult.

## 5. Datamodel

Samengevat hierboven (sectie 2). De volledige entiteiten, velden en relaties staan in
[`DATAMODEL.md`](DATAMODEL.md); de stabiele kernvormen zijn in code vastgelegd in
[`src/domain/types.ts`](src/domain/types.ts) zodat docs en code synchroon blijven.

## 6. Self-host-topologie

- **Primair:** de PWA gebruikt een centrale encrypted opslaglaag voor nieuwe data en
  kan offline caches/local legacy alleen als compatibiliteit gebruiken.
- **Statische hosting:** de build kan via Docker Compose op een eigen knooppunt
  (bv. de tailnet, zoals de andere apps) worden geserveerd.
- **Centrale data-API:** productiehosting krijgt een kleine backend/API rond
  `CentralEncryptedApiServer` en het `CentralEncryptedDatabase`-contract. Die backend
  bewaart geen plaintext medische payloads en moet opaque sessies, owner-scoping en
  veilige foutafhandeling afdwingen.

## 7. Kostenraming

- **Hosting:** laag; statische PWA plus kleine centrale encrypted data-API op eigen
  hardware/tailnet.
- **AI (opt-in):** alleen bij gebruik; verbruik onder de eigen abonnements-/API-sleutel
  van de gebruiker, met goedkope modellen voor samenvatten. Default uit ⇒ €0.
- **Centrale opslag:** minimale opslag van onleesbare blobs plus indexmetadata.
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
| Opslag | Centrale encrypted database + legacy lokale vault | Plaintext server-DB | Plaintext centrale opslag past niet bij gezondheidsdata; de centrale laag mag alleen encrypted payloads en minimale indexmetadata bewaren. |
| Platform | PWA (web, mobielvriendelijk) | Native iOS/Android app | Eén codebase, snel itereren, geen app-store; PWA dekt offline + notificaties voldoende. |
| Backend | Kleine centrale encrypted data-API | Volledige medische backend met plaintext domeinrecords | Te groot aanvalsvlak; de backend moet blind blijven voor medische inhoud. |
| Stack | TypeScript + Vite + React | Python + losse frontend (Sentinel-stijl) | Eén taal, client-side, sluit aan op `nova-studio`; lichter voor een MVP. |
| AI | Opt-in cloud-samenvatting met waarborgen | Standaard ingebouwde AI | Privacy: data mag niet ongevraagd naar derden; AI moet bewust en geminimaliseerd. |
| Governance | Handmatig (met AI-assistentie) | Onder Sentinel autonome build | Privé-app met gevoelige data hoort niet in een automatische, op publieke repos gerichte pipeline (ADR-0005). |
