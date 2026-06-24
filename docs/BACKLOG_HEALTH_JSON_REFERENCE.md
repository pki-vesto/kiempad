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
