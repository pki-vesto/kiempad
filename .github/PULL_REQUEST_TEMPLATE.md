<!-- Base = main. Gebruik "Closes #X" alleen als deze PR het issue moet sluiten bij merge. -->

## Wat & waarom
<!-- Welk doel/issue, wat verandert er en waarom. Verwijs naar G-id uit PRODUCT_BACKLOG.md. -->
Refs #
Doel(en):

## Wijziging
<!-- Korte opsomming van de aanpassingen per bestand/gebied. -->

## Validatie
- [ ] `npm run typecheck` → groen
- [ ] `npm run lint` → groen
- [ ] `npm run test` → groen (nieuwe logica heeft tests)
- [ ] `npm run build` → groen
- [ ] `npm run assets:check` → groen na build
- [ ] `npm audit --audit-level=high` → groen
- [ ] Privacy/policy gerespecteerd (geen nieuwe uitgaande dataroute zonder opt-in; niets medisch-besluitvormends — MASTER_CONTEXT §4)
- [ ] Autonomy guardrails gecheckt: [`docs/AUTONOMY_GUARDRAILS.md`](docs/AUTONOMY_GUARDRAILS.md)
- [ ] Docs bijgewerkt: CURRENT_STATE.md, betreffende G-id(s) in PRODUCT_BACKLOG.md, CHANGELOG.md, en bij een keuze een ADR
- [ ] Completion audit uitgevoerd: [`docs/GOAL_COMPLETION_AUDIT.md`](docs/GOAL_COMPLETION_AUDIT.md)
- [ ] Public repo privacy review uitgevoerd indien van toepassing: [`docs/PUBLIC_REPO_PRIVACY_REVIEW.md`](docs/PUBLIC_REPO_PRIVACY_REVIEW.md)

## Scope / resterend
<!-- Bewust buiten scope gelaten / vervolg. -->

## Uitvoeringsvorm
<!-- ADR-0007: Codex bouwt en merget autonoom via /goal; groene CI is de merge-gate. -->
- [ ] Codex `/goal` — autonoom gebouwd, self-merge bij groene CI
- [ ] Handmatig / Claude Code
- [ ] Gemotiveerde afwijking — licht toe
