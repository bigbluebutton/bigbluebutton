#!/usr/bin/env bash
# Interface tests for docker/tests/compose/assert-compose.sh. Protected: written
# before the implementation; the script must pass them unchanged.
#
# Contract of assert-compose.sh:
#   assert-compose.sh [--compose FILE] [--features LIST|--all-feature-combinations]
#     FILE      compose file (default: docker-compose.yml at the repository root)
#     LIST      comma-separated BBB_FEATURES value to check (default: every combination of the
#               features named in the file's `profiles:` keys, plus the empty set)
#   The compose CLI is taken from $COMPOSE_CMD (default `docker compose`); only `config` is used,
#   nothing is started. Each combination is checked on the resolved config.
#   Prints one line per finding: `VIOLATION <rule>: <service or network>: <detail>`.
#   Rules:
#     config-invalid    `config` fails for a feature combination
#     image-tag         image without an explicit tag, or tag `latest`
#     healthcheck       service without a healthcheck (run-only services exempt)
#     restart           restart policy other than `unless-stopped` (run-only services exempt)
#     published-port    a published port not in the allowlist: 80/tcp, 443/tcp, 3478/udp,
#                       3478/tcp, 7882/udp
#     depends-on        a depends_on entry without condition service_healthy or
#                       service_completed_successfully
#     notes-network     network `notes` not internal; `shared-notes` attached to another network;
#                       a service other than nginx, recording, redis, postgres, bbb-web,
#                       shared-notes attached to `notes`
#     resource-limits   service `recording` without deploy.resources.limits cpus and memory
#   A service is run-only if it has the label org.bigbluebutton.run-only=true.
#   Exit 0 if no finding, 1 if any finding, 2 on usage error.
#
# Usage: docker/tests/compose/test-assert-compose.sh   (needs bash, yq v4, a compose CLI)

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="${ASSERT_COMPOSE:-$HERE/assert-compose.sh}"
VALID="$HERE/fixtures/valid.yml"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

PASSED=0
FAILED=0
pass() { PASSED=$((PASSED + 1)); echo "ok   $1"; }
fail() { FAILED=$((FAILED + 1)); echo "FAIL $1${2:+: $2}"; }

[ -x "$SCRIPT" ] || { echo "script not found or not executable: $SCRIPT"; exit 1; }

run() { # compose-file [extra args]
    set +e
    "$SCRIPT" --compose "$@" >"$WORK/out" 2>&1
    RC=$?
    set -e
    OUT="$(cat "$WORK/out")"
}
variant() { # name yq-expression -> path of a modified copy of the valid fixture
    yq "$2" "$VALID" >"$WORK/$1.yml"
    printf '%s' "$WORK/$1.yml"
}
expect_rc() { if [ "$RC" -eq "$2" ]; then pass "$1"; else fail "$1" "exit $RC, expected $2; output: $OUT"; fi; }
expect_rule() { # name rule subject
    if grep -qE "^VIOLATION $2: $3:" "$WORK/out"; then pass "$1"; else fail "$1" "no 'VIOLATION $2: $3:' in: $OUT"; fi
}

# --- usage and the valid file -----------------------------------------------------------------
OUT=""
set +e; "$SCRIPT" --no-such-option >/dev/null 2>&1; RC=$?; set -e
expect_rc "usage: unknown option exits 2" 2

run "$VALID"
expect_rc "valid fixture: exit 0 (all feature combinations)" 0
if [ -z "$OUT" ] || ! grep -q '^VIOLATION' "$WORK/out"; then pass "valid fixture: no findings"; else fail "valid fixture: no findings" "$OUT"; fi

run "$VALID" --features recording,webhooks
expect_rc "valid fixture: explicit feature list" 0

# --- image tags -------------------------------------------------------------------------------
run "$(variant latest '.services.nginx.image = "example.org/bbb-nginx:latest"')"
expect_rc "latest tag: exit 1" 1
expect_rule "latest tag: reported" image-tag nginx
run "$(variant notag '.services.nginx.image = "example.org/bbb-nginx"')"
expect_rule "missing tag: reported" image-tag nginx
run "$(variant digest '.services.nginx.image = "example.org/bbb-nginx@sha256:0000000000000000000000000000000000000000000000000000000000000000"')"
expect_rc "digest instead of tag is accepted" 0

# --- healthcheck and restart -----------------------------------------------------------------
run "$(variant nohc 'del(.services."bbb-web".healthcheck)')"
expect_rule "missing healthcheck: reported" healthcheck bbb-web
run "$(variant hcdisabled '.services."bbb-web".healthcheck = {"disable": true}')"
expect_rule "disabled healthcheck: reported" healthcheck bbb-web
run "$(variant restart '.services.redis.restart = "always"')"
expect_rule "restart other than unless-stopped: reported" restart redis
run "$(variant norestart 'del(.services.redis.restart)')"
expect_rule "missing restart: reported" restart redis
run "$(variant runonly 'del(.services.setup.healthcheck)')"
expect_rc "run-only service needs no healthcheck/restart" 0

# --- published ports --------------------------------------------------------------------------
run "$(variant port7881 '.services.livekit.ports += ["7881:7881/tcp"]')"
expect_rc "ICE-TCP 7881 published: exit 1" 1
expect_rule "ICE-TCP 7881 published: reported" published-port livekit
run "$(variant range '.services.livekit.ports += ["16384-16390:16384-16390/udp"]')"
expect_rule "UDP range published: reported" published-port livekit
run "$(variant relay '.services.coturn.ports += ["49160-49199:49160-49199/udp"]')"
expect_rule "coturn relay range published: reported" published-port coturn
run "$(variant redisport '.services.redis.ports = ["6379:6379"]')"
expect_rule "internal service port published: reported" published-port redis
run "$(variant wrongproto '.services.haproxy.ports = ["443:443/udp"]')"
expect_rule "allowed port with wrong protocol: reported" published-port haproxy
run "$(variant inprofile '.services.webhooks.ports = ["3005:3005"]')"
expect_rule "port in a profile service: reported" published-port webhooks

# --- depends_on --------------------------------------------------------------------------------
run "$(variant dep '.services.nginx.depends_on = ["bbb-web"]')"
expect_rule "depends_on without condition: reported" depends-on nginx
run "$(variant depstarted '.services.nginx.depends_on."bbb-web".condition = "service_started"')"
expect_rule "depends_on service_started: reported" depends-on nginx

# --- notes network ---------------------------------------------------------------------------
run "$(variant notint '.networks.notes = {}')"
expect_rule "notes network not internal: reported" notes-network notes
run "$(variant notesextra '.services."shared-notes".networks += ["bbb"]')"
expect_rule "shared-notes on another network: reported" notes-network shared-notes
run "$(variant notesmember '.services.livekit.networks += ["notes"]')"
expect_rule "unexpected member of notes: reported" notes-network livekit

# --- resource limits ---------------------------------------------------------------------------
run "$(variant nolimit 'del(.services.recording.deploy)')"
expect_rule "recording without limits: reported" resource-limits recording
run "$(variant nomem 'del(.services.recording.deploy.resources.limits.memory)')"
expect_rule "recording without memory limit: reported" resource-limits recording
run "$(variant nolimitoff 'del(.services.recording.deploy)')" --features ""
expect_rc "recording not active (empty features): no limit finding" 0

# --- config validity per feature combination ---------------------------------------------------
run "$(variant brokendep '.services.webhooks.depends_on = {"recording": {"condition": "service_healthy"}}')"
expect_rc "dependency on a profile service missing in some combinations: exit 1" 1
expect_rule "config invalid for a combination: reported" config-invalid webhooks

# --- several findings ---------------------------------------------------------------------------
run "$(variant multi '.services.nginx.image = "example.org/bbb-nginx:latest" | del(.services.redis.healthcheck) | .services.livekit.ports += ["7881:7881/tcp"]')"
n="$(grep -c '^VIOLATION ' "$WORK/out" || true)"
if [ "$n" -ge 3 ]; then pass "multiple findings reported ($n)"; else fail "multiple findings reported" "$n: $OUT"; fi

echo
echo "$PASSED passed, $FAILED failed"
[ "$FAILED" -eq 0 ]
