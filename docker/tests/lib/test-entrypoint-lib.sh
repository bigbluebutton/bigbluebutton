#!/usr/bin/env bash
# Interface tests for docker/lib/entrypoint-lib.sh, the helper shared by all image
# entrypoints. These tests define the helper's contract; the helper must pass them unchanged.
#
# Usage: docker/tests/lib/test-entrypoint-lib.sh
#   BBB_ENTRYPOINT_LIB=/path/to/entrypoint-lib.sh overrides the helper location.
#
# Requires bash, the project templating tool (envsubst or gomplate) and yq (mikefarah/yq v4).
# Exit code 0 if all tests pass, 1 otherwise.

# Snippets passed to run_lib are single-quoted on purpose: they are expanded by the child shell.
# shellcheck disable=SC2016

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB="${BBB_ENTRYPOINT_LIB:-$HERE/../../lib/entrypoint-lib.sh}"
FIXTURES="$HERE/fixtures"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

PASSED=0
FAILED=0

pass() { PASSED=$((PASSED + 1)); echo "ok   $1"; }
fail() { FAILED=$((FAILED + 1)); echo "FAIL $1${2:+: $2}"; }

# Run a snippet in a clean bash that sources the helper. Captures stdout, stderr, exit code.
run_lib() {
    local snippet="$1"
    set +e
    env -i PATH="$PATH" HOME="$WORK" TMPDIR="$WORK" "${@:2}" \
        bash -c "set -euo pipefail; source '$LIB'; $snippet" \
        >"$WORK/out" 2>"$WORK/err"
    RC=$?
    set -e
    OUT="$(cat "$WORK/out")"
    ERR="$(cat "$WORK/err")"
}

expect_rc() { # name expected
    if [ "$RC" -eq "$2" ]; then pass "$1"; else fail "$1" "exit $RC, expected $2; stderr: $ERR"; fi
}

expect_err_contains() { # name text
    case "$ERR" in *"$2"*) pass "$1" ;; *) fail "$1" "stderr does not contain '$2': $ERR" ;; esac
}

expect_out() { # name expected-stdout
    if [ "$OUT" = "$2" ]; then pass "$1"; else fail "$1" "got '$OUT'"; fi
}

expect_not_contains() { # name haystack needle
    case "$2" in *"$3"*) fail "$1" "output contains '$3'" ;; *) pass "$1" ;; esac
}

[ -r "$LIB" ] || { echo "helper not found: $LIB"; exit 1; }

# --- bbb_require -------------------------------------------------------------------------

run_lib 'bbb_require BBB_DOMAIN'
expect_rc "require: unset variable fails" 1
expect_err_contains "require: message names the variable" "BBB_DOMAIN"

run_lib 'bbb_require BBB_DOMAIN' BBB_DOMAIN=
expect_rc "require: empty variable fails" 1

run_lib 'bbb_require BBB_DOMAIN BBB_PUBLIC_IPV4' BBB_DOMAIN=bbb.example.com
expect_rc "require: second missing variable fails" 1
expect_err_contains "require: names the missing one" "BBB_PUBLIC_IPV4"

run_lib 'bbb_require BBB_DOMAIN BBB_PUBLIC_IPV4' BBB_DOMAIN=bbb.example.com BBB_PUBLIC_IPV4=203.0.113.10
expect_rc "require: all set passes" 0

# --- bbb_require_secret ------------------------------------------------------------------

SECRET=fixturebbbsharedsecretnotreal0000000000000000000

run_lib 'bbb_require_secret BBB_SHARED_SECRET'
expect_rc "secret: unset fails" 1
expect_err_contains "secret: message names the variable" "BBB_SHARED_SECRET"

run_lib 'bbb_require_secret BBB_SHARED_SECRET' BBB_SHARED_SECRET="$SECRET"
expect_rc "secret: real-looking value passes" 0
expect_not_contains "secret: value not printed on success" "$OUT$ERR" "$SECRET"

# Known upstream placeholder values must be rejected without echoing them.
for placeholder in changeme secret devkey LIVEKIT_KEY LIVEKIT_SECRET ClueCon; do
    run_lib 'bbb_require_secret LIVEKIT_API_SECRET' LIVEKIT_API_SECRET="$placeholder"
    expect_rc "secret: placeholder '$placeholder' rejected" 1
    expect_err_contains "secret: placeholder message names the variable ($placeholder)" "LIVEKIT_API_SECRET"
done

run_lib 'bbb_require_secret LIVEKIT_API_SECRET' LIVEKIT_API_SECRET=changeme
expect_not_contains "secret: rejected value not echoed" "$OUT$ERR" "changeme"

# A failure on one variable must not leak the value of another secret.
run_lib 'bbb_require_secret BBB_SHARED_SECRET TURN_SECRET' BBB_SHARED_SECRET="$SECRET"
expect_rc "secret: second missing secret fails" 1
expect_not_contains "secret: other secret value not leaked" "$OUT$ERR" "$SECRET"

# --- bbb_default -------------------------------------------------------------------------

run_lib 'bbb_default RECORDING_RETENTION_DAYS 14; printf %s "$RECORDING_RETENTION_DAYS"'
expect_rc "default: unset gets default" 0
expect_out "default: value applied" "14"

run_lib 'bbb_default RECORDING_RETENTION_DAYS 14; printf %s "$RECORDING_RETENTION_DAYS"' RECORDING_RETENTION_DAYS=
expect_out "default: empty gets default" "14"

run_lib 'bbb_default RECORDING_RETENTION_DAYS 14; printf %s "$RECORDING_RETENTION_DAYS"' RECORDING_RETENTION_DAYS=0
expect_out "default: explicit value kept" "0"

run_lib 'bbb_default RECORDING_RETENTION_DAYS 14; bash -c "printf %s \"\$RECORDING_RETENTION_DAYS\""'
expect_out "default: exported to child processes" "14"

# --- bbb_feature_enabled -----------------------------------------------------------------

run_lib 'bbb_feature_enabled recording' BBB_FEATURES=recording,greenlight
expect_rc "feature: listed feature enabled" 0
run_lib 'bbb_feature_enabled greenlight' BBB_FEATURES=recording,greenlight
expect_rc "feature: last list element enabled" 0
run_lib 'bbb_feature_enabled webhooks' BBB_FEATURES=recording,greenlight
expect_rc "feature: unlisted feature disabled" 1
run_lib 'bbb_feature_enabled record' BBB_FEATURES=recording
expect_rc "feature: no prefix match" 1
run_lib 'bbb_feature_enabled recording' BBB_FEATURES=
expect_rc "feature: empty list disables" 1
run_lib 'bbb_feature_enabled recording'
expect_rc "feature: unset list disables" 1

# --- bbb_init / bbb_path -----------------------------------------------------------------

run_lib 'bbb_init; bbb_path /etc/bigbluebutton/bbb-web.properties'
expect_rc "init: normal mode" 0
expect_out "path: normal mode unchanged" "/etc/bigbluebutton/bbb-web.properties"

run_lib "bbb_init --render-only '$WORK/r1'; bbb_path /etc/bigbluebutton/bbb-web.properties"
expect_rc "init: render-only mode" 0
expect_out "path: render-only prefixes dir" "$WORK/r1/etc/bigbluebutton/bbb-web.properties"

run_lib 'bbb_init --render-only'
expect_rc "init: --render-only without dir fails" 1

# --- bbb_render --------------------------------------------------------------------------

run_lib 'printf %s "$BBB_TEMPLATE_TOOL"'
TOOL="$OUT"
case "$TOOL" in
    envsubst|gomplate) pass "render: BBB_TEMPLATE_TOOL is set ($TOOL)" ;;
    *) fail "render: BBB_TEMPLATE_TOOL is set" "got '$TOOL'"; TOOL=envsubst ;;
esac
TPL="$FIXTURES/$TOOL"

run_lib "bbb_render '$TPL/basic.tmpl' '$WORK/render/a/out.conf'" BBB_DOMAIN=bbb.example.com BBB_PUBLIC_IPV4=203.0.113.10
expect_rc "render: renders" 0
if cmp -s "$WORK/render/a/out.conf" "$FIXTURES/basic.expected"; then pass "render: output matches expected"
else fail "render: output matches expected" "$(diff "$FIXTURES/basic.expected" "$WORK/render/a/out.conf" 2>&1 | head -5)"; fi

run_lib "bbb_render '$TPL/basic.tmpl' '$WORK/render/b/out.conf'" BBB_DOMAIN=bbb.example.com BBB_PUBLIC_IPV4=203.0.113.10
if cmp -s "$WORK/render/a/out.conf" "$WORK/render/b/out.conf"; then pass "render: deterministic"
else fail "render: deterministic"; fi

run_lib "bbb_render '$TPL/missing.tmpl' '$WORK/render/c/out.conf'" BBB_DOMAIN=bbb.example.com
expect_rc "render: undefined variable fails" 1
expect_err_contains "render: names the undefined variable" "BBB_NOT_SET"

run_lib "bbb_render '$TPL/basic.tmpl' '$WORK/render/d/out.conf'" BBB_DOMAIN=bbb.example.com BBB_PUBLIC_IPV4=203.0.113.10 BBB_SHARED_SECRET="$SECRET"
expect_not_contains "render: does not log values" "$OUT$ERR" "$SECRET"

# --- bbb_merge_yaml ----------------------------------------------------------------------

Y="$FIXTURES/yaml"
run_lib "bbb_merge_yaml '$Y/base.yml' '$Y/override.yml' '$WORK/merge/a.yml'"
expect_rc "merge: merges" 0
if [ "$(yq -o=json -I=0 '.' "$WORK/merge/a.yml" 2>/dev/null)" = "$(yq -o=json -I=0 '.' "$Y/merged.expected.yml")" ]; then
    pass "merge: maps merged deeply, arrays replaced"
else
    fail "merge: maps merged deeply, arrays replaced" "$(cat "$WORK/merge/a.yml" 2>/dev/null)"
fi

run_lib "bbb_merge_yaml '$Y/base.yml' '$Y/does-not-exist.yml' '$WORK/merge/b.yml'"
expect_rc "merge: missing override is fine" 0
if [ "$(yq -o=json -I=0 '.' "$WORK/merge/b.yml" 2>/dev/null)" = "$(yq -o=json -I=0 '.' "$Y/base.yml")" ]; then
    pass "merge: missing override keeps base"
else
    fail "merge: missing override keeps base"
fi

run_lib "bbb_merge_yaml '$Y/base.yml' '$Y/override.yml' '$WORK/merge/c.yml'"
if cmp -s "$WORK/merge/a.yml" "$WORK/merge/c.yml"; then pass "merge: deterministic"; else fail "merge: deterministic"; fi

run_lib "bbb_merge_yaml '$Y/base.yml' '$Y/broken.yml' '$WORK/merge/d.yml'"
expect_rc "merge: invalid override fails" 1
expect_err_contains "merge: names the override file" "broken.yml"

# --- bbb_exec ----------------------------------------------------------------------------

run_lib "bbb_init --render-only '$WORK/r2'; bbb_exec sh -c 'echo started'; echo after-exec"
expect_rc "exec: render-only exits 0" 0
expect_not_contains "exec: render-only does not run the command" "$OUT" "started"
expect_not_contains "exec: render-only stops the entrypoint" "$OUT" "after-exec"

run_lib "bbb_init; bbb_exec sh -c 'echo started'; echo after-exec"
expect_rc "exec: normal mode runs the command" 0
expect_out "exec: process replaced (nothing after exec runs)" "started"

run_lib "bbb_init; bbb_exec sh -c 'exit 7'"
expect_rc "exec: exit code of the process is kept" 7

# --- logging -----------------------------------------------------------------------------

run_lib 'bbb_log hello'
expect_out "log: stdout stays clean" ""
expect_err_contains "log: message on stderr" "hello"

echo
echo "$PASSED passed, $FAILED failed"
[ "$FAILED" -eq 0 ]
