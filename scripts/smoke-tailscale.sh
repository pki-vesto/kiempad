#!/usr/bin/env bash
set -euo pipefail

compose_file="docker-compose.tailscale.yml"
local_port="${KIEMPAD_TAILSCALE_LOCAL_PORT:-}"
local_url="${KIEMPAD_LOCAL_SMOKE_URL:-}"
tailnet_url="${KIEMPAD_TAILNET_URL:-}"

fail() {
  echo "$1" >&2
  exit 2
}

check_health_contract() {
  local label="$1"
  local url="$2"
  local body

  echo "Centrale API health privacy check (${label}): ${url}"
  body="$(curl -fsS "${url}")"
  HEALTH_BODY="${body}" node <<'NODE'
const body = process.env.HEALTH_BODY ?? '';
let parsed;
try {
  parsed = JSON.parse(body);
} catch (_error) {
  console.error('G503/G1078 health response is geen geldige JSON.');
  process.exit(2);
}

const expected = {
  status: 'ok',
  contractVersion: 1,
  service: 'kiempad-central-encrypted-api',
  storageMode: 'central-api',
  encryptionBoundary: 'client-side-encrypted-envelopes',
  backendVisibility: 'technical-metadata-only',
  medicalPlaintext: false,
  dataRoutes: 'bearer-session-required',
  emptyState: 'no-user-dataset-opened',
};
const expectedKeys = [...Object.keys(expected), 'errorStates'].sort();
const actualKeys = Object.keys(parsed).sort();
if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) {
  console.error('G503/G1078 health response bevat onverwachte velden.');
  process.exit(2);
}
for (const [key, value] of Object.entries(expected)) {
  if (parsed[key] !== value) {
    console.error(`G503/G1078 health response mismatch voor ${key}.`);
    process.exit(2);
  }
}
const expectedErrors = ['unauthorized', 'forbidden', 'central-api-error'];
if (JSON.stringify(parsed.errorStates) !== JSON.stringify(expectedErrors)) {
  console.error('G503/G1078 health response mist expliciete foutstatussen.');
  process.exit(2);
}
const serialized = JSON.stringify(parsed);
for (const forbidden of [
  'ownerUserId',
  'userId',
  'sessionId',
  'recordId',
  'recordCount',
  'ciphertext',
  'api key',
  'diagnose',
  'dosering',
  'kansberekening',
  'behandelkeuzeadvies',
]) {
  if (serialized.includes(forbidden)) {
    console.error('G503/G1078 health response bevat verboden privacyveld.');
    process.exit(2);
  }
}
NODE
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

if [[ -z "${local_url}" ]]; then
  if [[ -z "${local_port}" ]]; then
    local_port="$(docker port kiempad-ts 80/tcp 2>/dev/null | sed -n 's/.*:\([0-9][0-9]*\)$/\1/p' | head -n 1)"
  fi
  local_url="http://127.0.0.1:${local_port:-8088}"
fi

echo "Lokale fallback check: ${local_url}"
curl -fsSI "${local_url}" >/dev/null

echo "Centrale API via same-node /api proxy:"
curl -fsS \
  -X POST \
  -H 'content-type: application/json' \
  --data '{"userId":"kiempad-private-user"}' \
  "${local_url%/}/api/sessions" >/dev/null
check_health_contract "lokale proxy" "${local_url%/}/api/health"

echo "Tailscale status:"
docker exec kiempad-ts tailscale status

echo "Tailscale Serve status:"
docker exec kiempad-ts tailscale serve status

if [[ -n "${tailnet_url}" ]]; then
  echo "Tailnet HTTPS check: ${tailnet_url}"
  curl -fsSI "${tailnet_url}" >/dev/null
  check_health_contract "tailnet HTTPS" "${tailnet_url%/}/api/health"
else
  echo "KIEMPAD_TAILNET_URL niet gezet; sla HTTPS curl over."
  echo "Voor live /api/health check: KIEMPAD_TAILNET_URL=https://kiempad.<tailnet>.ts.net npm run smoke:tailscale"
fi

echo "Smoke checks afgerond."
