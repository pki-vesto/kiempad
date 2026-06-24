# Public Repo Privacy Review

Gebruik deze checklist voordat een release, themawijziging of grote documentatie-PR
wordt gemerged. De repo is publiek; gezondheidsdata, persoonlijke context en echte
portalbeelden horen daarom nooit in code, docs, tests of gegenereerde assets.

## Reviewmoment

- Voor iedere release-PR.
- Voor PR's met screenshots, seeddata, fixtures, exportvoorbeelden of thema-assets.
- Voor wijzigingen aan `.env.example`, scripts, CI of publicatie-instructies.

## Checklist

1. **Docs**
   - Controleer gewijzigde Markdown op echte namen, e-mailadressen, telefoonnummers,
     patientnummers, dossiernummers, BSN-achtige waarden, kliniekportaalteksten en
     behandelinhoud die niet aantoonbaar synthetisch is.
   - Houd medische tekst generiek en verwijs naar de kliniek waar advies, dosering of
     behandelkeuze nodig is.

2. **Fixtures**
   - Gebruik alleen synthetische data uit de stijl van `Testpersoon A/B`,
     `example.test` en neutrale record-id's.
   - Draai `npm run fixtures:check` en voeg geen allowlist toe zonder aparte
     governance-goal of expliciete rationale.

3. **Screenshots**
   - Commit geen screenshots uit echte portals, consulten, echo-omgevingen,
     labuitslagen, chatgesprekken of lokale kluizen.
   - Gebruik alleen synthetische UI-states; verwijder browserprofieldata, URL's,
     notificatie-inhoud en bestandsnamen uit beelden.

4. **Env Files**
   - Commit nooit `.env`, tokens, Tailscale auth keys, AI provider keys of lokale
     endpointgeheimen.
   - `.env.example` bevat alleen lege placeholders of duidelijk onbruikbare waarden.
   - Draai `npm run secrets:check` voordat de PR wordt gemerged.

5. **Generated Assets**
   - Controleer `dist/`, PWA-assets, exports, promptoverzichten en gegenereerde
     Markdown op persoonlijke inhoud voordat ze worden toegevoegd of gepubliceerd.
   - Draai `npm run build && npm run assets:check`; remote assets blijven verboden
     tenzij een toekomstige allowlist-governance dat expliciet toestaat.

## Evidence

Noteer in de PR welke checks zijn uitgevoerd. Een korte verwijzing is genoeg:

- `docs/PUBLIC_REPO_PRIVACY_REVIEW.md` doorlopen.
- `npm run secrets:check` groen.
- `npm run fixtures:check` groen.
- `npm run build && npm run assets:check` groen wanneer assets of thema zijn geraakt.
