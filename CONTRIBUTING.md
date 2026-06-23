# Contributing to Kiempad

> Dit is een privéproject voor twee mensen, gebouwd met AI-assistentie. "Bijdragen"
> betekent hier: hoe wij er gestructureerd aan werken. Houd het licht, maar
> consistent.

## Execution form

- Werk **handmatig met AI-assistentie** (Claude Code). Kiempad valt **buiten** de
  Sentinel autonome build-/PR-governance (zie
  [`docs/adr/0005-buiten-sentinel-governance.md`](docs/adr/0005-buiten-sentinel-governance.md)).
- Elke wijziging is **menselijk gereviewd** voordat hij op `main` staat.

## Branch model

- `main` is altijd in werkende staat.
- Werk in korte feature-branches (`feat/...`, `fix/...`, `docs/...`); merge via PR.
- Klein en gefaseerd, in lijn met [`ROADMAP.md`](ROADMAP.md).

## Commits

- Beknopte, beschrijvende commits in het Nederlands of Engels (consistent per commit).
- Vorm: `<type>: <korte omschrijving>` (`feat`, `fix`, `docs`, `refactor`, `test`,
  `chore`).
- **Nooit** secrets, `.env`, data of back-ups committen (zie `.gitignore`).

## Validation gate

Voordat je merget:

- `npm run typecheck` — groen.
- `npm run test` — groen; nieuwe logica heeft tests.
- Privacy-/policy-regels uit [`MASTER_CONTEXT.md`](MASTER_CONTEXT.md) §4 gerespecteerd
  (geen nieuwe uitgaande dataroute zonder opt-in; niets medisch-besluitvormends).
- Documentatie bijgewerkt: [`CURRENT_STATE.md`](CURRENT_STATE.md), de betreffende doelen
  in [`PRODUCT_BACKLOG.md`](PRODUCT_BACKLOG.md), [`CHANGELOG.md`](CHANGELOG.md), en bij
  een keuze een ADR in [`docs/adr/`](docs/adr/).

CI (`.github/workflows/ci.yml`) draait typecheck + tests op elke PR.

## Review process

- Eén reviewer (de andere partner of een bewuste zelf-review met checklist).
- Toets aan de **Definition Of Done** in [`MASTER_CONTEXT.md`](MASTER_CONTEXT.md) §8.
- Bij twijfel over medische inhoud: markeren als concept en **niet** als
  geverifieerd tonen tot een behandelaar het bevestigt.

## Documentatiestijl

- Nederlands, helder en beknopt.
- Belangrijke keuzes onderbouwen; bewuste open punten benoemen.
- De niet-medische boodschap en de privacyprincipes consequent meenemen.
