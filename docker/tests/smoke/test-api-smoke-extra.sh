#!/usr/bin/env bash
# Additional tests for docker/tests/smoke/api-smoke.sh, beyond the protected interface tests
# in test-api-smoke.sh: secret handling in child processes, URL encoding, random meeting IDs,
# cleanup after a failed step, HTTP errors and option validation.
#
# curl and sha1sum are replaced by logging shims (first in PATH) that record each call's
# arguments and environment, then exec the real tool.
#
# Usage: docker/tests/smoke/test-api-smoke-extra.sh   (needs bash, curl, python3)

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="${API_SMOKE:-$HERE/api-smoke.sh}"
MOCK="$HERE/mock/bbb_api_mock.py"
WORK="$(mktemp -d)"
MOCK_PID=""
cleanup() { [ -n "$MOCK_PID" ] && kill "$MOCK_PID" 2>/dev/null || true; rm -rf "$WORK"; }
trap cleanup EXIT

SECRET=fixturebbbsharedsecretnotreal0000000000000000000
PASSED=0
FAILED=0
pass() { PASSED=$((PASSED + 1)); echo "ok   $1"; }
fail() { FAILED=$((FAILED + 1)); echo "FAIL $1${2:+: $2}"; }

[ -x "$SCRIPT" ] || { echo "script not found or not executable: $SCRIPT"; exit 1; }

# Logging shims.
mkdir -p "$WORK/shim"
for tool in curl sha1sum; do
    real="$(command -v "$tool")"
    cat >"$WORK/shim/$tool" <<EOF
#!/usr/bin/env bash
{ printf 'ARGV %s:' "$tool"; printf ' %s' "\$@"; echo; env | sed 's/^/ENV $tool: /'; } >>"$WORK/calls.log"
exec "$real" "\$@"
EOF
    chmod +x "$WORK/shim/$tool"
done
SHIM_PATH="$WORK/shim:$PATH"

free_port() { python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1",0)); print(s.getsockname()[1]); s.close()'; }

start_mock() { # [fault]
    [ -n "$MOCK_PID" ] && { kill "$MOCK_PID" 2>/dev/null || true; wait "$MOCK_PID" 2>/dev/null || true; }
    PORT="$(free_port)"
    MOCK_SECRET="$SECRET" MOCK_FAULT="${1:-}" python3 "$MOCK" "$PORT" >"$WORK/mock.out" 2>"$WORK/mock.err" &
    MOCK_PID=$!
    for _ in $(seq 50); do grep -q READY "$WORK/mock.out" 2>/dev/null && break; sleep 0.1; done
    grep -q READY "$WORK/mock.out" || { echo "mock did not start"; cat "$WORK/mock.err"; exit 1; }
    API="http://127.0.0.1:$PORT/bigbluebutton/api"
}

run() { # args...  (secret from the environment, shims first in PATH, fresh call log)
    : >"$WORK/calls.log"
    set +e
    env -i PATH="$SHIM_PATH" HOME="$WORK" BBB_SHARED_SECRET="$SECRET" "$SCRIPT" "$@" >"$WORK/out" 2>&1
    RC=$?
    set -e
    OUT="$(cat "$WORK/out")"
}
expect_rc() { if [ "$RC" -eq "$2" ]; then pass "$1"; else fail "$1" "exit $RC, expected $2; output: $OUT"; fi; }
expect_line() { if grep -qE "$2" "$WORK/out"; then pass "$1"; else fail "$1" "no line /$2/ in: $OUT"; fi; }
calls() { grep "^ARGV curl:" "$WORK/calls.log" | grep -oE "/bigbluebutton/api/[A-Za-z]+\?[^ ]*" || true; }

# --- secret handling ---------------------------------------------------------------------------
start_mock
run --api-url "$API"
expect_rc "happy path with shims: exit 0" 0
if grep -q '^ARGV curl:' "$WORK/calls.log" && grep -q '^ARGV sha1sum:' "$WORK/calls.log"; then
    pass "shims recorded curl and sha1sum calls"
else
    fail "shims recorded curl and sha1sum calls" "$(cat "$WORK/calls.log")"
fi
if grep -q "$SECRET" "$WORK/calls.log"; then
    fail "secret not in argv or environment of curl/sha1sum" "$(grep -c "$SECRET" "$WORK/calls.log") log lines contain it"
else
    pass "secret not in argv or environment of curl/sha1sum"
fi
if grep -q '^ENV [a-z0-9]*: BBB_SHARED_SECRET=' "$WORK/calls.log"; then
    fail "BBB_SHARED_SECRET not exported to children"
else
    pass "BBB_SHARED_SECRET not exported to children"
fi
if grep -q "$SECRET" "$WORK/mock.err"; then fail "secret not in request URLs (mock log)"; else pass "secret not in request URLs (mock log)"; fi

# --- requests ---------------------------------------------------------------------------------
create_url="$(calls | grep '/create?' | head -n 1)"
case "$create_url" in
    *"name=API%20smoke%20test"*) pass "create: name is percent-encoded" ;;
    *) fail "create: name is percent-encoded" "$create_url" ;;
esac
join_url="$(calls | grep '/join?' | head -n 1)"
case "$join_url" in
    *"fullName=Smoke%20Test"*"role=MODERATOR"*"redirect=false"*) pass "join: fullName, role, redirect=false" ;;
    *) fail "join: fullName, role, redirect=false" "$join_url" ;;
esac
if calls | grep -qE 'checksum=[0-9a-f]{40}$'; then pass "checksum is sha1 hex, last parameter"; else fail "checksum is sha1 hex, last parameter" "$(calls)"; fi

id1="$(calls | grep '/create?' | grep -oE 'meetingID=[^&]+' | head -n 1)"
run --api-url "$API"
id2="$(calls | grep '/create?' | grep -oE 'meetingID=[^&]+' | head -n 1)"
if [ -n "$id1" ] && [ -n "$id2" ] && [ "$id1" != "$id2" ]; then
    pass "meeting IDs differ between runs ($id1, $id2)"
else
    fail "meeting IDs differ between runs" "'$id1' '$id2'"
fi

# --- cleanup after a failed step ---------------------------------------------------------------
start_mock not-listed
run --api-url "$API"
expect_line "not listed: getMeetings fails" "^STEP getMeetings: FAIL .*not listed"
if calls | tail -n 1 | grep -q '/end?'; then pass "not listed: meeting ended as cleanup"; else fail "not listed: meeting ended as cleanup" "$(calls)"; fi
if grep -q '^STEP end' "$WORK/out"; then fail "not listed: cleanup prints no STEP line"; else pass "not listed: cleanup prints no STEP line"; fi

start_mock
run --api-url "http://127.0.0.1:$PORT/wrong/path"
expect_rc "HTTP 404: exit 1" 1
expect_line "HTTP 404: reported" "^STEP create: FAIL HTTP 404$"
if calls | grep -q '/end?'; then fail "HTTP 404: no cleanup without a created meeting"; else pass "HTTP 404: no cleanup without a created meeting"; fi

# --- options ----------------------------------------------------------------------------------
run --help
expect_rc "--help exits 0" 0
expect_line "--help prints usage" "^Usage: "
for bad in "--timeout 0" "--timeout abc" "--timeout" "--api-url"; do
    # shellcheck disable=SC2086 # split on purpose: option and value
    run $bad
    expect_rc "invalid '$bad' exits 2" 2
done
run --api-url "ftp://127.0.0.1/bigbluebutton/api"
expect_rc "non-http --api-url exits 2" 2
run --api-url="$API" --timeout=5
expect_rc "--opt=value forms accepted" 0
run --api-url "$API" --insecure
expect_rc "--insecure accepted (plain http)" 0
if grep '^ARGV curl:' "$WORK/calls.log" | grep -q -- ' --insecure '; then pass "--insecure passed to curl"; else fail "--insecure passed to curl"; fi
if grep -q "$SECRET" "$WORK/out"; then fail "secret never printed (last run)"; else pass "secret never printed (last run)"; fi

echo
echo "$PASSED passed, $FAILED failed"
[ "$FAILED" -eq 0 ]
