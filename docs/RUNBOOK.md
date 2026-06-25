# Kiempad — RUNBOOK

> Praktische, operationele handleiding. Kiempad gebruikt centrale encrypted opslag
> voor nieuwe multi-device data; legacy lokale opslag blijft fallback.

## Local run

```bash
cp .env.example .env     # standaard hoeft hier niets ingevuld te worden
npm install
npm run dev              # of: make dev  — Vite dev-server (poort uit KIEMPAD_DEV_PORT)
```

Open de app in de browser; "installeer" hem als PWA voor offline gebruik en
notificaties. Bij eerste start kies je een **passphrase** (zie SECURITY.md) waarmee
de payloads client-side versleuteld worden.

Voor centrale multi-device opslag:

```bash
KIEMPAD_CENTRAL_PERSISTENCE_FILE=/tmp/kiempad-central-db.json npm run backend:central
```

Zet daarna in `.env`:

```bash
VITE_KIEMPAD_CENTRAL_API_URL=http://127.0.0.1:8099
VITE_KIEMPAD_CENTRAL_USER_ID=kiempad-private-user
```

De backend staat standaard alleen `kiempad-private-user` toe. Zet
`KIEMPAD_CENTRAL_ALLOWED_USER_IDS` op de backendhost als de server-side owner-scope
bewust anders moet zijn. De frontend user-id alleen geeft geen toegang. Zet
`KIEMPAD_CENTRAL_ALLOWED_ORIGINS` als de PWA vanaf een andere browser-origin draait
dan de backend; lokale Vite/preview origins zijn standaard toegestaan.

Zonder centrale API-URL gebruikt de PWA de legacy lokale IndexedDB-kluis.

## Health checks

- **Build/typecheck:** `npm run typecheck` (geen TS-fouten).
- **Tests:** `npm run test` (Vitest groen).
- **Asset-privacy:** `npm run build && npm run assets:check` (geen externe
  image/font/script/manifest-URL's in bron- of buildassets; allowlist-governance staat
  in [`docs/EXTERNAL_ASSET_ALLOWLIST.md`](EXTERNAL_ASSET_ALLOWLIST.md)).
- **CSP:** `index.html` blokkeert remote scripts standaard; bij dev-HMR zijn alleen
  lokale websocketverbindingen naar `localhost`/`127.0.0.1` toegestaan. CSP
  violation-diagnose blijft lokaal zonder report-endpoint; zie
  [`docs/CSP_VIOLATION_WORKFLOW.md`](CSP_VIOLATION_WORKFLOW.md).
- **Secrets:** `npm run secrets:check` scant docs/source op gangbare API keys,
  Tailscale auth keys, GitHub tokens, AWS keys en private-keyblokken. Pattern ownership
  en allowlistbeleid staan in [`docs/SECRETS_SCAN_BASELINE.md`](SECRETS_SCAN_BASELINE.md).
- **PWA:** app laadt offline na eerste bezoek; service worker geregistreerd.
- **Offline smoke:** `npm run build && npm run smoke:offline` opent de productiebuild
  via Vite preview, laat de service worker installeren, schakelt Playwright offline en
  herlaadt de app-shell.
- **Centrale browser smoke:** `npm run smoke:central` start een tijdelijke centrale
  backend, bouwt de PWA met `VITE_KIEMPAD_CENTRAL_API_URL`, opent de app in
  Playwright en verifieert dat een UI-write als encrypted settings-record in de
  centrale persistence staat. Daarna opent dezelfde build in een tweede schone
  browsercontext en ontgrendelt dezelfde centrale dataset zonder lokaal opnieuw te
  starten.
- **Back-up restore drill:** `npm run drill:backup` exporteert, importeert,
  ontgrendelt en verifieert representatieve versleutelde records met memory drivers.
- **Opslag:** data leesbaar na ontgrendelen, onleesbaar zonder passphrase.
- **Privacy-rook­test:** in de netwerk-tab is er alleen verkeer naar de eigen
  centrale API en geen verkeer naar derden, tenzij je AI bewust hebt aangezet.

## Core workflow demo

1. Maak een **Traject** aan en zet de huidige **fase**.
2. Voeg een **afspraak** toe (bv. echo) en een **vraag voor de arts**.
3. Voeg een **medicatie** toe met de door de kliniek opgegeven dosis; plan een
   **DoseLog** en zet een **herinnering**.
4. Vink de inname af; controleer dat het overzicht "geen gemiste inname" toont.
5. Open de **kennisbank** en bekijk een item; let op de herkomst-/verificatielabels.

## Deploy to own VPS / tailnet (optioneel)

De PWA hoeft niet gehost te worden, maar kan op een eigen knooppunt:

```bash
docker compose up -d --build     # of: make up  — serveert op http://localhost:8088
```

De container is **stateless** (geen gebruikersdata). Publiceren op de tailnet kan
analoog aan de andere apps (eigen Tailscale-node / sidecar) als dat ooit gewenst is —
houd hem dan privé/achter de tailnet.

### Tailscale HTTPS-node

Voor de Shred/Healthcore-achtige publicatieroute is er een aparte compose-stack:

```bash
TS_AUTHKEY=tskey-auth-... npm run deploy:tailscale
```

Die stack maakt een eigen Tailscale-node `kiempad`, gebruikt Tailscale Serve voor
HTTPS op `https://kiempad.tail9d0c71.ts.net` en proxyt naar de statische nginx-PWA.
De live lokale fallbackpoort is `127.0.0.1:8098`, omdat Shred al `8088` gebruikt.
Controleer daarna met
`KIEMPAD_TAILSCALE_LOCAL_PORT=8098 KIEMPAD_TAILNET_URL=https://kiempad.tail9d0c71.ts.net npm run smoke:tailscale`.
Zie [`docs/TAILSCALE_DEPLOY.md`](TAILSCALE_DEPLOY.md).

## Debugging

- **Data niet leesbaar:** verkeerde passphrase, of opslag gewist. Er is geen
  herstel-achterdeur (by design) — gebruik een versleutelde back-up.
- **Herinneringen komen niet:** controleer notificatie-permissie van de browser/PWA
  en of de service worker actief is.
- **AI doet niets:** AI staat default uit; controleer opt-in + sleutel in de
  instellingen (versleuteld opgeslagen, niet in `.env`).

### Unlock recovery checklist

1. Controleer rustig de passphrase, toetsenbordindeling, hoofdletters en eventuele
   wachtwoordmanager-invoer.
2. Gebruik WebAuthn/biometrie alleen als het eerder op dit toestel aan dezelfde kluis
   is gekoppeld; het is ontgrendelgemak, geen herstel-achterdeur.
3. Als lokale browseropslag leeg of beschadigd is, maak een nieuwe kluis en importeer
   daarna de meest recente versleutelde `.kiempad-export` back-up.
4. Zonder passphrase of bruikbare versleutelde back-up kan Kiempad lokale
   gezondheidsdata niet herstellen.

## Rollback

- **Code:** terug naar een eerdere commit op `main` (de app is client-side; geen
  migratie-risico op een server).
- **Data:** importeer een eerdere **versleutelde back-up/export**. Data-migraties zijn
  additief; een oudere export blijft leesbaar.
- **Restore oefenen:** draai `npm run drill:backup` na wijzigingen aan opslag, back-up
  of datamodel om te bewaken dat export/import en ontgrendelen samen blijven werken.
- **Docker:** `docker compose down` en eventueel een vorige image opnieuw bouwen/
  serveren.
