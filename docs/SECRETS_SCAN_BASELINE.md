# Secrets Scan Baseline

`npm run secrets:check` is de lokale en CI-gate voor credential hygiene in de publieke
Kiempad-repo. De scanner is bewust licht en projectgericht: hij zoekt naar gangbare
tokens in broncode, docs, scripts en configuratie zonder echte bestandsinhoud naar een
dienst te sturen.

## Pattern ownership

De baseline staat in `scripts/check-secrets.mjs`. Wijzigingen aan patronen of
allowlist-items horen bij Security & DevEx en moeten altijd tests in
`tests/secretsScan.test.ts` aanpassen.

| Pattern | Bedoeling |
|---|---|
| `generic-sk-api-key` | OpenAI-achtige `sk-...` of `sk-proj-...` sleutels. |
| `anthropic-api-key` | Anthropic-achtige `sk-ant-...` sleutels. |
| `github-token` | GitHub tokens met `ghp_`, `gho_`, `ghu_`, `ghs_` of `ghr_`. |
| `tailscale-auth-key` | Tailscale auth keys met `tskey-auth-...`. |
| `aws-access-key` | AWS access key id's met `AKIA...`. |
| `private-key-block` | PEM/OpenSSH private-key blokheaders. |

## Allowlist policy

De allowlist is exact-match en staat naast de scanner. Ieder allowlist-item moet een
concrete rationale hebben. Alleen onbruikbare synthetische placeholders mogen erin,
zoals `sk-test-secret` of `tskey-auth-...`.

Niet allowlisten:

- echte Tailscale auth keys;
- echte AI provider keys;
- GitHub tokens;
- private keys;
- project- of apparaatspecifieke lokale endpoints met credentials;
- hele directories om false positives te ontwijken.

Als een false positive terugkomt, voeg eerst een gerichte negatieve test toe met een
duidelijk onbruikbare placeholder. Verbreed geen directory-exclusions en maak geen
globale regex-uitzondering zonder aparte governance-goal.

## Lokale review

Gebruik bij iedere release of deploymentwijziging:

```bash
npm run secrets:check
```

Een finding toont alleen pad, regel, patternnaam en geredigeerde preview. Plak geen
volledige tokens in issues, PR's of docs.
