#!/usr/bin/env bash
# Test semua endpoint Hydration Tracker API
# Cara pakai:
#   ./test-api.sh                                   # token diambil otomatis (butuh EMAIL/PASSWORD)
#   EMAIL=lo@email.com PASSWORD=rahasia ./test-api.sh
#   BASE_URL=https://api.domain.com ./test-api.sh
#
# Catatan auth:
#   - Token dikirim lewat header "Authorization: Bearer <token>".
#   - Endpoint lokal yang jalan dengan DEV_AUTH_BYPASS (default di dev) membolehkan
#     request tanpa token. Header respons "X-Auth-Mode" memberi tahu mode yang dipakai:
#       bearer     = token valid via header
#       query      = token valid via ?token=...
#       dev-bypass = tanpa token, mode development lokal saja
#   - Bypass otomatis nonaktif di produksi (NODE_ENV=production / CONTEXT / NETLIFY).

set -uo pipefail

EMAIL="${EMAIL:-}"
PASSWORD="${PASSWORD:-}"
BASE_URL="${BASE_URL:-http://localhost:3000}"
TMP_BODY="$(mktemp -t hydra_body)"

if [ -z "$EMAIL" ] || [ -z "$PASSWORD" ]; then
  echo "NOTE: EMAIL/PASSWORD belum di-set."
  echo "      Kalau server lokal pakai DEV_AUTH_BYPASS, token tidak wajib."
  echo "      Set EMAIL=... PASSWORD=... untuk tes mode token sungguhan."
  echo ""
fi

# Ambil env dari .env project (kalau ada)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/.env" ]; then
  set -a; . "$SCRIPT_DIR/.env"; set +a
fi

# 1. Login -> ambil access_token (boleh kosong kalau dev bypass aktif)
TOKEN=""
if [ -n "$EMAIL" ] && [ -n "$PASSWORD" ]; then
  TOKEN=$(curl -s -X POST "${VITE_SUPABASE_URL}/auth/v1/token?grant_type=password" \
    -H "apikey: ${VITE_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
    | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{console.log(JSON.parse(d).access_token||'')}catch(e){console.log('')}})")
fi

if [ -n "$TOKEN" ]; then
  echo "Token berhasil diambil untuk $EMAIL"
else
  echo "Token TIDAK diambil (login dilewati)."
fi
echo "=========================================================="

# Helper: cek status + mode auth dari header respons
check_mode() {
  local label="$1"; shift
  local hdr status mode
  hdr=$(curl -s -D - -o /dev/null "$@")
  status=$(printf '%s' "$hdr" | head -n1 | awk '{print $2}')
  mode=$(printf '%s' "$hdr" | grep -i '^x-auth-mode:' | tr -d '\r' | awk '{print $2}')
  printf 'TEST  %-24s HTTP %-3s mode=%s\n' "$label" "$status" "${mode:-none}"
}

# 2. Jalankan request
#    format: METHOD|PATH|BODY|EXPECTED_STATUS
LAST_BODY=""
run() {
  local method="$1" path="$2" body="${3:-}" expect="$4"
  local args=(-s -w '\n__STATUS__%{http_code}' -X "$method" "${BASE_URL}${path}"
              -H "Authorization: Bearer ${TOKEN}" -H "Content-Type: application/json")
  [ -n "$body" ] && args+=(-d "$body")

  local out; out=$(curl "${args[@]}")
  local status; status=$(printf '%s' "$out" | tail -n1 | sed 's/__STATUS__//')
  local payload; payload=$(printf '%s' "$out" | sed '$d')
  LAST_BODY="$payload"

  local mark="OK "
  [ "$status" != "$expect" ] && mark="FAIL"
  printf '%s  %-6s %-34s HTTP %-3s (expect %s)\n' "$mark" "$method" "$path" "$status" "$expect"
  printf '      %s\n' "$(printf '%s' "$payload" | cut -c1-160)"
}

json_id() {
  printf '%s' "$1" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const j=JSON.parse(d);const x=Array.isArray(j)?j[0]:(j.data||j);console.log(x&&x.id?x.id:'')}catch(e){console.log('')}})"
}

echo ""
echo "--- HEALTH ---"
run GET "/" "" 200

echo ""
echo "--- DRINKS ---"
run GET  "/api/drinks" "" 200
run POST "/api/drinks" '{"amount":250}' 201
DRINK_ID_1="$(json_id "$LAST_BODY")"
run POST "/api/drinks" '{"amount":500,"time":"2026-10-21T08:00:00.000Z"}' 201
DRINK_ID_2="$(json_id "$LAST_BODY")"
run POST "/api/drinks" '{"amount":-5}' 400
run POST "/api/drinks" '{"amount":250,"time":"ngaco"}' 400
run GET  "/api/drinks" "" 200

echo ""
echo "--- NOTES ---"
run GET "/api/notes" "" 200
run GET "/api/notes?goal=3000" "" 200

echo ""
echo "--- REMINDERS ---"
run GET  "/api/reminders" "" 200
run POST "/api/reminders" '{"time":"10:00","type":"custom"}' 201
REMINDER_ID="$(json_id "$LAST_BODY")"
run POST "/api/reminders" '{"time":"25:99"}' 400
run POST "/api/reminders" '{"time":"10:00","type":"bogus"}' 400
run PUT  "/api/reminders/1" '{"time":"12:00"}' 404
run DELETE "/api/reminders/999999" "" 404
run GET  "/api/reminders/due" "" 200
run GET  "/api/reminders/history" "" 200

echo ""
echo "--- AUTO REMINDER ---"
run GET "/api/reminders/auto" "" 200
run PUT "/api/reminders/auto" '{"enabled":true,"startTime":"07:00","endTime":"22:00","intervalMinutes":60}' 200
run PUT "/api/reminders/auto" '{"startTime":"22:00","endTime":"07:00"}' 400
run PUT "/api/reminders/auto" '{"intervalMinutes":5}' 400
run POST "/api/reminders/reset/0" "" 200

echo ""
echo "--- WEB PUSH ---"
run GET  "/api/push/vapid-public-key" "" 200
run POST "/api/push/subscribe" '{"subscription":{"endpoint":"https://contoh.com/p","keys":{"p256dh":"BEl62iUYgUivxIkv69yViEuiBIaI8sgAz2kdG0k9eq8k3kQ","auth":"aBcD1eF2gH3iJ4kL5mN6oP7qR8sT9uV0"}}}' 200
run POST "/api/push/subscribe" '{"subscription":{"endpoint":"https://contoh.com/p"}}' 400

echo ""
echo "--- AUTH MODES ---"
check_mode "tanpa token" "${BASE_URL}/api/drinks"
check_mode "Bearer <valid>" "${BASE_URL}/api/drinks" -H "Authorization: Bearer ${TOKEN}"
check_mode "?token=<valid>" "${BASE_URL}/api/drinks?token=${TOKEN}"
check_mode "token ngaco" "${BASE_URL}/api/drinks" -H "Authorization: Bearer ngaco"
check_mode "endpoint gak ada" "${BASE_URL}/api/tidak-ada" -H "Authorization: Bearer ${TOKEN}"

echo ""
echo "--- CLEANUP ---"
for id in "$DRINK_ID_1" "$DRINK_ID_2"; do
  [ -z "$id" ] && continue
  printf 'CLEAN drink    %-8s ' "$id"
  curl -s -o /dev/null -w "HTTP %{http_code}\n" -X DELETE "${BASE_URL}/api/drinks/${id}" -H "Authorization: Bearer ${TOKEN}"
done
if [ -n "$REMINDER_ID" ]; then
  printf 'CLEAN reminder %-8s ' "$REMINDER_ID"
  curl -s -o /dev/null -w "HTTP %{http_code}\n" -X DELETE "${BASE_URL}/api/reminders/${REMINDER_ID}" -H "Authorization: Bearer ${TOKEN}"
fi
rm -f "$TMP_BODY"

echo ""
echo "Selesai."
