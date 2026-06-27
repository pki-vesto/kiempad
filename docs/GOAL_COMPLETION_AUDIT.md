# Goal Completion Audit

Gebruik deze audit voordat een doel als `☑ klaar` wordt gemarkeerd of een PR wordt
gemerged. De audit voorkomt dat "done" wordt gebaseerd op intentie, gedeeltelijke
dekking of alleen een groene test die het doel niet echt bewijst.

De audit dekt expliciet de G250-criteria: requirements, evidence, tests, PR state en
docs.

## Checklist

1. **Scope herleiden**
   - Lees het doel in `EXECUTION_GOALS.md`, het bijbehorende issue en relevante
     source-of-truth docs.
   - Noteer expliciete requirements, acceptance criteria, commands, invarianten,
     policyregels en gevraagde artefacten.

2. **Bewijs per requirement verzamelen**
   - Koppel ieder requirement aan direct bewijs: code, documentatie, tests, command
     output, PR-status, CI-status, runtimegedrag of issue-status.
   - Gebruik geen indirect bewijs voor brede claims. Een smalle unit test bewijst
     bijvoorbeeld geen volledige workflow tenzij die workflow ook apart is afgedekt.

3. **Tests en gates beoordelen**
   - Controleer dat nieuwe of bestaande tests het gewijzigde gedrag werkelijk raken.
   - Draai minimaal de lokale gate uit `CONTRIBUTING.md`.
   - Draai aanvullende commands die in het doel, issue of de gewijzigde docs worden
     genoemd.

4. **Privacy en medisch beleid toetsen**
   - Bevestig dat `MASTER_CONTEXT.md` sectie 4 blijft gelden.
   - Controleer [`docs/AUTONOMY_GUARDRAILS.md`](AUTONOMY_GUARDRAILS.md) voor netwerk,
     AI, data, GitHub, Tailscale en medische impact.
   - Nieuwe uitgaande dataroutes vereisen expliciete opt-in en documentatie.
   - De app mag geen diagnose, dosering of behandelkeuze toevoegen.

5. **Documentatie en backlog bijwerken**
   - Werk `PRODUCT_BACKLOG.md`, `EXECUTION_GOALS.md`, `CURRENT_STATE.md` en
     `CHANGELOG.md` bij wanneer status, gedrag of workflow verandert.
   - Voeg een ADR toe of pas die aan als een architectuur- of beleidskeuze wijzigt.
   - Vervang afgeronde open doelen alleen wanneer er bewust nieuw waardevol werk is;
     maak geen vervangdoelen om GitHub-ruis kunstmatig in stand te houden.

6. **GitHub-status verifiëren**
   - PR-CI moet groen zijn voordat er gemerged wordt.
   - Na merge moet het gekoppelde issue gesloten zijn als de PR `Closes #...` gebruikt.
   - Na merge moet `main` groen zijn en moet de open issue-telling nog bij de backlog
     passen.

## Evidence Markers

Gebruik dit blok in PR-beschrijvingen of lokale auditnotities wanneer een doel als
klaar wordt gemarkeerd. De HTML-markers maken het blok automatisch herkenbaar; de
headings moeten exact blijven staan.

```markdown
<!-- completion-audit:start -->
### Requirements Evidence
- Requirement:
- Evidence:
- Strength:

### Test Evidence
- Commands:
- Result:
- Coverage:

### Policy Evidence
- Privacy:
- Medical:
- Network/AI:

### GitHub Evidence
- Issue:
- PR:
- Main CI:
- Backlog:
<!-- completion-audit:end -->
```

### Filled Example

```markdown
<!-- completion-audit:start -->
### Requirements Evidence
- Requirement: G250 audit checklist documents requirements, evidence, tests, PR state and docs.
- Evidence: `docs/GOAL_COMPLETION_AUDIT.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `tests/maintenanceDocs.test.ts`.
- Strength: Direct docs plus maintenance test.

### Test Evidence
- Commands: `npm run test -- tests/maintenanceDocs.test.ts`, `npm run backlog:health -- --allow-findings`.
- Result: Green locally and green in PR CI.
- Coverage: Checklist terms, PR-template link and active-goal count.

### Policy Evidence
- Privacy: Docs-only; no user data or new storage.
- Medical: No diagnosis, dosage or treatment-choice behavior.
- Network/AI: No runtime network call and no AI provider call.

### GitHub Evidence
- Issue: Closes #297.
- PR: Green CI before squash merge.
- Main CI: Verified green after merge.
- Backlog: Goal marked `☑ klaar`; no replacement goal added because no new work was needed.
<!-- completion-audit:end -->
```

## Beslissing

Markeer een doel alleen als `☑ klaar` wanneer ieder requirement direct bewijs heeft.
Als bewijs ontbreekt, zwak is of alleen "consistent met klaar" is, blijft het doel open
en wordt het resterende werk expliciet gemaakt in het issue, de PR of de volgende goal.
