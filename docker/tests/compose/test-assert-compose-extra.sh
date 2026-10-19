#!/usr/bin/env bash
# Additional tests for docker/tests/compose/assert-compose.sh, beyond the interface tests in
# test-assert-compose.sh: usage errors, edge cases of each rule, output format.
#
# Usage: docker/tests/compose/test-assert-compose-extra.sh   (needs bash, yq v4, a compose CLI)

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="${ASSERT_COMPOSE:-$HERE/assert-compose.sh}"
VALID="$HERE/fixtures/valid.yml"
EXTRA="$HERE/fixtures/extra"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

PASSED=0
FAILED=0
pass() { PASSED=$((PASSED + 1)); echo "ok   $1"; }
fail() { FAILED=$((FAILED + 1)); echo "FAIL $1${2:+: $2}"; }

[ -x "$SCRIPT" ] || { echo "script not found or not executable: $SCRIPT"; exit 1; }

run() { # compose-file [extra args]; stdout -> $WORK/out, stderr -> $WORK/err
    set +e
    "$SCRIPT" --compose "$@" >"$WORK/out" 2>"$WORK/err"
    RC=$?
    set -e
    OUT="$(cat "$WORK/out" "$WORK/err")"
}
run_raw() { # args... (no --compose)
    set +e
    "$SCRIPT" "$@" >"$WORK/out" 2>"$WORK/err"
    RC=$?
    set -e
    OUT="$(cat "$WORK/out" "$WORK/err")"
}
variant() { # name yq-expression -> path of a modified copy of the valid fixture
    yq "$2" "$VALID" >"$WORK/$1.yml"
    printf '%s' "$WORK/$1.yml"
}
expect_rc() { if [ "$RC" -eq "$2" ]; then pass "$1"; else fail "$1" "exit $RC, expected $2; output: $OUT"; fi; }
expect_rule() { # name rule subject [detail-ERE]
    if grep -qE "^VIOLATION $2: $3: ${4:-}" "$WORK/out"; then pass "$1"; else fail "$1" "no 'VIOLATION $2: $3: ${4:-}' in: $OUT"; fi
}
expect_no_rule() { # name rule [subject]
    if grep -qE "^VIOLATION $2: ${3:-}" "$WORK/out"; then fail "$1" "unexpected finding in: $OUT"; else pass "$1"; fi
}
expect_err() { # name fixed-string expected on stderr
    if grep -qF "$2" "$WORK/err"; then pass "$1"; else fail "$1" "no '$2' in: $OUT"; fi
}
expect_count() { # name ERE count
    local n
    n="$(grep -cE "$2" "$WORK/out" || true)"
    if [ "$n" -eq "$3" ]; then pass "$1"; else fail "$1" "$n lines match '$2', expected $3: $OUT"; fi
}

# --- usage -------------------------------------------------------------------------------------
run_raw --compose
expect_rc "usage: --compose without value exits 2" 2
run_raw --compose "$VALID" --features
expect_rc "usage: --features without value exits 2" 2
run_raw --compose "$VALID" extra-argument
expect_rc "usage: positional argument exits 2" 2
run_raw --compose "$WORK/does-not-exist.yml"
expect_rc "usage: missing compose file exits 2" 2
run_raw --compose "$VALID" --features 'recording;webhooks'
expect_rc "usage: invalid feature name exits 2" 2
set +e
COMPOSE_CMD="no-such-compose-cli" "$SCRIPT" --compose "$VALID" >"$WORK/out" 2>&1
RC=$?
set -e
OUT="$(cat "$WORK/out")"
expect_rc "usage: compose CLI not found exits 2" 2

# --- feature combinations ----------------------------------------------------------------------
run "$VALID"
expect_err "valid fixture: 3 profiles -> 8 combinations" "8 feature combination(s) checked, 0 finding(s)"
if [ ! -s "$WORK/out" ]; then pass "valid fixture: stdout empty"; else fail "valid fixture: stdout empty" "$OUT"; fi
run "$VALID" --features ""
expect_rc "explicit empty feature list" 0
expect_err "explicit list: one combination" "1 feature combination(s) checked"
run "$VALID" --features " recording, ,recording "
expect_rc "feature list with spaces, empty and duplicate elements" 0
run "$VALID" --features "recording" --all-feature-combinations
expect_err "--all-feature-combinations after --features wins" "8 feature combination(s) checked"
run "$(variant manyprofiles '.services.webhooks.profiles = ["a","b","c","d","e","f","g","h","i","j"]')"
expect_rc "more than 10 profiles without --features exits 2" 2

# --- image tags ------------------------------------------------------------------------------
run "$(variant regport '.services.nginx.image = "registry.example.org:5000/bbb-nginx"')"
expect_rule "registry port is not a tag" image-tag nginx "image registry.example.org:5000/bbb-nginx has no explicit tag"
run "$(variant regporttag '.services.nginx.image = "registry.example.org:5000/bbb-nginx:1.0.0"')"
expect_rc "registry port with tag is accepted" 0
run "$(variant tagdigest '.services.nginx.image = "example.org/bbb-nginx:1.0.0@sha256:0000000000000000000000000000000000000000000000000000000000000000"')"
expect_rc "tag plus digest is accepted" 0
run "$(variant runonlylatest '.services.setup.image = "example.org/bbb-setup:latest"')" --features setup
expect_rule "run-only service: tag still checked" image-tag setup
run "$(variant noimage 'del(.services.nginx.image) | .services.nginx.build = {"context": "."}')"
expect_rule "build without image: reported" image-tag nginx "no image"
cp "$EXTRA/env-tag.yml" "$WORK/env-tag.yml"
run "$WORK/env-tag.yml" --features ""
expect_rule "interpolated default tag latest: reported" image-tag web "image example.org/bbb-web:latest"
set +e
BBB_TEST_WEB_TAG=1.2.3 "$SCRIPT" --compose "$WORK/env-tag.yml" --features "" >"$WORK/out" 2>"$WORK/err"
RC=$?
set -e
OUT="$(cat "$WORK/out" "$WORK/err")"
expect_rc "interpolated tag from the environment: checked on the resolved config" 0

# --- healthcheck and restart -------------------------------------------------------------------
run "$(variant hcnone '.services.redis.healthcheck.test = ["NONE"]')"
expect_rule "healthcheck test NONE: reported" healthcheck redis "healthcheck disabled"
run "$(variant runonlyfalse '.services.setup.labels."org.bigbluebutton.run-only" = "false"')" --features setup
expect_rule "run-only label false: not exempt" healthcheck setup
expect_rule "run-only label false: restart checked" restart setup

# --- published ports ---------------------------------------------------------------------------
run "$(variant hostnet 'del(.services.livekit.ports) | del(.services.livekit.networks) | .services.livekit.network_mode = "host"')"
expect_rule "network_mode host: reported" published-port livekit "network_mode host"
run "$(variant ephemeral '.services.redis.ports = ["6379"]')"
expect_rule "container port on an ephemeral host port: reported" published-port redis "publishes 6379/tcp on an ephemeral host port"
run "$(variant loopback '.services.nginx.ports += ["127.0.0.1:8080:80/tcp"]')"
expect_rule "port bound to loopback: reported" published-port nginx "publishes 8080/tcp"
run "$(variant othersvc '.services.livekit.ports += ["80:8080/tcp"]')"
expect_rule "allowed port on the wrong service: reported" published-port livekit "publishes 80/tcp"
run "$(variant remap '.services.haproxy.ports = ["443:8443/tcp"]')"
expect_rc "allowlist applies to the host port, not the container port" 0
run "$(variant bigrange '.services.coturn.ports += ["49160-49199:49160-49199/udp"]')"
expect_count "port range: one finding line" '^VIOLATION published-port: coturn: ' 1
expect_rule "port range: shown as a range" published-port coturn "publishes 49160-49199/udp,"

# --- depends_on --------------------------------------------------------------------------------
run "$(variant completed '.services.nginx.depends_on.setup = {"condition": "service_completed_successfully", "required": false}')"
expect_no_rule "service_completed_successfully: accepted" depends-on

# --- notes network -----------------------------------------------------------------------------
run "$(variant nonotes 'del(.networks.notes) | .services[].networks |= ((. // []) - ["notes"]) | .services."shared-notes".networks = ["bbb"]')"
expect_rule "notes network missing: reported" notes-network notes "network not defined"
run "$(variant notesdefault 'del(.services."shared-notes".networks)')"
expect_rule "shared-notes on the default network: reported" notes-network shared-notes "attached to other network\\(s\\): default"
run "$(variant notesmode 'del(.services."shared-notes".networks) | .services."shared-notes".network_mode = "none"')"
expect_rule "shared-notes with network_mode: reported" notes-network shared-notes "network_mode none"
run "$(variant sharens 'del(.services.livekit.networks) | .services.livekit.network_mode = "service:shared-notes"')"
expect_rule "service in shared-notes' namespace: reported" notes-network livekit "shares the network namespace"
run "$(variant notesrec '.services.webhooks.networks += ["notes"]')" --features webhooks
expect_rule "profile service on notes: reported" notes-network webhooks

# --- resource limits ---------------------------------------------------------------------------
run "$(variant nocpus 'del(.services.recording.deploy.resources.limits.cpus)')"
expect_rule "recording without cpus limit: reported" resource-limits recording "no deploy.resources.limits cpus$"
run "$(variant nolimitrec 'del(.services.recording.deploy)')" --features webhooks
expect_rc "recording not active (other feature): no limit finding" 0

# --- recorder volume ---------------------------------------------------------------------------
RECORDER="$EXTRA/recorder.yml"
recorder_variant() { # name yq-expression -> path of a modified copy of the recorder fixture
    yq "$2" "$RECORDER" >"$WORK/$1.yml"
    printf '%s' "$WORK/$1.yml"
}
run "$RECORDER" --features ""
expect_rc "recorder writes recorder-raw, recording reads it, same user: accepted" 0
run "$(recorder_variant rawrwrec '.services.recording.volumes = ["recorder-raw:/var/lib/bbb-webrtc-recorder"]')" --features ""
expect_rc "recorder-raw writable for recording (deletes archived files): accepted" 0
run "$(recorder_variant rawrw '.services.recording.volumes = ["recorder-raw:/var/lib/bbb-webrtc-recorder:ro"] | .services."export-annotations" = (.services.recording | .volumes = ["recorder-raw:/var/lib/bbb-webrtc-recorder"])')" --features ""
expect_rule "recorder-raw writable for another service: reported" recorder-raw export-annotations "mounts recorder-raw writable"
run "$(recorder_variant rawro '.services."bbb-webrtc-recorder".volumes = ["recorder-raw:/var/lib/bbb-webrtc-recorder:ro"]')" --features ""
expect_rule "recorder with recorder-raw read-only: reported" recorder-raw bbb-webrtc-recorder "mounts recorder-raw read-only"
expect_rule "recorder with recorder-raw read-only: not writable" recorder-raw bbb-webrtc-recorder "does not mount recorder-raw writable"
run "$(recorder_variant rawnone 'del(.services."bbb-webrtc-recorder".volumes)')" --features ""
expect_rule "recorder without recorder-raw: reported" recorder-raw bbb-webrtc-recorder "does not mount recorder-raw writable"
run "$(recorder_variant rawpath '.services.recording.volumes = ["recorder-raw:/srv/raw:ro"]')" --features ""
expect_rule "recorder-raw at another path: reported" recorder-raw recording "mounts recorder-raw at /srv/raw"
run "$(recorder_variant rawuser '.services.recording.user = "1000:1000"')" --features ""
expect_rule "reader with another user: reported" recorder-raw recording 'runs as user "1000:1000", bbb-webrtc-recorder as "998:998"'
run "$(recorder_variant rawnouser 'del(.services.recording.user)')" --features ""
expect_rule "reader with the image's user: reported" recorder-raw recording 'runs as user "", '
run "$(recorder_variant rawnorec 'del(.services."bbb-webrtc-recorder") | .services.recording.user = "1000:1000"')" --features ""
expect_rc "no recorder (feature off): readers not compared" 0

# --- config-invalid ------------------------------------------------------------------------------
run "$(variant allinvalid '.services.nginx.depends_on.redis = {}')"
expect_count "invalid in every combination: one line" '^VIOLATION config-invalid: ' 1
expect_rule "invalid in every combination: subject and scope" config-invalid nginx ".*all 8 feature combinations"
run "$(variant someinvalid '.services.webhooks.depends_on = {"recording": {"condition": "service_healthy"}}')"
expect_rule "invalid in some combinations: lists them" config-invalid webhooks '.*BBB_FEATURES="webhooks"'

# --- output format and deduplication -------------------------------------------------------------
run "$(variant dedupe '.services.nginx.image = "example.org/bbb-nginx:latest"')"
expect_count "finding in all combinations reported once" '^VIOLATION image-tag: nginx: ' 1
run "$(variant format '.services.nginx.image = "x:latest" | del(.services.redis.restart) | .services.redis.ports = ["6379:6379"] | .networks.notes = {} | del(.services.recording.deploy) | .services.nginx.depends_on = ["redis"]')"
if [ -s "$WORK/out" ] && ! grep -vqE '^VIOLATION (config-invalid|image-tag|healthcheck|restart|published-port|depends-on|notes-network|resource-limits): [A-Za-z0-9._-]+: .+$' "$WORK/out"; then
    pass "every stdout line has the finding format"
else
    fail "every stdout line has the finding format" "$OUT"
fi
expect_count "six rules reported" '^VIOLATION ' 6

echo
echo "$PASSED passed, $FAILED failed"
[ "$FAILED" -eq 0 ]
