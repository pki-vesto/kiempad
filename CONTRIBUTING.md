# Contributing to Kiempad

> Dit is een privéproject voor twee mensen, gebouwd met AI-assistentie. "Bijdragen"
> betekent hier: hoe wij er gestructureerd aan werken. Houd het licht, maar
> consistent.

## Execution form

- **Codex bouwt en merget autonoom** via `/goal` (zie
  [`CODEX_BUILD_PROMPT.md`](CODEX_BUILD_PROMPT.md) en
  [`docs/adr/0007-codex-autonoom-bouwen.md`](docs/adr/0007-codex-autonoom-bouwen.md)),
  zonder tussentijdse menselijke beslissingen. **Groene CI is de merge-gate** die de
  menselijke review vervangt.
- Kiempad blijft wel **buiten** de Sentinel autonome build-engine en portfolio-PR-loops
  ([`docs/adr/0005-buiten-sentinel-governance.md`](docs/adr/0005-buiten-sentinel-governance.md)).
- Peter kan achteraf **steekproeven** en terugdraaien.

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
- `npm run lint` — groen.
- `npm run test` — groen; nieuwe logica heeft tests.
- `npm run backlog:health` — groen; standaard minimaal 100 open doelen. Alleen voor
  lokale fixtures of experimenten mag tijdelijk
  `npm run backlog:health -- --minimum-open-goals <n>` worden gebruikt.
  Optioneel vóór merge: exporteer issues met
  `gh issue list --state all --limit 200 --json number,title,state,url > /tmp/kiempad-issues.json`
  controleer de timestamp met `stat -c %y /tmp/kiempad-issues.json` en draai
  `npm run backlog:health -- --issues-json /tmp/kiempad-issues.json`. Ruim daarna
  op met `rm -f /tmp/kiempad-issues.json`. Commit deze snapshot niet en exporteer
  geen issue bodies.
- `npm run build` — groen.
- `npm run assets:check` — groen na de build; geen externe asset-URL's tenzij
  expliciet allowlisted.
- `npm run secrets:check` — groen; alleen synthetische placeholders uit de expliciete
  allowlist zijn toegestaan.
- `npm audit --audit-level=high` — groen.
- Privacy-/policy-regels uit [`MASTER_CONTEXT.md`](MASTER_CONTEXT.md) §4 gerespecteerd
  (geen nieuwe uitgaande dataroute zonder opt-in; niets medisch-besluitvormends).
- Documentatie bijgewerkt: [`CURRENT_STATE.md`](CURRENT_STATE.md), de betreffende doelen
  in [`PRODUCT_BACKLOG.md`](PRODUCT_BACKLOG.md), [`CHANGELOG.md`](CHANGELOG.md), en bij
  een keuze een ADR in [`docs/adr/`](docs/adr/).
- Completion audit uitgevoerd volgens
  [`docs/GOAL_COMPLETION_AUDIT.md`](docs/GOAL_COMPLETION_AUDIT.md): ieder requirement
  heeft direct bewijs voordat het doel op `☑ klaar` gaat.
- Public repo privacy review uitgevoerd volgens
  [`docs/PUBLIC_REPO_PRIVACY_REVIEW.md`](docs/PUBLIC_REPO_PRIVACY_REVIEW.md) wanneer
  releases, screenshots, fixtures, env-bestanden, generated assets of themawijzigingen
  geraakt worden.

CI (`.github/workflows/ci.yml`) draait typecheck, lint, secrets-scan, tests, audit,
build en de externe-asset-scan op elke PR.

## Review process

- **Geen verplichte menselijke reviewer.** Codex toetst zelf aan de **Definition Of
  Done** in [`MASTER_CONTEXT.md`](MASTER_CONTEXT.md) §8 en merget bij **groene CI**.
- Medische inhoud blijft altijd **concept**: `geverifieerd_met_arts` blijft `false` tot
  een behandelaar het bevestigt; verzin nooit medische feiten of doseringen.
- Bij twijfel die een hard principe raakt: kies de veilige optie en documenteer die in
  de PR/ADR (niet wachten op Peter).

## Documentatiestijl

- Nederlands, helder en beknopt.
- Belangrijke keuzes onderbouwen; bewuste open punten benoemen.
- De niet-medische boodschap en de privacyprincipes consequent meenemen.
