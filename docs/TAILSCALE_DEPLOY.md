# Kiempad via Tailscale HTTPS-node

Doel: Kiempad publiceren op een **aparte Tailscale-node** met hostname `kiempad`,
vergelijkbaar met Shred (`shred`) en Healthcore (`healthcore`). De bestaande
Tailscale-stack in dit document serveert de statische PWA-assets. De centrale
encrypted backend heeft een aparte runtime en Compose-wrapper; zie
[`CENTRAL_ENCRYPTED_BACKEND.md`](CENTRAL_ENCRYPTED_BACKEND.md).

Actuele productie-URL: `https://kiempad.tail9d0c71.ts.net`.
Lokale fallback op de host: `http://127.0.0.1:8098`.

## Architectuur

```
Tailscale-device
  │
  │ https://kiempad.tail9d0c71.ts.net
  ▼
kiempad-ts (tailscale/tailscale)
  └─ Tailscale Serve HTTPS :443
      └─ http://127.0.0.1:80
          └─ kiempad-web (nginx, statische dist/)
```

Belangrijk voor deze statische PWA-stack:

- Geen Tailscale Funnel. Kiempad blijft alleen bereikbaar voor apparaten in de
  tailnet.
- Geen backendcontainer in `docker-compose.tailscale.yml`.
- De webcontainer is stateless; centrale encrypted opslag draait alleen als de
  aparte backendruntime expliciet wordt gestart.
- Tailscale HTTPS gebruikt de MagicDNS-naam `kiempad.<tailnet>.ts.net`.
- Als de PWA rechtstreeks naar een aparte centrale API-origin fetcht, voeg dan de
  PWA-URL toe aan `KIEMPAD_CENTRAL_ALLOWED_ORIGINS` op die backend.

Bronnen voor de gebruikte Tailscale-route:

- `tailscale serve` deelt een lokale service binnen de tailnet en ondersteunt HTTPS
  met automatisch geprovisioneerde TLS-certificaten.
- Tailscale HTTPS vereist MagicDNS en HTTPS Certificates in de admin-console; de
  node-naam en tailnetnaam komen in certificate-transparency logs terecht. Gebruik
  daarom de niet-gevoelige machine name `kiempad`.
- Funnel is bedoeld om services voor het publieke internet open te zetten; dat is
  voor Kiempad expliciet niet de gewenste route.

## Eenmalige Tailscale-voorbereiding

In de Tailscale admin-console:

1. Zet **MagicDNS** aan.
2. Zet **HTTPS Certificates** aan.
3. Maak een reusable auth key of ephemeral deployment key voor deze node.
4. Houd de node-naam op `kiempad`; gebruik geen persoonsgegevens in machine names.

## Deploy

Vanaf de Kiempad-repo op de doelhost:

```bash
cd ~/kiempad
TS_AUTHKEY=tskey-auth-... npm run deploy:tailscale
```

Het deployscript stopt vóór build/start als:

- `TS_AUTHKEY` ontbreekt of niet op `tskey-*` lijkt;
- Docker of de Docker Compose plugin ontbreekt;
- de lokale fallbackpoort al door een andere service wordt gebruikt.

De lokale fallbackpoort is standaard `127.0.0.1:8088`. Voor de live Kiempad-node is
`8098` gebruikt omdat Shred al `8088` gebruikt. Als de poort bewust anders moet zijn:

```bash
KIEMPAD_TAILSCALE_LOCAL_PORT=8098 TS_AUTHKEY=tskey-auth-... npm run deploy:tailscale
```

Verwachte containers:

- `kiempad-ts`
- `kiempad-web`

De Tailscale-container gebruikt `ts/serve.json`:

- HTTPS listener op `:443`
- proxy naar `http://127.0.0.1:80`

Lokale fallback op de host:

```bash
curl -I http://127.0.0.1:8098
```

Gebruik dezelfde `KIEMPAD_TAILSCALE_LOCAL_PORT` bij smoke als je bij deploy een
andere lokale poort koos.

Tailnet-smoke vanaf een apparaat in de tailnet:

```bash
curl -I https://kiempad.tail9d0c71.ts.net
```

Gecombineerde smoke:

```bash
KIEMPAD_TAILSCALE_LOCAL_PORT=8098 KIEMPAD_TAILNET_URL=https://kiempad.tail9d0c71.ts.net npm run smoke:tailscale
```

In de Tailscale-container:

```bash
docker exec kiempad-ts tailscale status
docker exec kiempad-ts tailscale serve status
```

## Beheer

Update naar de nieuwste `main`:

```bash
git pull --ff-only
TS_AUTHKEY=tskey-auth-... npm run deploy:tailscale
```

Logs:

```bash
docker compose -f docker-compose.tailscale.yml logs -f tailscale
docker compose -f docker-compose.tailscale.yml logs -f kiempad-web
```

Stoppen:

```bash
docker compose -f docker-compose.tailscale.yml down
```

Volledig loskoppelen van de tailnet:

```bash
docker compose -f docker-compose.tailscale.yml down -v
```

Daarna de node `kiempad` verwijderen uit de Tailscale admin-console.

## Privacycontrole

Controleer na deploy:

- De app is alleen bereikbaar via Tailscale, niet via publieke DNS of port-forwarding.
- `docker-compose.tailscale.yml` mount geen `data/`, `backups/` of `.env` met
  gezondheidsdata.
- Als `VITE_KIEMPAD_CENTRAL_API_URL` naar de centrale encrypted backend wijst en de
  backend hetzelfde persistence-volume gebruikt, opent een nieuw apparaat na
  passphrase-ontgrendeling dezelfde centrale encrypted dataset via de API.
- Zonder centrale API-URL gebruikt de PWA expliciet de legacy lokale IndexedDB-kluis;
  dat fallbackpad deelt geen nieuwe data tussen apparaten.
- Browser network tab toont geen externe requests buiten opt-in AI/sync.
