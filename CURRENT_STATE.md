# Kiempad — CURRENT_STATE

> Stand per 2026-06-23. Houd dit bij de tijd: het is de eerlijke "wat is er echt"
> naast de ambitie in `ROADMAP.md`.

## 1. Gebouwde Functionaliteit

- **Documentatieset** (deze repo): visie, architectuur, roadmap, datamodel, privacy,
  beveiliging, beslissingen (ADR's), kennisbank-plan, runbook, werkwijze.
- **Repo-scaffold:** TypeScript/Vite-projectopzet, `Makefile`, Docker(-compose),
  `.github`-templates + CI, `.gitignore`, `.env.example`, licentie.
- **Domein-kernvormen** in code: [`src/domain/types.ts`](src/domain/types.ts) en een
  eerste, geteste domeinregel [`src/domain/vergoeding.ts`](src/domain/vergoeding.ts)
  (+ Vitest-test).
- **M1.1 app-skelet:** een Nederlandstalige, responsive Vite-app-shell met
  hash-navigatie tussen de hoofdschermen, rustige start-/werkruimte en zichtbare
  niet-medische disclaimer.
- **M1.2 versleutelde opslagfundering:** passphrase-kluis met PBKDF2 + salt,
  niet-exporteerbare AES-256-GCM sleutel alleen in geheugen, verifier-based unlock,
  auto-lock, IndexedDB repository-interface voor versleutelde records, UUID/ISO-
  metadata, additieve schema-opzet en tests voor crypto/opslag/privacy.
- **M1.3 traject & fasen:** traject aanmaken/bewerken/verwijderen via de
  versleutelde repository, status en notitie bewaren, vaste IVF/ICSI-fasen in
  volgorde tonen, huidige fase markeren, fase-toelichtingen tonen, tijdlijnoverzicht
  en startscherm-volgende-stap.
- **M1.4 agenda & afspraken:** afspraken aanmaken/bewerken/verwijderen via de
  versleutelde repository, afspraaktypes, komende-afsprakenlijst, trajectkoppeling,
  voorbereiding/notitie, gekoppelde vraag voor de arts en afspraakherinnering als
  lokaal record.
- **M1.5 medicatie & injectieschema:** medicatie vastleggen met vorm, instructie,
  actief/inactief en kliniekdosistekst, injectievorm apart tonen, DoseLogs genereren
  vanuit expliciete planning, vandaag-overzicht tonen, innames als genomen/
  overgeslagen markeren en gemiste geplande innames markeren zonder ooit een dosering
  te berekenen.
- **M1.6 herinneringen & lokale notificaties:** centrale herinneringenopslag,
  afspraak- en medicatieherinneringen vanuit afspraken/DoseLogs, eenmalige/
  dagelijkse/wekelijkse herhalingslogica, herinneringenscherm met permissiestatus en
  lokale service-worker-notificaties met generieke meldingstekst.
- **M1.7 vragen voor de arts:** vragen toevoegen/bewerken/verwijderen, koppelen aan
  afspraken, als beantwoord markeren met antwoordtekst en openstaande vragen voor de
  eerstvolgende afspraak tonen.
- **M1.8 basis-kennisbank:** KennisItems lokaal seedden uit `docs/KENNISBANK.md`,
  tonen per categorie, bronvermelding, AI-label, artsverificatielabel en expliciet
  markeren als geverifieerd met arts.
- **M1.9 UX/PWA-baseline:** installatiemanifest en SVG-icon, offline service-worker
  met cacheversie, standaard service-workerregistratie, concreter startscherm,
  skiplink/focusstijl, lege-staten en bevestigingsteksten voor verwijderen.
- **M1.10 tests & kwaliteit:** Biome lint/format-check toegevoegd, CI draait nu
  lint/format naast typecheck, tests, audit en build; groene CI blijft de merge-gate.

## 2. Gedeeltelijk Gebouwd

- Traject/fasen, agenda, medicatie, herinneringen, vragen en kennisbank zijn
  aangesloten op de versleutelde repository-laag.

## 3. Nog Niet Gebouwd

De rest van F1 (MVP) en later, o.a.:

- Geen gedeeltelijke F1-hoofdworkflow bekend; resterende punten zitten vooral in
  kwaliteit, onderhoud en latere F2/F3-modules.
- Kosten, symptomen, research + AI, gedeelde modus, back-up/export.
- Sync, PDF, ICS, trends.

Zie [`PRODUCT_BACKLOG.md`](PRODUCT_BACKLOG.md) en [`ROADMAP.md`](ROADMAP.md).

## 4. Technische Schuld

- Geen bekende technische schuld in de app-shell; de inhoudelijke F1-workflows volgen
  nog.
- `npm install` is nog niet als CI-cache vastgelegd; `package-lock.json` ontstaat bij
  de eerste install.

## 5. Runtime-status

- **Client-side runtime aanwezig.** Lokaal te starten met `npm run dev`; de app-shell
  toont eerst een passphrase-kluis en navigeert na ontgrendelen via hash-routes.
  Het trajectscherm kan nu een poging met fasen lokaal versleuteld beheren; het
  agendascherm kan afspraken met voorbereiding, vraag en herinnering bewaren; het
  medicatiescherm kan middelen en geplande DoseLogs versleuteld beheren; het
  herinneringenscherm toont komende lokale herinneringen en notificatiepermissie; het
  vragenscherm kan consultvragen en antwoorden versleuteld beheren; het kennisscherm
  seedt en toont conceptkennis lokaal met bron- en verificatielabels. De app heeft
  een PWA-manifest en service worker voor offline gebruik na de eerste load.
- Geen externe diensten actief; geen data verzonden.
- **Validatie:** lokaal geverifieerd groen — `npm run typecheck`, `npm run lint`,
  `npm run test` (56 passing), `npm run build` en `npm audit --audit-level=high`.
- **CI:** de workflow (`.github/workflows/ci.yml`) draait nu — de repo is **publiek**
  gemaakt (ADR-0006), waardoor de Actions-billingblokkade voor private repos vervalt.
  Code/docs zijn publiek; de **gezondheidsdata blijft local-first en privé** (staat
  niet in de repo).

## 6. Hoogste Prioriteiten

1. **Onderhoudsdoelen** expliciet afvinken waar de workflow inmiddels structureel is.
2. **F2-scope kiezen**: kosten/vergoedingen, symptomen of back-up/export.
3. **Back-up/export** voorbereiden voordat er meer privédata wordt toegevoegd.

## 7. Permanente onderhoudsregel

Werk dit document bij in **dezelfde wijziging** waarin functionaliteit verandert. Een
feature is pas "af" als `CURRENT_STATE.md`, de betreffende doelen in
`PRODUCT_BACKLOG.md` en (bij keuzes) een ADR kloppen. Documentatie loopt nooit achter
op de code.
