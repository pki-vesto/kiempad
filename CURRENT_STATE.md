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

## 2. Gedeeltelijk Gebouwd

- De hoofdschermen tonen nu nog inhoudelijke lege-staten; echte trajecten, afspraken,
  medicatie, vragen en kennisitems worden in volgende F1-mijlpalen toegevoegd.

## 3. Nog Niet Gebouwd

De rest van F1 (MVP) en later, o.a.:

- Versleutelde lokale opslag (passphrase/sleutel/IndexedDB).
- Inhoudelijke UI-workflows voor traject, agenda, medicatie/DoseLog, herinneringen,
  vragen en kennisbank.
- PWA-/service-worker-runtime.
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
  werkt zonder externe diensten en navigeert via hash-routes.
- Geen externe diensten actief; geen data verzonden.
- **Validatie:** lokaal geverifieerd groen — `npm run typecheck`, `npm run test`
  (5 passing) en `npm run build`.
- **CI:** de workflow (`.github/workflows/ci.yml`) draait nu — de repo is **publiek**
  gemaakt (ADR-0006), waardoor de Actions-billingblokkade voor private repos vervalt.
  Code/docs zijn publiek; de **gezondheidsdata blijft local-first en privé** (staat
  niet in de repo).

## 6. Hoogste Prioriteiten

1. **F1-fundament:** versleutelde lokale opslag werkend + ontgrendelflow.
2. **Trajectoverzicht/fasen** en **agenda**.
3. **Medicatie/injectieschema + herinneringen** (de "niet missen"-kern).

## 7. Permanente onderhoudsregel

Werk dit document bij in **dezelfde wijziging** waarin functionaliteit verandert. Een
feature is pas "af" als `CURRENT_STATE.md`, de betreffende doelen in
`PRODUCT_BACKLOG.md` en (bij keuzes) een ADR kloppen. Documentatie loopt nooit achter
op de code.
