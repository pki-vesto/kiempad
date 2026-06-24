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
   - Nieuwe uitgaande dataroutes vereisen expliciete opt-in en documentatie.
   - De app mag geen diagnose, dosering of behandelkeuze toevoegen.

5. **Documentatie en backlog bijwerken**
   - Werk `PRODUCT_BACKLOG.md`, `EXECUTION_GOALS.md`, `CURRENT_STATE.md` en
     `CHANGELOG.md` bij wanneer status, gedrag of workflow verandert.
   - Voeg een ADR toe of pas die aan als een architectuur- of beleidskeuze wijzigt.
   - Vervang afgeronde open doelen zodat de catalogus minimaal 100 actieve doelen houdt.

6. **GitHub-status verifiëren**
   - PR-CI moet groen zijn voordat er gemerged wordt.
   - Na merge moet het gekoppelde issue gesloten zijn als de PR `Closes #...` gebruikt.
   - Na merge moet `main` groen zijn en moet de open issue-telling nog bij de backlog
     passen.

## Beslissing

Markeer een doel alleen als `☑ klaar` wanneer ieder requirement direct bewijs heeft.
Als bewijs ontbreekt, zwak is of alleen "consistent met klaar" is, blijft het doel open
en wordt het resterende werk expliciet gemaakt in het issue, de PR of de volgende goal.
