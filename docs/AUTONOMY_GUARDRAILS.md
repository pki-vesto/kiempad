# Autonomy Guardrails

Kiempad mag autonoom worden doorontwikkeld volgens
[`ADR-0007`](adr/0007-codex-autonoom-bouwen.md), maar autonomie verandert niets aan de
local-first, privacy- en medische grenzen. Deze guardrails zijn de minimumcheck voor
elk autonoom doel en elke self-merge.

## Beslisregel

1. Kies de veiligste lokale route wanneer een doel op meerdere manieren uitvoerbaar is.
2. Voeg geen nieuwe uitgaande dataroute, cloudopslag of remote analyse toe zonder
   expliciete opt-in, documentatie en een passende ADR wanneer het beleid verandert.
3. Markeer werk alleen klaar als het doel, het issue, tests, documentatie en backlog
   direct bewijsbaar kloppen.
4. Laat medische inhoud feitelijk en ondersteunend blijven: Kiempad geeft geen
   diagnose, dosering, behandelkeuze of vervanging van medisch advies.

## Netwerk

- Standaard geen nieuwe netwerkcalls vanuit de app-runtime.
- Externe assets, scripts, fonts en API's blijven verboden tenzij een expliciete
  allowlist met rationale, testdekking en privacyreview bestaat.
- Nieuwe research-, sync- of AI-routes moeten zichtbaar zijn in documentatie, tests en
  gebruikerscontrole voordat ze in runtime bereikbaar zijn.
- Remote logging, analytics, crashreports en CSP-report endpoints zijn niet toegestaan
  zonder expliciete opt-in en aparte ADR.

## AI

- AI staat standaard uit en mag alleen draaien na expliciete lokale opt-in en bewuste
  gebruikersactie.
- Payloads worden geminimaliseerd en gede-identificeerd voordat ze een provider kunnen
  bereiken.
- AI-output blijft concept, brongebonden en reviewbaar; artsverificatie blijft apart.
- Verboden output blijft geblokkeerd: geen diagnose, geen dosering, geen behandelkeuze,
  geen kansscore en geen medisch voorschrift.
- On-device AI-detectie mag passief zijn, maar geen modeldownload, sessie of cloudcall
  starten zonder opt-in.

## Data

- Gezondheidsdata blijft local-first, versleuteld en buiten de publieke repo.
- Testdata, fixtures, screenshots en docs gebruiken alleen synthetische voorbeelden.
- Back-ups en exports mogen geen plaintext gezondheidsdata in logs, command output,
  PR's of issues plaatsen.
- Operationele metadata mag geen tweede medisch dossier worden; details blijven
  generiek en allowlist-gebonden.
- Secrets, API keys, Tailscale auth keys, tokens en private keys worden nooit
  hergebruikt uit andere apps of vastgelegd in de repo.

## GitHub

- Elke autonome wijziging houdt PR's klein genoeg om achteraf te auditen.
- PR's gebruiken `Closes #...` alleen wanneer het gekoppelde doel volledig af is.
- Groene CI is de harde merge-gate: typecheck, lint, tests, audit, build en relevante
  projectchecks moeten slagen voordat self-merge mag.
- Backlog, `EXECUTION_GOALS.md`, `CURRENT_STATE.md` en `CHANGELOG.md` worden in dezelfde
  wijziging bijgewerkt.
- Issues en PR's bevatten geen echte medische data, tokens, volledige lokale URL's of
  providerpayloads.

## Tailscale

- Kiempad blijft via een aparte Tailscale HTTPS-node gepubliceerd, zonder publieke
  Funnel, publieke DNS of port-forwarding.
- Tailscale publiceert alleen de statische PWA binnen de tailnet; er draait geen
  Kiempad-backend die gezondheidsdata verwerkt.
- Auth keys worden buiten de repo beheerd en nooit uit andere apps gekopieerd naar
  documentatie, logs, issues of PR's.
- Wijzigingen aan hostname, poort, Serve-config of deploymentpad vereisen update van
  `docs/TAILSCALE_DEPLOY.md`, runbook en smoke-instructies.
- Tailscale-smokes mogen status en bereikbaarheid rapporteren, maar geen dossierinhoud.

## Medisch Beleid

- Kiempad is geen medisch hulpmiddel en geen vervanging van medisch advies.
- De app mag informatie ordenen, samenvatten, terugvindbaar maken en consultvragen
  voorbereiden.
- De app mag geen diagnose stellen, behandelkeuze adviseren, dosering berekenen,
  embryo's medisch rangschikken of kansen voorspellen.
- Schema's, doseringen en behandelbesluiten volgen altijd de kliniek of behandelend
  arts.
- Publicaties en AI-samenvattingen krijgen een wetenschappelijke samenvatting, een
  eenvoudige samenvatting en relevantiecontext zonder persoonlijke medische conclusie.

## Verificatie per Autonome PR

- Lees het doel en issue voordat de implementatie start.
- Controleer deze guardrails bij netwerk, AI, data, GitHub, Tailscale en medische
  impact.
- Draai de lokale validatie die bij de wijziging past en noteer die in de PR.
- Werk docs en backlog bij voordat het doel als klaar wordt gemarkeerd.
- Merge pas na groene CI en verifieer daarna issue-status, `main` CI en backlog-health.
