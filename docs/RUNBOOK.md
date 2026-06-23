# Kiempad — RUNBOOK

> Praktische, operationele handleiding. Kiempad is local-first; "operations" is
> bewust klein.

## Local run

```bash
cp .env.example .env     # standaard hoeft hier niets ingevuld te worden
npm install
npm run dev              # of: make dev  — Vite dev-server (poort uit KIEMPAD_DEV_PORT)
```

Open de app in de browser; "installeer" hem als PWA voor offline gebruik en
notificaties. Bij eerste start kies je een **passphrase** (zie SECURITY.md) waarmee
de lokale data versleuteld wordt.

## Health checks

- **Build/typecheck:** `npm run typecheck` (geen TS-fouten).
- **Tests:** `npm run test` (Vitest groen).
- **PWA:** app laadt offline na eerste bezoek; service worker geregistreerd.
- **Opslag:** data leesbaar na ontgrendelen, onleesbaar zonder passphrase.
- **Privacy-rook­test:** in de netwerk-tab is er **geen** verkeer naar derden tenzij
  je AI/sync bewust hebt aangezet.

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
TS_AUTHKEY=tskey-auth-... docker compose -f docker-compose.tailscale.yml up -d --build
```

Die stack maakt een eigen Tailscale-node `kiempad`, gebruikt Tailscale Serve voor
HTTPS op `https://kiempad.<tailnet>.ts.net` en proxyt naar de statische nginx-PWA.
Zie [`docs/TAILSCALE_DEPLOY.md`](TAILSCALE_DEPLOY.md).

## Debugging

- **Data niet leesbaar:** verkeerde passphrase, of opslag gewist. Er is geen
  herstel-achterdeur (by design) — gebruik een versleutelde back-up.
- **Herinneringen komen niet:** controleer notificatie-permissie van de browser/PWA
  en of de service worker actief is.
- **AI doet niets:** AI staat default uit; controleer opt-in + sleutel in de
  instellingen (versleuteld opgeslagen, niet in `.env`).

## Rollback

- **Code:** terug naar een eerdere commit op `main` (de app is client-side; geen
  migratie-risico op een server).
- **Data:** importeer een eerdere **versleutelde back-up/export**. Data-migraties zijn
  additief; een oudere export blijft leesbaar.
- **Docker:** `docker compose down` en eventueel een vorige image opnieuw bouwen/
  serveren.
