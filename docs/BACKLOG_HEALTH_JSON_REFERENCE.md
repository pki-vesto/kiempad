# Backlog Health JSON Reference

`npm run backlog:health -- --json` geeft een machineleesbaar rapport voor lokale
backlog- en issue-driftchecks. Gebruik dit alleen met snapshots die zijn gemaakt met
`number,title,state,url`; issue bodies, tokens en snapshotbestanden horen niet in de
repo.

## Issue Snapshot

Wanneer `--issues-json /tmp/kiempad-issues.json` is meegegeven, bevat het rapport:

- `issueSnapshot.duplicateIssues`: dubbele goal-id's in issue-titels, met per groep
  `id` en `issues`.
- `issueSnapshot.missingIssueLinks`: open backlogdoelen zonder gekoppelde issue, met
  `id` en lokale backlog `title`.
- `issueSnapshot.nonOpenIssueLinks`: open backlogdoelen waarvan de gekoppelde issue
  niet `OPEN` is, met `id`, lokale backlog `title` en gesanitized `issue`.
- `issueSnapshot.completedGoalOpenIssues`: afgeronde backlogdoelen waarvan de issue
  nog `OPEN` is, met `id`, lokale backlog `title` en gesanitized `issue`.

Een gesanitized `issue` bevat alleen:

- `number`
- `title`
- `state`
- `url`

Gebruik voor grotere issuehistorie dezelfde limiet bij export en validatie:

```bash
gh issue list --state all --limit 500 --json number,title,state,url > /tmp/kiempad-issues.json
npm run backlog:health -- --issues-json /tmp/kiempad-issues.json --issue-snapshot-limit 500 --json
rm -f /tmp/kiempad-issues.json
```

## Example Fixture

Onderstaand voorbeeld is synthetisch en bevat alleen de gesanitized velden die
automation mag gebruiken:

```json
{
  "issueSnapshot": {
    "duplicateIssues": [
      {
        "id": "G244",
        "issues": [
          {
            "number": 244,
            "title": "G244 Continuous Evolution: Goal Catalog Refresh",
            "state": "OPEN",
            "url": "https://github.com/pki-vesto/kiempad/issues/244"
          },
          {
            "number": 344,
            "title": "G244 Continuous Evolution: Duplicate Goal Catalog Refresh",
            "state": "OPEN",
            "url": "https://github.com/pki-vesto/kiempad/issues/344"
          }
        ]
      }
    ],
    "missingIssueLinks": [
      {
        "id": "G245",
        "title": "Backlog issue seeding dry-run"
      }
    ],
    "nonOpenIssueLinks": [
      {
        "id": "G246",
        "title": "Open backlog goal with closed issue",
        "issue": {
          "number": 246,
          "title": "G246 Continuous Evolution: Closed Drift Example",
          "state": "CLOSED",
          "url": "https://github.com/pki-vesto/kiempad/issues/246"
        }
      }
    ],
    "completedGoalOpenIssues": [
      {
        "id": "G247",
        "title": "Completed backlog goal with open issue",
        "issue": {
          "number": 247,
          "title": "G247 Continuous Evolution: Open Completion Drift Example",
          "state": "OPEN",
          "url": "https://github.com/pki-vesto/kiempad/issues/247"
        }
      }
    ]
  }
}
```

## Consumer Notes

- Beschouw de vier `issueSnapshot.*` arrays als stabiele rapportsecties, maar niet
  als bewijs dat de voorbeelddata volledig is.
- Het voorbeeld toont per sectie bewust één synthetische rij; productie-output kan
  nul, één of meerdere rijen per sectie bevatten.
- Automation mag alleen rekenen op `id`, lokale backlog `title`, `issues` en
  `issue` plus de gesanitized issuevelden `number`, `title`, `state` en `url`.
- Issue bodies, tokens, auth keys, lokale snapshotpaden en ruwe GitHub responses zijn
  uitgesloten van de fixture en horen niet in commits.
- Maak tijdelijke snapshots altijd opnieuw met `number,title,state,url`, valideer ze
  direct en verwijder `/tmp/kiempad-issues.json` na gebruik.

## Contract Coverage

De JSON-contractvorm wordt bewaakt in `tests/backlogHealth.test.ts`. De test
`documenteert issue-snapshotvelden met een compacte contractmatrix` controleert per
`issueSnapshot`-groep de top-level velden en nested issuevelden. Werk die matrix bij
wanneer de velden in deze referentie bewust veranderen.

Laat de markercomments `backlog-health-json-contract-matrix:start` en
`backlog-health-json-contract-matrix:end` rond de matrixgroepverwachting staan; de
onderhoudstest gebruikt die anchors om documentatie en contractmatrix synchroon te
houden.

Als de onderhoudstest faalt met `Backlog-health contractmatrix ontbreekt`, herstel
beide markercomments `backlog-health-json-contract-matrix:start` en
`backlog-health-json-contract-matrix:end` rond dezelfde
`issueSnapshot`-matrixgroepverwachting in `tests/backlogHealth.test.ts`. Maak daarbij
geen issue-snapshot of ruwe GitHub-output onderdeel van de fix; de recovery is alleen
het terugzetten van de anchors en het opnieuw draaien van de docs-/contracttests.
