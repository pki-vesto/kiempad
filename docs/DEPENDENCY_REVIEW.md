# Dependency Review Cadence

Kiempad reviewt dependencies maandelijks en direct na relevante security advisories.
De app blijft local-first; dependency updates mogen geen tracking, externe assets of
nieuwe runtime-backends introduceren.

## Maandelijkse flow

1. Controleer beschikbare updates:
   `npm outdated`
2. Controleer security findings:
   `npm audit --audit-level=high`
3. Update gericht en inspecteer lockfile-wijzigingen:
   `git diff -- package.json package-lock.json`
4. Draai de testgate:
   `npm run typecheck`
   `npm run lint`
   `npm run test`
   `npm run build`
5. Controleer lokale privacygates:
   `npm run secrets:check`
   `npm run assets:check`

De helper `npm run deps:review` print deze checklist. Gebruik
`npm run deps:review -- --run` om de lokale non-interactive gates te draaien. `npm
outdated` mag daarbij met exitcode 1 melden dat er updates beschikbaar zijn; dat is
input voor de review, geen testfalen.

## Evidence snapshots

Leg afgeronde reviews vast met
[`docs/DEPENDENCY_REVIEW_EVIDENCE_TEMPLATE.md`](DEPENDENCY_REVIEW_EVIDENCE_TEMPLATE.md).
Ingevulde snapshots horen onder `docs/evidence/dependency-review/YYYY-MM-DD.md`.

Een snapshot bevat alleen samenvattingen:

- reviewdatum en reviewer;
- `npm outdated`-samenvatting;
- `npm audit --audit-level=high`-resultaat;
- lockfile-diffsamenvatting voor `package.json` en `package-lock.json`;
- testgate-status voor typecheck, lint, test en build;
- privacygate-status voor secrets- en asset-scan;
- besluit en eventuele vervolgissues.

Plak geen tokens, registry credentials, `.env`-waarden, volledige package metadata
dumps of machine-specifieke paden in evidence.

## Reviewregels

- Commit alleen doelgerichte package- en lockfilewijzigingen.
- High-severity audit findings blokkeren merge, tenzij expliciet gedocumenteerd waarom
  ze niet van toepassing zijn.
- Lockfile-diffs worden gelezen voordat ze worden gecommit.
- Nieuwe dependencies moeten passen bij de local-first architectuur en mogen geen
  externe asset- of telemetryplicht toevoegen.
- PR's blijven pas mergebaar na groene CI en lokale validatie.
