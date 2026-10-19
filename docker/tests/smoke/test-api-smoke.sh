#!/usr/bin/env bash
# Interface tests for docker/tests/smoke/api-smoke.sh. Protected: written before
# the implementation; the script must pass them unchanged.
#
# Contract of api-smoke.sh:
#   BBB_SHARED_SECRET=... api-smoke.sh --api-url URL [--insecure] [--timeout SECONDS]
#     URL   base of the API, e.g. https://bbb.example.com/bigbluebutton/api
#   The secret is read from the environment only (never an argument) and never printed.
#   Steps, in order: create (random meetingID) → join (redirect=false, expects a <url>) →
#   getMeetings (lists the meetingID) → end → isMeetingRunning (expects false, retried for up
#   to --timeout seconds, default 30).
#   Prints one line per step: `STEP <name>: OK` or `STEP <name>: FAIL <reason>`, then
#   `SMOKE PASS` or `SMOKE FAIL`. Stops at the first failing step. Exit 0 on PASS, 1 on FAIL,
#   2 on usage error (incl. missing BBB_SHARED_SECRET or --api-url).
#   Checksums: sha1 of (call + query string + secret), as bbb-web accepts it.
#
# Usage: docker/tests/smoke/test-api-smoke.sh   (needs bash, curl, python3)

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

free_port() { python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1",0)); print(s.getsockname()[1]); s.close()'; }

start_mock() { # [fault]
    [ -n "$MOCK_PID" ] && { kill "$MOCK_PID" 2>/dev/null || true; wait "$MOCK_PID" 2>/dev/null || true; }
    PORT="$(free_port)"
    MOCK_SECRET="$SECRET" MOCK_FAULT="${1:-}" python3 "$MOCK" "$PORT" >"$WORK/mock.out" 2>"$WORK/mock.err" &
    MOCK_PID=$!
    for _ in $(seq 50); do grep -q READY "$WORK/mock.out" 2>/dev/null && return 0; sleep 0.1; done
    echo "mock did not start"; cat "$WORK/mock.err"; exit 1
}

run() { # env-secret [extra args]
    local secret="$1"; shift
    set +e
    env -i PATH="$PATH" HOME="$WORK" ${secret:+BBB_SHARED_SECRET="$secret"} \
        "$SCRIPT" "$@" >"$WORK/out" 2>&1
    RC=$?
    set -e
    OUT="$(cat "$WORK/out")"
}
expect_rc() { if [ "$RC" -eq "$2" ]; then pass "$1"; else fail "$1" "exit $RC, expected $2; output: $OUT"; fi; }
expect_line() { if grep -qE "$2" "$WORK/out"; then pass "$1"; else fail "$1" "no line /$2/ in: $OUT"; fi; }
expect_no_secret() { case "$OUT$(cat "$WORK/mock.err" 2>/dev/null)" in *"$SECRET"*) fail "$1" "secret printed" ;; *) pass "$1" ;; esac; }

# --- usage ------------------------------------------------------------------------------------
start_mock
API="http://127.0.0.1:$PORT/bigbluebutton/api"
run "" --api-url "$API"
expect_rc "usage: missing BBB_SHARED_SECRET exits 2" 2
run "$SECRET"
expect_rc "usage: missing --api-url exits 2" 2
run "$SECRET" --api-url "$API" --no-such-option
expect_rc "usage: unknown option exits 2" 2

# --- happy path --------------------------------------------------------------------------------
run "$SECRET" --api-url "$API"
expect_rc "happy path: exit 0" 0
for step in create join getMeetings end isMeetingRunning; do
    expect_line "happy path: step $step OK" "^STEP $step: OK"
done
expect_line "happy path: SMOKE PASS" "^SMOKE PASS$"
expect_no_secret "happy path: secret never printed"
order="$( { grep -oE '^STEP [A-Za-z]+' "$WORK/out" || true; } | awk '{print $2}' | paste -sd, -)"
if [ "$order" = "create,join,getMeetings,end,isMeetingRunning" ]; then pass "happy path: step order"; else fail "happy path: step order" "$order"; fi

run "$SECRET" --api-url "$API/"
expect_rc "trailing slash in --api-url is accepted" 0

# --- wrong secret ------------------------------------------------------------------------------
run "wrongsecretwrongsecretwrongsecret00" --api-url "$API"
expect_rc "wrong secret: exit 1" 1
expect_line "wrong secret: create fails with checksum reason" "^STEP create: FAIL .*checksum"
expect_line "wrong secret: SMOKE FAIL" "^SMOKE FAIL$"
if grep -q '^STEP join' "$WORK/out"; then fail "wrong secret: stops at the first failure"; else pass "wrong secret: stops at the first failure"; fi

# --- faults -----------------------------------------------------------------------------------
start_mock create-failed
API="http://127.0.0.1:$PORT/bigbluebutton/api"
run "$SECRET" --api-url "$API"
expect_rc "create FAILED: exit 1" 1
expect_line "create FAILED: reported" "^STEP create: FAIL"

start_mock no-join-url
API="http://127.0.0.1:$PORT/bigbluebutton/api"
run "$SECRET" --api-url "$API"
expect_line "join without <url>: reported" "^STEP join: FAIL"

start_mock not-listed
API="http://127.0.0.1:$PORT/bigbluebutton/api"
run "$SECRET" --api-url "$API"
expect_line "meeting not in getMeetings: reported" "^STEP getMeetings: FAIL"

start_mock end-ignored
API="http://127.0.0.1:$PORT/bigbluebutton/api"
run "$SECRET" --api-url "$API" --timeout 2
expect_rc "meeting still running after end: exit 1" 1
expect_line "meeting still running after end: reported" "^STEP isMeetingRunning: FAIL"

# --- unreachable server ------------------------------------------------------------------------
kill "$MOCK_PID" 2>/dev/null || true; wait "$MOCK_PID" 2>/dev/null || true; MOCK_PID=""
run "$SECRET" --api-url "http://127.0.0.1:$PORT/bigbluebutton/api" --timeout 2
expect_rc "unreachable API: exit 1" 1
expect_line "unreachable API: create fails" "^STEP create: FAIL"

echo
echo "$PASSED passed, $FAILED failed"
[ "$FAILED" -eq 0 ]
