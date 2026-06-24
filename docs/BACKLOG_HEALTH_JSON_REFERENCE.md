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
