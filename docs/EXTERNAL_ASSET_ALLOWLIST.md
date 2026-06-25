# External Asset Allowlist Governance

Kiempad is privacy-first met centrale encrypted opslag als primaire route. Externe
image-, font-, script- en manifest-URL's zijn daarom standaard verboden in broncode
en buildassets. De gate is:

```bash
npm run build && npm run assets:check
```

## Wanneer mag een URL op de allowlist?

Alleen technische URL's die geen remote asset laden mogen worden overwogen. Een
allowlist-entry is dus bedoeld voor namespaces of browserstandaarden zoals de SVG
namespace, niet voor CDN's, fonts, afbeeldingen, scripts, analytics, modelbestanden of
remote manifests.

Een uitzondering mag alleen wanneer alle punten kloppen:

- De URL start geen netwerkverzoek voor Kiempad-gebruikers.
- De URL is nodig om een lokaal bestand correct te laten werken of valideren.
- De rationale staat direct naast de allowlist-entry in
  `scripts/check-no-external-assets.mjs`.
- `tests/noExternalAssets.test.ts` blijft groen en bewijst dat entries zonder
  rationale worden afgewezen.

## Niet allowlisten

- CDN's voor JavaScript, CSS, fonts of afbeeldingen.
- Remote PWA-manifesten, iconen of screenshots.
- AI-provider endpoints, modeldownloads of telemetry.
- Tailscale-, GitHub- of deployment-URL's die runtime assets zouden laden.

Als een echte remote asset ooit noodzakelijk lijkt, behandel dat als een nieuw
architectuurbesluit: documenteer het privacy-effect, vraag expliciete opt-in waar
nodig en voeg geen allowlist-entry toe voordat de keuze is gereviewd.

## Huidige allowlist

| URL | Rationale |
|---|---|
| `http://www.w3.org/2000/svg` | Technische SVG namespace; dit is geen netwerkload en is nodig voor geldige inline SVG. |
