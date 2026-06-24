# Dependency Review Evidence Snapshot Template

Gebruik dit template na een maandelijkse dependency review of na een relevante
security advisory. Bewaar ingevulde snapshots onder
`docs/evidence/dependency-review/YYYY-MM-DD.md`.

Neem alleen samenvattingen op. Plak geen tokens, `.env`-waarden, registry credentials,
volledige package metadata dumps of machine-specifieke paden.

## Snapshot Schema

| Veld | Verwachting |
|---|---|
| Datum | Reviewdatum in `YYYY-MM-DD`. |
| Reviewer | Naam of rol van de reviewer. |
| Scope | Welke package-/lockfilewijzigingen of advisory zijn beoordeeld. |
| npm outdated | Samenvatting van updates of "geen relevante updates". |
| npm audit | Resultaat van `npm audit --audit-level=high`. |
| Lockfile diff | Korte samenvatting van `git diff -- package.json package-lock.json`. |
| Test gate | Status van typecheck, lint, test en build. |
| Privacy gate | Status van secrets- en asset-scan. |
| Besluit | Merge, uitstellen of vervolgissue met reden. |

## Template

```md
# Dependency Review Evidence — YYYY-MM-DD

- **Reviewer:** Codex
- **Scope:** package.json/package-lock.json of advisory-id
- **Besluit:** merge / uitstellen / vervolgissue

## Commands

| Command | Status | Samenvatting |
|---|---|---|
| `npm outdated` | groen / updates gevonden / niet van toepassing | ... |
| `npm audit --audit-level=high` | groen / blokkade | ... |
| `git diff -- package.json package-lock.json` | gelezen | ... |
| `npm run typecheck` | groen / rood | ... |
| `npm run lint` | groen / rood | ... |
| `npm run test` | groen / rood | ... |
| `npm run build` | groen / rood | ... |
| `npm run secrets:check` | groen / rood | ... |
| `npm run assets:check` | groen / rood | ... |

## Lockfile Diff Summary

- Directe dependencywijzigingen:
- Transitive dependencywijzigingen:
- Install scripts of postinstall gedrag:

## Privacy & Security Notes

- Nieuwe runtime-backends of telemetry:
- Nieuwe externe assets:
- Secrets of registry credentials gezien:

## Follow-up

- Vervolgissue(s):
- Volgende reviewdatum:
```
