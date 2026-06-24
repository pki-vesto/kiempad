# ADR Review Evidence Template

Gebruik dit template wanneer een goal `ADR Needed: yes` heeft of wanneer tijdens een
goal blijkt dat een architectuurkeuze expliciet beoordeeld moet worden. Bewaar ingevulde
reviews in de PR-beschrijving of in een toekomstige `docs/reviews/`-map.

Leg geen gevoelige gebruikersdata, tokens, providerpayloads of lokale dossierdetails
vast.

```markdown
# ADR Review Evidence — G000 — YYYY-MM-DD

## Goal
- Goal ID:
- Goal title:
- Reviewer:
- Review date:

## Existing ADRs Consulted
- ADR:
- Relevant rule:
- Coverage:

## Decision Outcome
- Outcome: existing ADR sufficient | update existing ADR | create new ADR | defer goal
- Rationale:
- ADR route:

## Follow-up Requirements
- Required before implementation:
- Required before merge:
- Open questions:

## Evidence Boundary
- Sensitive data excluded:
- Network/AI/data impact checked:
- Link to PR or issue:
```

## Velden

| Veld | Doel |
|---|---|
| `Goal ID` | Het G-id uit `EXECUTION_GOALS.md`. |
| `Reviewer` en `Review date` | Wie de ADR-review uitvoerde en op welke datum. |
| `Existing ADRs Consulted` | De ADR's die zijn gelezen voordat de route werd gekozen. |
| `Decision Outcome` | De uitkomst: bestaande ADR volstaat, ADR updaten, nieuwe ADR maken of goal uitstellen. |
| `ADR route` | Het concrete bestand of de geplande nieuwe ADR. |
| `Follow-up Requirements` | Werk dat vóór implementatie of merge verplicht is. |
| `Evidence Boundary` | Bevestigt dat geen gevoelige data in het bewijs staat. |

## Voorbeeld

```markdown
# ADR Review Evidence — G344 — 2026-06-24

## Goal
- Goal ID: G344
- Goal title: Future Sync Relay Threat Model
- Reviewer: Codex
- Review date: 2026-06-24

## Existing ADRs Consulted
- ADR: ADR-0002 local-first versleutelde opslag
- Relevant rule: gezondheidsdata blijft lokaal en versleuteld.
- Coverage: onvoldoende voor relaymetadata, auth en replayrisico.

## Decision Outcome
- Outcome: create new ADR
- Rationale: een sync-relay verandert de topologie en metadata-exposure.
- ADR route: nieuwe ADR voor E2E-sync relay voordat implementatie start.

## Follow-up Requirements
- Required before implementation: threat model met metadata leakage, auth, replay, retention en non-goals.
- Required before merge: ADR of expliciete beslissing dat het goal alleen threat-modeldocs oplevert.
- Open questions: geen gebruikersdata nodig voor de review.

## Evidence Boundary
- Sensitive data excluded: ja, alleen architectuurcontext.
- Network/AI/data impact checked: netwerk en data-impact gecontroleerd; geen AI-impact.
- Link to PR or issue: issue #399 of opvolgende PR.
```
