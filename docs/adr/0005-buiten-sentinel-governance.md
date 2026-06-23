# ADR-0005: Kiempad valt buiten de Sentinel autonome build-governance

Date: 2026-06-23

## Status

Accepted.

## Context

De andere apps onder `pki-vesto` (sentinel, health-core, nova-studio, berry, shred)
worden (deels) autonoom gebouwd/gegroomd via Sentinel, met publieke repos en
geautomatiseerde PR-flows. Kiempad bevat echter gevoelige, persoonlijke
gezondheidsdata en is uitdrukkelijk privé en niet-distribueerbaar.

## Decision

- Kiempad wordt **handmatig** ontwikkeld (met AI-assistentie zoals Claude Code), met
  **menselijke review** vóór elke merge naar `main`.
- Kiempad wordt **niet** opgenomen in de Sentinel autonome build-/PR-/backlog-loops en
  niet in de publieke "factory"-status.
- De repo is **private** onder `pki-vesto` (afwijkend van de publieke siblings), omdat
  hij AVG-bijzondere persoonsgegevens raakt.

## Consequences

- Geen automatische codewijzigingen door agents op deze gevoelige codebase.
- Bewuste afwijking van de huisstijl (publieke repo, Sentinel-primitieven): de
  `ARCHITECTURE.md` heeft daarom geen "Sentinel-primitieven"-sectie maar een
  opslag-/versleutelingssectie.
- Mocht Kiempad ooit toch onder bredere governance komen, dan eerst de AVG-status en
  het privacymodel herzien (de huishoudelijke uitzondering vervalt bij delen/
  distributie — zie `PRIVACY.md`).
