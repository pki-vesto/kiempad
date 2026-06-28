# Autonomous Evolution Governance

Kiempad is maintained as a continuously evolving product. The active-goal catalog must stay large enough to keep product, architecture, quality and design work executable without waiting for a new planning round.

## Minimum Active Goal Floor

The backlog and execution catalog must maintain at least:

- 100 active open goals.
- 3 active epics.
- 1 future roadmap horizon.

If the floor is not met, generate additional implementation-ready goals before unrelated cleanup. Active goals must be mirrored as GitHub Issues and must keep the same G-id in PRODUCT_BACKLOG.md, EXECUTION_GOALS.md and the issue title.

Run the explicit floor check before closing autonomous maintenance work:

```bash
npm run backlog:health -- --minimum-open-goals 100
```

For GitHub parity, create a fresh sanitized issue snapshot and validate it in the same pass:

```bash
gh issue list --state all --limit 500 --json number,title,state,url > /tmp/kiempad-issues.json
npm run backlog:health -- --issues-json /tmp/kiempad-issues.json --issue-snapshot-limit 500 --minimum-open-goals 100
rm -f /tmp/kiempad-issues.json
```

## Priority Horizons

1. Central encrypted database architecture.
2. Cross-device user data availability.
3. Fertility Intelligence Platform.
4. Historical medical record uploads.
5. Image, ultrasound and embryo uploads.
6. Consultation upload and analysis.
7. Research intelligence with layperson summaries.
8. Daily recommendations for woman and man.
9. Fertility timeline and knowledge graph.
10. Premium Claude Design UI.

## Boundaries

- No diagnosis.
- No dosage advice.
- No treatment-choice advice.
- No plaintext medical content on the backend.
- No secrets, real health data or auth keys in git, issues or PR bodies.
- Network, AI and research aggregation stay explicitly opt-in.
