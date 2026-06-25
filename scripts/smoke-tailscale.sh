#!/usr/bin/env bash
set -euo pipefail

compose_file="docker-compose.tailscale.yml"
local_port="${KIEMPAD_TAILSCALE_LOCAL_PORT:-8088}"
local_url="${KIEMPAD_LOCAL_SMOKE_URL:-http://127.0.0.1:${local_port}}"
tailnet_url="${KIEMPAD_TAILNET_URL:-}"

fail() {
  echo "$1" >&2
  exit 2
}

compose() {
  TS_AUTHKEY="${TS_AUTHKEY:-tskey-placeholder}" docker compose -f "${compose_file}" "$@"
}

if ! command -v docker >/dev/null 2>&1; then
  fail "Docker is niet beschikbaar op PATH."
fi

if ! docker compose version >/dev/null 2>&1; then
  fail "Docker Compose plugin is niet beschikbaar."
fi

compose ps
compose config >/dev/null

if [[ "$(docker inspect -f '{{.State.Running}}' kiempad-ts 2>/dev/null || true)" != "true" ]]; then
  fail "Container kiempad-ts draait niet. Start eerst met: TS_AUTHKEY=... npm run deploy:tailscale"
fi

if [[ "$(docker inspect -f '{{.State.Running}}' kiempad-web 2>/dev/null || true)" != "true" ]]; then
  fail "Container kiempad-web draait niet. Start eerst met: TS_AUTHKEY=... npm run deploy:tailscale"
fi

if [[ "$(docker inspect -f '{{.State.Running}}' kiempad-central-api 2>/dev/null || true)" != "true" ]]; then
  fail "Container kiempad-central-api draait niet. Start eerst met: TS_AUTHKEY=... npm run deploy:tailscale"
fi

echo "Lokale fallback check: ${local_url}"
curl -fsSI "${local_url}" >/dev/null

echo "Centrale API via same-node /api proxy:"
curl -fsS \
  -X POST \
  -H 'content-type: application/json' \
  --data '{"userId":"kiempad-private-user"}' \
  "${local_url%/}/api/sessions" >/dev/null

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
