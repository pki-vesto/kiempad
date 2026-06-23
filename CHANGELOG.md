# Changelog

Alle noemenswaardige wijzigingen aan Kiempad. Vorm volgt
[Keep a Changelog](https://keepachangelog.com/nl/1.0.0/); versies volgen
[SemVer](https://semver.org/lang/nl/).

## [Unreleased]

### Added
- G102 AI-provider/modelkeuze: kennisscherm toont provider- en modelvelden in de
  lokale AI-instelling en bewaart die keuze versleuteld zonder externe call.
- G175-G178 dossier- en uploaddoelen toegevoegd voor historische onderzoeken,
  foto's/echo's, gespreksverslagen en embryokwaliteit.
- G062 standaard-waarschuwtijd: herinneringenscherm bewaart een versleutelde
  standaard afspraakwaarschuwing en nieuwe afspraakformulieren vullen de herinnering
  vooraf in.
- G060 eigen losse herinneringen: herinneringenscherm kan eigen herinneringen met
  titel, tijdstip en herhaling versleuteld bewaren.
- G055 medicatieschema-import: handmatig gestructureerde regels
  `Medicatie | YYYY-MM-DD | HH:MM` maken expliciete DoseLogs zonder dosering af te
  leiden.
- G052/G053 DoseLog-notities en historie: innames/injecties kunnen een notitie
  bewaren bij afvinken en medicatie toont een historie per middel.
- G040 afgelopen afspraken: agendascherm toont afspraken uit het verleden apart als
  "Geweest" en gebruikt de bestaande notitie als terugblik.
- G035 agenda week-/maandweergave: agendascherm toont afspraken compact gegroepeerd
  per ISO-week en maand naast de bestaande chronologische lijst.
- G026/G027 meerdere pogingen: trajectscherm kan een nieuwe poging toevoegen naast het
  bewerken van de eerste poging en toont alle pogingen met pogingnummer.
- G139/G140/G141 back-up export/import: back-upscherm toegevoegd voor
  `.kiempad-export` downloads en checksum-gecontroleerde import van versleutelde
  records plus kluismetadata.
- G101/G103 AI-preview en samenvatting opslaan: kennisscherm toont de lokale
  gede-identificeerde payload-preview en kan een AI-samenvatting als gelabeld
  KennisItem bewaren via de versleutelde kennisstore.
- G097/G098/G099 veilige AI-samenvattinglaag: helpers toegevoegd voor
  de-identificatie/minimalisatie van toekomstige AI-payloads, waarschuwing + bron bij
  AI-samenvattingen als KennisItem en policy-tests tegen dosering, diagnose en
  behandelkeuze.
- G095/G096/G100/G125 AI opt-in fundament: AI staat standaard uit, toekomstige
  AI-verzoeken krijgen een expliciete opt-in/actie-guard en provider/model/API-sleutel
  worden alleen via het versleutelde lokale settingsrecord bewaard.
- G158 snelle invoer: startscherm krijgt een compacte invoerroute waarmee een
  afspraak, medicatie of vraag met alleen een korte tekst kan worden toegevoegd via
  de bestaande versleutelde stores.
- G171 kennisbankverificatie: kennisitems bewaren verificatiedatum en volgende
  jaarlijkse reviewdatum na bevestiging door een behandelaar.
- G169 ADR-dekking: ADR-0008 toegevoegd voor de aangescherpte CI/lintgate en
  privacyveilige notificatie-inhoud als opt-in instelling.
- G167/G168/G170/G174 onderhoudschecks: tests toegevoegd voor actuele
  onderhoudsvermeldingen, correcte backlogtelling en consistente niet-medische
  disclaimer in app en kerndocumenten.
- G173 dependency-security update: range-compatible npm-update uitgevoerd, waardoor
  Vite via de lockfile naar 8.1.0 gaat; audit blijft schoon.
- G133 datamodel-sync: ontbrekende TypeScript-interfaces toegevoegd voor de
  later-modules uit `DATAMODEL.md` en een sync-test toegevoegd voor entiteiten en
  kernvelden.
- G066 notificatieprivacy: versleutelde lokale setting toegevoegd waarmee
  notificaties standaard generiek blijven en details op het vergrendelscherm alleen
  na expliciete keuze verschijnen.
- M1.10 tests & kwaliteit: Biome toegevoegd voor consistente lint/format-checks,
  `npm run lint`/`npm run format:check` scripts toegevoegd en CI uitgebreid met de
  lint/format-gate naast typecheck, tests, audit en build (G165, G166).
- M1.9 UX/PWA-baseline: installatiemanifest, SVG-icon, offline service-worker met
  cacheversie en navigatiefallback, standaard service-workerregistratie, concreter
  startscherm, skiplink/focusstijl, lege-staten en testbare delete-confirmaties
  (G149-G152, G156, G157).
- M1.8 basis-kennisbank: versleutelde KennisItem-store, seed van conceptitems uit
  `docs/KENNISBANK.md`, categorieoverzicht voor fasen/leefstijl/kosten/research,
  zichtbare bron-, AI- en artsverificatielabels en expliciet markeren als
  geverifieerd met arts (G073-G080, G083, G138).
- M1.7 vragen voor de arts: centrale versleutelde vragenopslag, vragen toevoegen/
  bewerken/verwijderen, koppeling aan afspraken, beantwoordstatus met antwoordtekst
  en overzicht van openstaande vragen voor de eerstvolgende afspraak (G067-G070).
- M1.6 herinneringen & lokale notificaties: centrale versleutelde herinneringenopslag,
  afspraak- en medicatieherinneringen vanuit afspraken/DoseLogs, eenmalige/
  dagelijkse/wekelijkse herhalingslogica, herinneringenscherm met permissiestatus,
  lokale service-worker-notificaties en generieke notificatietekst zonder medische
  details (G057-G059, G061, G064).
- M1.5 medicatie & injectieschema: versleuteld medicatie vastleggen met vorm,
  instructie, actief/inactief en kliniekdosistekst, injectievorm apart ondersteunen,
  DoseLogs genereren vanuit expliciete planning, vandaag-overzicht tonen, innames als
  genomen/overgeslagen markeren, gemiste geplande innames markeren en policy-/store-
  tests die borgen dat Kiempad geen dosering berekent of adviseert (G043-G051, G162,
  G163).
- M1.4 agenda & afspraken: versleuteld afspraken aanmaken/bewerken/verwijderen,
  afspraaktypes, komende-afsprakenlijst, trajectkoppeling, voorbereiding/notitie,
  gekoppelde vraag voor de arts, afspraakherinnering als lokaal record en agenda-
  domein/storetests (G031-G034, G036-G039).
- M1.3 traject & fasen: versleuteld traject aanmaken/bewerken/verwijderen, status en
  notitie bewaren, vaste fasevolgorde met concepttoelichtingen, huidige fase markeren,
  tijdlijnweergave, startscherm-volgende-stap en domein-/storetests (G019-G025, G028,
  G159).
- M1.2 versleutelde opslagfundering: PBKDF2 + salt, niet-exporteerbare AES-256-GCM
  sessiesleutel, verifier-based passphrase unlock, auto-lock, IndexedDB repository
  voor versleutelde records, geen-herstel-uitleg, CI-auditstap en crypto/opslag/
  privacy-tests (G117-G120, G122-G128, G131-G132, G134-G136, G160-G161, G164).
- M1.1 app-skelet: Nederlandstalige, responsive app-shell met hash-navigatie tussen
  hoofdschermen, zichtbare niet-medische disclaimer en Vitest-dekking voor de
  navigatie-/disclaimer-rendering (G016, G017, G018, G130, G147, G148, G155).
- Eerste documentatieset en repo-fundament (v0.1, F0):
  - Kerndocumenten: `README.md`, `VISIE.md`, `ARCHITECTURE.md`, `ROADMAP.md`,
    `CURRENT_STATE.md`, `MASTER_CONTEXT.md`, `DATAMODEL.md`, `PRIVACY.md`,
    `SECURITY.md`, `CONTRIBUTING.md`, `PRODUCT_BACKLOG.md`.
  - `docs/RUNBOOK.md`, `docs/KENNISBANK.md` en ADR's in `docs/adr/`.
  - Project-scaffold: TypeScript/Vite-opzet, `Makefile`, `Dockerfile`,
    `docker-compose.yml`, `.github`-templates + CI, `.gitignore`, `.env.example`,
    `LICENSE`.
  - Domein-kernvormen (`src/domain/types.ts`) en eerste geteste domeinregel
    (`src/domain/vergoeding.ts` + Vitest-test).
- `PRODUCT_BACKLOG.md` met 100+ concrete, afvinkbare doelen, gekoppeld aan de roadmap.
- `docs/adr/0006-repo-publiek.md` — beslissing om de repo publiek te maken.
- `CODEX_BUILD_PROMPT.md` — bouwopdracht voor Codex (`/goal`) om Kiempad op basis van
  de 178 doelen gefaseerd (F1 eerst) te bouwen.
- `docs/adr/0007-codex-autonoom-bouwen.md` — Codex bouwt en merget autonoom; groene CI
  is de merge-gate (vervangt menselijke review uit ADR-0005). Build prompt,
  MASTER_CONTEXT, CONTRIBUTING en PR-template hierop afgestemd.

### Changed
- Ontwikkeltooling bijgewerkt naar Vite 8, Vitest 4 en vite-plugin-pwa 1.x; Node-floor
  expliciet gemaakt op 20.19+ zodat `npm audit` weer schoon is.
- Repo **publiek** gemaakt (ADR-0006) i.v.m. de GitHub Actions-billingblokkade op
  private repos. Docs aangepast zodat ze de publieke realiteit weerspiegelen
  (`README`, `PRIVACY`, `MASTER_CONTEXT`, `SECURITY`, `CONTRIBUTING`, `LICENSE`,
  `CURRENT_STATE`, ADR-0005, backlog G129). De **gezondheidsdata blijft local-first
  en privé**; alleen code/docs zijn publiek.

### Fixed
- (nog niets)
