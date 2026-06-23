# Changelog

Alle noemenswaardige wijzigingen aan Kiempad. Vorm volgt
[Keep a Changelog](https://keepachangelog.com/nl/1.0.0/); versies volgen
[SemVer](https://semver.org/lang/nl/).

## [Unreleased]

### Added
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
  de 174 doelen gefaseerd (F1 eerst) te bouwen.
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
