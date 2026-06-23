# Kiempad — Codex Build Prompt (`/goal`)

> Dit bestand is de **opdracht voor Codex** om Kiempad te bouwen op basis van de 174
> doelen in [`PRODUCT_BACKLOG.md`](PRODUCT_BACKLOG.md), in de volgorde van
> [`ROADMAP.md`](ROADMAP.md) (MVP/F1 eerst). Het heeft hoogste prioriteit voor de
> bouw-agent; als een ander document hiermee conflicteert geldt dit document, **behalve**
> waar de kliniek iets voorschrijft (dan wint de kliniek) en behalve de harde regels
> hieronder (die winnen altijd).

## Hoe Peter dit gebruikt

Roep Codex aan met `/goal` en verwijs naar dit bestand, bijvoorbeeld:

```
/goal Lees CODEX_BUILD_PROMPT.md en bouw de volgende openstaande milestone van Kiempad.
      Pak de laagste openstaande fase (begin bij F1), hoogste prioriteit eerst. Eén
      coherente PR, validatiegate groen, docs + backlog-statussen bijwerken.
```

Of richt het op een concrete set doelen, bv.: `/goal Implementeer M1.1 (versleutelde
lokale opslag, G117–G120, G131–G132) van CODEX_BUILD_PROMPT.md.`

Elke `/goal`-run levert **één PR** op die Peter reviewt vóór merge.

## Missie

Bouw **Kiempad** door: een **persoonlijke, local-first PWA** die het IVF/ICSI-traject
van Peter & partner ondersteunt. Het is een **informatie- en organisatietool**, **geen
medisch hulpmiddel**. Bouw conservatief, privacy-veilig en productgericht — alleen wat
past bij een single-stel, offline-first, versleutelde app. Lever in kleine, afgeronde
stappen die elk op zichzelf bruikbaar zijn.

## Lees dit eerst (de canon)

In deze volgorde, vóór je code schrijft:

1. [`MASTER_CONTEXT.md`](MASTER_CONTEXT.md) — invarianten, policy (§4) en Definition of Done (§8).
2. [`PRODUCT_BACKLOG.md`](PRODUCT_BACKLOG.md) — de 174 doelen (G-id's), prioriteit + fase.
3. [`ROADMAP.md`](ROADMAP.md) — de volgorde (F0–F4), MVP eerst.
4. [`ARCHITECTURE.md`](ARCHITECTURE.md) en [`DATAMODEL.md`](DATAMODEL.md) — opzet + entiteiten.
5. [`PRIVACY.md`](PRIVACY.md), [`SECURITY.md`](SECURITY.md) en [`docs/adr/`](docs/adr/) — de waarom-keuzes.
6. [`CONTRIBUTING.md`](CONTRIBUTING.md) — branch/PR/validatie-werkwijze.

De domein-kernvormen staan al in [`src/domain/types.ts`](src/domain/types.ts); houd code
en `DATAMODEL.md` synchroon.

## Harde regels (mogen NOOIT geschonden worden)

Dit zijn de policies P1–P6 uit `MASTER_CONTEXT.md` §4, concreet voor de bouw:

- **Geen medische beslissingen.** De app (en eventuele AI) berekent/adviseert **geen**
  dosering, stelt **geen** diagnose en maakt **geen** behandelkeuze. Dosering wordt
  alleen **vastgelegd zoals de kliniek die opgeeft**. (ADR-0004)
- **Privacy by default & local-first.** Alle gevoelige data **versleuteld at rest**
  (Web Crypto, **AES-256-GCM**, sleutel uit passphrase via PBKDF2/Argon2id, sleutel
  alleen in geheugen). Opslag in **IndexedDB**. **Geen** server-database. (ADR-0002)
- **Geen standaard uitgaand verkeer.** Geen tracking, analytics, advertenties of
  third-party scripts. Alles wat naar buiten gaat (AI/sync) is **opt-in en default uit**,
  met dataminimalisatie. (ADR-0003)
- **Disclaimer zichtbaar** in de app (geen medisch advies).
- **Repo is PUBLIC** (ADR-0006): commit **nooit** secrets of databestanden. `.env`,
  `data/` en back-ups blijven buiten git (`.gitignore`). Gezondheidsdata komt **nooit**
  in de repo.
- **Buiten autonome Sentinel-governance** (ADR-0005): bouw via `/goal` onder Peters
  aansturing; **elke PR is door Peter gereviewd vóór merge**. Wire Kiempad niet in de
  Sentinel-engine/PR-loops.

## Werkwijze per `/goal`-run

1. **Kies scope.** Pak één doel of een kleine, coherente groep doelen — bij voorkeur uit
   de **laagste openstaande fase** (begin bij F1), **hoogste prioriteit (P0 → P1 → …)**
   eerst. Volg de aanbevolen bouwvolgorde hieronder als er geen specifieke opdracht is.
2. **Branch.** Maak een korte branch: `feat/...`, `fix/...` of `docs/...`.
3. **Implementeer** klein en domeingericht. Hergebruik bestaande types/helpers; geen
   parallelle state of dubbele modellen.
4. **Tests.** Schrijf Vitest-tests voor nieuwe logica (domeinregels, versleuteling,
   opslag, herinnering-/DoseLog-generatie). Voeg waar zinvol een policy-test toe (geen
   dosering-output; geen uitgaand verkeer zonder opt-in).
5. **Validatiegate — alle drie groen:** `npm run typecheck` · `npm run test` ·
   `npm run build`.
6. **Werk docs bij in DEZELFDE PR:**
   - Zet de betreffende **G-id(s)** in `PRODUCT_BACKLOG.md` op ☑ (of ◐), en werk de
     **statussamenvatting + telling** bij.
   - Update [`CURRENT_STATE.md`](CURRENT_STATE.md) (gebouwd / gedeeltelijk / nog niet).
   - Voeg een regel toe aan [`CHANGELOG.md`](CHANGELOG.md) onder `[Unreleased]`.
   - Bij een architectuur-/beleidskeuze: voeg een **ADR** toe in `docs/adr/`.
7. **PR** met het PR-template; verwijs naar de G-id(s). **Wacht op Peters review en
   groene CI vóór merge.**

## Definitie van gereed

Zie `MASTER_CONTEXT.md` §8. Samengevat: functioneel werkend op de relevante workflow;
validatiegate groen; harde regels gerespecteerd; geen nieuwe uitgaande dataroute zonder
opt-in; docs + backlog + changelog bijgewerkt; PR human-reviewed.

## Verboden gedrag

- Geen server-database, ORM of cloud-dienst introduceren (local-first blijft).
- Geen login/accounts voor derden, multi-tenant, billing of social features.
- Geen onversleutelde opslag van gevoelige data; geen sleutel platschrijven/exporteren.
- Geen secrets of data committen (repo is publiek).
- Geen medische berekeningen/adviezen (dosering/diagnose/behandeling).
- Geen F2/F3-features bouwen vóór F1 (MVP) functioneel af is, tenzij Peter dat expliciet
  vraagt.
- Lokale IndexedDB-data niet wissen als "fix"; migraties zijn **additief** en
  reversibel via een versleutelde export.
- Service-worker/PWA-assetwijzigingen niet shippen zonder cacheversie-bump.
- Geen fictieve release notes of afgevinkte doelen die niet echt werken.

## Kwaliteitsregels (stack)

- **TypeScript strict** (de `tsconfig.json` staat al op strict). Geen `any`-ontsnappingen.
- **Vite** als build/dev; **React** is toegestaan voor de UI (sluit aan op de
  ecosysteem-frontends). Houd componenten klein.
- **Vitest** voor tests; pure domeinlogica los van UI en opslag.
- **Web Crypto** voor versleuteling; **IndexedDB** voor opslag (dunne repository-laag).
- **PWA** (manifest, service worker, offline) wordt in F1 toegevoegd (`vite-plugin-pwa`
  staat al in `package.json`).
- **Nederlands** in UI en docs; warme, rustige, niet-klinische toon.
- Houd `DATAMODEL.md` en `src/domain/types.ts` synchroon bij modelwijzigingen.

## Aanbevolen bouwvolgorde (F1 = MVP)

F0 (fundament) is gereed. Begin bij F1. Voorgestelde milestones met concrete G-id's
(zie `PRODUCT_BACKLOG.md` voor de exacte tekst):

- **M1.1 — App-skelet + disclaimer:** G016 (Vite-app draait), G017 (routing/navigatie),
  G018 + G130 (zichtbare disclaimer), G147/G148/G155 (toon, responsief, NL).
- **M1.2 — Versleutelde lokale opslag:** G117–G120 (AES-GCM at rest, sleutel uit
  passphrase, ontgrendelen), G122 (auto-lock), G127 (geen-herstel-achterdeur-uitleg +
  back-up-aansporing), G131–G136 (IndexedDB-opslaglaag, versleutelde records, UUID, ISO-
  datums, additieve migratie), G123/G124 (geen tracking / geen uitgaand verkeer).
- **M1.3 — Traject & fasen:** G019–G025, G028.
- **M1.4 — Agenda & afspraken:** G031–G034, G036–G039.
- **M1.5 — Medicatie & injectieschema:** G043–G051 (incl. G045: nooit zelf dosering).
- **M1.6 — Herinneringen:** G057–G059, G061, G064 (lokale notificaties via service worker).
- **M1.7 — Vragen voor de arts:** G067–G070.
- **M1.8 — Basis-kennisbank:** G073–G080, G083 (incl. herkomst-/verificatielabels), G138
  (seed initiële NL-inhoud uit `docs/KENNISBANK.md`).
- **M1.9 — UX/PWA-baseline:** G149/G150 (PWA installeerbaar + offline), G151 (startscherm
  "waar staan we / volgende stap"), G152 (toegankelijkheid), G156/G157 (lege-staten,
  bevestiging bij verwijderen).
- **M1.10 — Tests & kwaliteit:** G159–G164 (domein-, crypto-, opslag-, policy-tests).

Daarna pas **F2** (kosten/vergoedingen, symptomen, research+AI opt-in, gedeelde modus,
afwegingen, back-up/export) en later **F3/F4**.

> Werk per milestone in losse, kleine PR's. Eén coherente eenheid per PR. Stop en vraag
> Peter bij twijfel over medische inhoud of bij een keuze die een hard principe raakt.
