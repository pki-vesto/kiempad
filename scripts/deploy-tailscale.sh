#!/usr/bin/env bash
set -euo pipefail

compose_file="docker-compose.tailscale.yml"

if [[ -z "${TS_AUTHKEY:-}" ]]; then
  cat >&2 <<'MSG'
TS_AUTHKEY ontbreekt.

Maak een Tailscale auth key in de admin-console en run:
  TS_AUTHKEY=tskey-auth-... npm run deploy:tailscale

De key wordt niet gelogd of opgeslagen door dit script.
MSG
  exit 2
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is niet beschikbaar op PATH." >&2
  exit 2
fi

docker compose -f "${compose_file}" config >/dev/null
docker compose -f "${compose_file}" up -d --build

echo "Kiempad Tailscale-stack is gestart."
echo "Controleer met: npm run smoke:tailscale"
