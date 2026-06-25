# ADR-0007: Codex bouwt en merget Kiempad autonoom

Date: 2026-06-23

## Status

Accepted. Herziet de clausule "menselijke review vóór merge" uit
[ADR-0005](0005-buiten-sentinel-governance.md); de rest van ADR-0005 (Kiempad blijft
buiten de Sentinel-engine/PR-loops) blijft van kracht.

## Context

Peter wil Kiempad **volledig autonoom** door Codex laten bouwen via `/goal`, zonder
tussentijdse beslissingen of reviews. ADR-0005 schreef nog menselijke review vóór merge
voor; dat past niet meer bij deze werkwijze.

## Decision

- Codex bouwt Kiempad autonoom op basis van [`../../PRODUCT_BACKLOG.md`](../../PRODUCT_BACKLOG.md)
  (volgorde uit [`../../ROADMAP.md`](../../ROADMAP.md)), **zonder tussentijdse goedkeuring**
  van Peter.
- Codex mag zijn **eigen PR's mergen zodra CI groen is**. De **CI** (typecheck + test +
  build) is daarmee de **harde merge-gate** die de weggevallen menselijke review vervangt.
- Codex merget **nooit** met rode of onafgemaakte CI.
- De **harde regels** blijven onverkort gelden (centrale encrypted data-architectuur
  ADR-0009, legacy lokale kluis ADR-0002, opt-in AI ADR-0003, niet-medisch ADR-0004,
  geen secrets of data in de publieke repo ADR-0006). Autonomie heft deze **niet** op.
- De operationele grens staat in [`../AUTONOMY_GUARDRAILS.md`](../AUTONOMY_GUARDRAILS.md):
  iedere autonome PR toetst netwerk, AI, data, GitHub, Tailscale en medisch beleid.
- **Bij twijfel kiest Codex de veilige optie** en documenteert die in de PR/ADR, in
  plaats van te wachten op Peter. Medische inhoud blijft altijd "concept"
  (`geverifieerd_met_arts` blijft `false` tot een arts bevestigt); Codex verzint **geen**
  medische feiten of doseringen.

## Consequences

- Snellere voortgang; Peter hoeft niet per PR te beslissen.
- CI is nu de enige geautomatiseerde kwaliteitsgate — tests/typecheck/build moeten
  **betekenisvol** blijven (zie doelen G159–G166). Lege of triviale tests ondermijnen de
  gate.
- Peter kan achteraf **steekproeven** en alsnog terugdraaien; kleine PR's, `CHANGELOG.md`
  en ADR's houden dit traceerbaar.
- Optioneel kan branchprotection op `main` de CI-gate **hard afdwingen** (status check
  verplicht, geen reviewer verplicht). Nu bewust **niet** ingesteld, zodat autonomie niet
  blokkeert als CI ooit hapert; in te schakelen als Peter de gate wil afdwingen.
