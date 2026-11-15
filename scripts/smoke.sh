#!/bin/sh
# Smoke test for the local stack. Run it on the host after `docker compose up`, so it
# checks the real 127.0.0.1 port bindings. Needs only sh and curl (Git Bash on Windows).
#   sh scripts/smoke.sh        (or: make smoke)

BASE=${SMOKE_BASE:-http://localhost:8080}
S3=${SMOKE_S3:-http://localhost:9000}
S3_CONSOLE=${SMOKE_S3_CONSOLE:-http://localhost:9001}
LIVEKIT=${SMOKE_LIVEKIT:-http://localhost:7880}
BUCKET=${S3_BUCKET:-officetalk-dev}

failures=0

# check <name> <expected> <actual>
check() {
	if [ "$2" = "$3" ]; then
		echo "PASS  $1"
	else
		echo "FAIL  $1 (expected '$2', got '$3')"
		failures=$((failures + 1))
	fi
}

# status <curl args...>: print only the HTTP status code (000 when unreachable)
status() {
	curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$@"
}

# contains <name> <needle> <curl args...>
contains() {
	name=$1
	needle=$2
	shift 2
	if curl -s --max-time 5 "$@" | grep -q "$needle"; then
		echo "PASS  $name"
	else
		echo "FAIL  $name (response has no '$needle')"
		failures=$((failures + 1))
	fi
}

check "caddy: /healthz" 200 "$(status "$BASE/healthz")"
contains "caddy -> vite: / serves the app" '<div id="root">' "$BASE/"
contains "caddy -> backend: /api/health" '"status":"ok"' "$BASE/api/health"
check "caddy -> backend: /api/openapi.json" 200 "$(status "$BASE/api/openapi.json")"

# Vite's HMR client opens a websocket with the vite-hmr subprotocol. A 101 means the
# upgrade made it through Caddy to Vite. curl exits non-zero on timeout after the
# switch, which is expected, so only the status code matters.
hmr=$(curl -s -o /dev/null -w '%{http_code}' --max-time 2 --http1.1 \
	-H 'Connection: Upgrade' -H 'Upgrade: websocket' \
	-H 'Sec-WebSocket-Version: 13' -H 'Sec-WebSocket-Key: c21va2UtdGVzdC1rZXkxMg==' \
	-H 'Sec-WebSocket-Protocol: vite-hmr' "$BASE/")
check "caddy -> vite: HMR websocket upgrade" 101 "$hmr"

check "s3: /health" 200 "$(status "$S3/health")"
check "s3: console" 200 "$(status "$S3_CONSOLE/rustfs/console/index.html")"
# A signed HEAD gives 200 if s3-init created the bucket and 404 if not. Anonymous
# requests get 403 whether or not the bucket exists, which proves it is private.
check "s3: bucket '$BUCKET' exists" 200 "$(status -I --aws-sigv4 'aws:amz:eu-west-2:s3' \
	--user "${S3_ACCESS_KEY:-officetalk}:${S3_SECRET_KEY:-officetalk-dev-secret}" "$S3/$BUCKET")"
check "s3: bucket '$BUCKET' is private" 403 "$(status -I "$S3/$BUCKET")"

contains "livekit: / answers OK" 'OK' "$LIVEKIT/"

if [ "$failures" -gt 0 ]; then
	echo "$failures check(s) failed"
	exit 1
fi
echo "All checks passed"
