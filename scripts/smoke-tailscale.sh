#!/usr/bin/env bash
set -euo pipefail

compose_file="docker-compose.tailscale.yml"
local_url="${KIEMPAD_LOCAL_SMOKE_URL:-http://127.0.0.1:8088}"
tailnet_url="${KIEMPAD_TAILNET_URL:-}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is niet beschikbaar op PATH." >&2
  exit 2
fi

docker compose -f "${compose_file}" ps
docker compose -f "${compose_file}" config >/dev/null

echo "Lokale fallback check: ${local_url}"
curl -fsSI "${local_url}" >/dev/null

echo "Tailscale status:"
docker exec kiempad-ts tailscale status

echo "Tailscale Serve status:"
docker exec kiempad-ts tailscale serve status

if [[ -n "${tailnet_url}" ]]; then
  echo "Tailnet HTTPS check: ${tailnet_url}"
  curl -fsSI "${tailnet_url}" >/dev/null
else
  echo "KIEMPAD_TAILNET_URL niet gezet; sla HTTPS curl over."
  echo "Voor live check: KIEMPAD_TAILNET_URL=https://kiempad.<tailnet>.ts.net npm run smoke:tailscale"
fi

echo "Smoke checks afgerond."
