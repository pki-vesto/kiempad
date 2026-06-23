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

## 2. Gedeeltelijk Gebouwd

- (Nog niets bovenop het fundament.)

## 3. Nog Niet Gebouwd

Alles uit F1 (MVP) en later, o.a.:

- Versleutelde lokale opslag (passphrase/sleutel/IndexedDB).
- UI-laag (schermen) en de PWA-/service-worker-runtime.
- Trajectoverzicht, agenda, medicatie/DoseLog, herinneringen, vragen, kennisbank-UI.
- Kosten, symptomen, research + AI, gedeelde modus, back-up/export.
- Sync, PDF, ICS, trends.

Zie [`PRODUCT_BACKLOG.md`](PRODUCT_BACKLOG.md) en [`ROADMAP.md`](ROADMAP.md).

## 4. Technische Schuld

- Geen, anders dan dat het scaffold nog geen runtime-app is (bewust: docs-first).
- `npm install` is nog niet als CI-cache vastgelegd; `package-lock.json` ontstaat bij
  de eerste install.

## 5. Runtime-status

- **Geen draaiende runtime.** Lokaal te starten met `npm run dev` zodra de UI er is.
- Geen externe diensten actief; geen data verzonden.

## 6. Hoogste Prioriteiten

1. **F1-fundament:** versleutelde lokale opslag werkend + ontgrendelflow.
2. **Trajectoverzicht/fasen** en **agenda**.
3. **Medicatie/injectieschema + herinneringen** (de "niet missen"-kern).

## 7. Permanente onderhoudsregel

Werk dit document bij in **dezelfde wijziging** waarin functionaliteit verandert. Een
feature is pas "af" als `CURRENT_STATE.md`, de betreffende doelen in
`PRODUCT_BACKLOG.md` en (bij keuzes) een ADR kloppen. Documentatie loopt nooit achter
op de code.
