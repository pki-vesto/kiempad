# Autonomy Guardrail Evidence Checklist

Gebruik deze checklist bij autonome PR's die beleid, docs, tooling, runtimegedrag of
deployment kunnen raken. Het doel is kort bewijs per guardraildomein.

Leg bewijs vast zonder gezondheidsdata, tokens, providerpayloads, screenshots uit echte
portals of volledige lokale URL's.

Bewaar ingevulde evidence in de PR-beschrijving onder het completion-audit blok, of in
een toekomstige `docs/reviews/`-map wanneer een aparte auditnotitie nodig is.

```markdown
## Autonomy Guardrail Evidence

### Network Guardrail
- Impact:
- Evidence:
- Result:

### AI Guardrail
- Impact:
- Evidence:
- Result:

### Data Guardrail
- Impact:
- Evidence:
- Result:

### GitHub Guardrail
- Impact:
- Evidence:
- Result:

### Tailscale Guardrail
- Impact:
- Evidence:
- Result:

### Medical Policy Guardrail
- Impact:
- Evidence:
- Result:

### Sensitive Data Boundary
- User data excluded:
- Secrets excluded:
- Runtime payloads excluded:
```

## Invulinstructie

- **Impact:** noteer `none`, `docs-only`, `test-only`, `runtime`, `deployment` of een
  korte concrete scope.
- **Evidence:** verwijs naar bestanden, tests, commands, PR-checks of ADR's; plak geen
  volledige payloads of secrets.
- **Result:** noteer of het domein ongewijzigd bleef, expliciet getoetst is of follow-up
  nodig heeft.
- **Sensitive Data Boundary:** bevestig dat er geen gebruikersdata, secrets of
  runtimepayloads in bewijs terechtkomen.

## Voorbeeld

```markdown
## Autonomy Guardrail Evidence

### Network Guardrail
- Impact: docs-only.
- Evidence: geen runtimebestanden gewijzigd; `npm run assets:check` groen.
- Result: geen nieuwe netwerkroute.

### AI Guardrail
- Impact: none.
- Evidence: geen AI-code, prompt of providerinstelling gewijzigd.
- Result: AI opt-in blijft ongewijzigd.

### Data Guardrail
- Impact: docs-only.
- Evidence: alleen Markdown en onderhoudstest gewijzigd.
- Result: geen opslag- of exportgedrag gewijzigd.

### GitHub Guardrail
- Impact: PR flow.
- Evidence: `Closes #...`, groene PR-CI, issue/status na merge geverifieerd.
- Result: self-merge volgt ADR-0007.

### Tailscale Guardrail
- Impact: none.
- Evidence: geen wijziging aan `docs/TAILSCALE_DEPLOY.md`, compose of Serve-config.
- Result: Tailscale publicatie blijft ongewijzigd.

### Medical Policy Guardrail
- Impact: docs-only.
- Evidence: geen diagnose-, dosering- of behandelkeuzelogica toegevoegd.
- Result: medische grens blijft ongewijzigd.

### Sensitive Data Boundary
- User data excluded: ja.
- Secrets excluded: ja.
- Runtime payloads excluded: ja.
```
