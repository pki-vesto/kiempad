#!/usr/bin/env bash
set -euo pipefail

compose_file="docker-compose.tailscale.yml"
local_port="${KIEMPAD_TAILSCALE_LOCAL_PORT:-8088}"

fail() {
  echo "$1" >&2
  exit 2
}

port_is_listening() {
  local port="$1"

  if command -v ss >/dev/null 2>&1; then
    ss -ltn | awk '{print $4}' | grep -Eq "(^|:)${port}$"
    return
  fi

  if command -v lsof >/dev/null 2>&1; then
    lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1
    return
  fi

  return 1
}

if [[ -z "${TS_AUTHKEY:-}" ]]; then
  cat >&2 <<'MSG'
TS_AUTHKEY ontbreekt.

Maak een Tailscale auth key in de admin-console en run:
  TS_AUTHKEY=tskey-auth-... npm run deploy:tailscale

De key wordt niet gelogd of opgeslagen door dit script.
MSG
  exit 2
fi

if [[ "${TS_AUTHKEY}" != tskey-* ]]; then
  fail "TS_AUTHKEY heeft niet het verwachte Tailscale key-formaat (tskey-*)."
fi

if ! command -v docker >/dev/null 2>&1; then
  fail "Docker is niet beschikbaar op PATH."
fi

if ! docker compose version >/dev/null 2>&1; then
  fail "Docker Compose plugin is niet beschikbaar."
fi

docker compose -f "${compose_file}" config >/dev/null

if port_is_listening "${local_port}" && ! docker ps --format '{{.Names}}' | grep -qx 'kiempad-ts'; then
  cat >&2 <<MSG
Poort 127.0.0.1:${local_port} is al in gebruik.

Stop de andere service of wijzig de publicatiestack voordat je Kiempad via Tailscale start.
MSG
  exit 2
fi

docker compose -f "${compose_file}" up -d --build

echo "Kiempad Tailscale-stack is gestart."
echo "Controleer met: npm run smoke:tailscale"
