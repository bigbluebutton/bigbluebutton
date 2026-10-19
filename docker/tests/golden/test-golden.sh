#!/usr/bin/env bash
# Interface tests for docker/tests/golden/run-golden.sh. Protected: written before
# the implementation; the runner must pass them unchanged.
#
# Contract of run-golden.sh:
#   run-golden.sh [--engine podman|docker] [--root DIR] [--update] [--parity] [NAME...]
#     DIR   golden root (default: docker/tests/golden); each case is a directory DIR/NAME with
#             image        one line: the image reference to test (built beforehand)
#             fixture.env  env file for the render run (fixture values only)
#             expected/    the expected rendered tree (paths as below the render-only root)
#             parity.yaml  optional, used with --parity (see below)
#           Without NAME, every directory below DIR that contains `image` is a case.
#   For each case the runner renders twice:
#     <engine> run --rm --env-file fixture.env -v <tmp>:/golden-out IMAGE --render-only /golden-out
#   and reports, one line each:
#     PASS <name>
#     FAIL <name>: render: exit <n>               the entrypoint failed
#     FAIL <name>: nondeterministic: <relpath>    the two renders differ
#     FAIL <name>: missing: <relpath>             in expected/, not rendered
#     FAIL <name>: unexpected: <relpath>          rendered, not in expected/
#     FAIL <name>: differs: <relpath>             content differs (a short diff may follow,
#                                                 indented by two spaces)
#   --update replaces expected/ with the rendered tree (prints `UPDATED <name>`), then passes.
#   --parity additionally compares rendered files with a reference tree:
#     parity.yaml:
#       reference: <dir, relative to DIR/NAME>
#       files:   [{rendered: <relpath>, reference: <relpath under reference>}]
#       allowed: [{file: <rendered relpath>, line: <ERE>, reason: <text>}]
#     Every differing line (from either side) must match an `allowed` entry for that file.
#     Lines reported:
#       PARITY-PASS <name>
#       PARITY-FAIL <name>: <relpath>: unlisted difference: <line>
#       PARITY-FAIL <name>: allowlist: missing reason: <line ERE>
#       PARITY-FAIL <name>: allowlist: unused entry: <line ERE>
#   Exit 0 if everything passed, 1 if any FAIL/PARITY-FAIL, 2 on usage error (unknown option,
#   unknown NAME, missing `image` file).
#
# Usage: docker/tests/golden/test-golden.sh   (needs podman or docker; builds the selftest image)

# `$host` below is a literal nginx variable in expected output, not a shell expansion.
# shellcheck disable=SC2016

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNNER="${RUN_GOLDEN:-$HERE/run-golden.sh}"
ENGINE="${CONTAINER_ENGINE:-$(command -v docker >/dev/null 2>&1 && echo docker || echo podman)}"
IMAGE=localhost/bbb-golden-selftest:test
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

PASSED=0
FAILED=0
pass() { PASSED=$((PASSED + 1)); echo "ok   $1"; }
fail() { FAILED=$((FAILED + 1)); echo "FAIL $1${2:+: $2}"; }

[ -x "$RUNNER" ] || { echo "runner not found or not executable: $RUNNER"; exit 1; }
"$ENGINE" build -q -t "$IMAGE" -f "$HERE/selftest-image/Dockerfile" "$HERE/../.." >/dev/null

ROOT="$WORK/golden"
newcase() { # name [env lines...]
    local d="$ROOT/$1"; shift
    mkdir -p "$d/expected/etc/selftest"
    printf '%s\n' "$IMAGE" >"$d/image"
    printf '%s\n' "$@" >"$d/fixture.env"
    printf '%s\n' '# selftest config (fixture)' 'server_name bbb.example.com;' 'workers=4' \
        'proxy_set_header Host $host;' >"$d/expected/etc/selftest/app.conf"
}
run() {
    set +e
    "$RUNNER" --engine "$ENGINE" --root "$ROOT" "$@" >"$WORK/out" 2>&1
    RC=$?
    set -e
    OUT="$(cat "$WORK/out")"
}
expect_rc() { if [ "$RC" -eq "$2" ]; then pass "$1"; else fail "$1" "exit $RC, expected $2; output: $OUT"; fi; }
expect_line() { if grep -qE "$2" "$WORK/out"; then pass "$1"; else fail "$1" "no line /$2/ in: $OUT"; fi; }

# --- usage ------------------------------------------------------------------------------------
mkdir -p "$ROOT"
run --no-such-option
expect_rc "usage: unknown option exits 2" 2
run no-such-case
expect_rc "usage: unknown case exits 2" 2

# --- pass, differs, missing, unexpected --------------------------------------------------------
newcase ok BBB_DOMAIN=bbb.example.com
run ok
expect_rc "matching expected tree: exit 0" 0
expect_line "matching expected tree: PASS" "^PASS ok$"

newcase differs BBB_DOMAIN=bbb.example.com
sed -i 's/workers=4/workers=5/' "$ROOT/differs/expected/etc/selftest/app.conf"
run differs
expect_rc "content differs: exit 1" 1
expect_line "content differs: reported with path" "^FAIL differs: differs: etc/selftest/app.conf$"

newcase unexpected BBB_DOMAIN=bbb.example.com
rm "$ROOT/unexpected/expected/etc/selftest/app.conf"
run unexpected
expect_line "rendered file not in expected: reported" "^FAIL unexpected: unexpected: etc/selftest/app.conf$"

newcase missing BBB_DOMAIN=bbb.example.com
printf 'x\n' >"$ROOT/missing/expected/etc/selftest/extra.conf"
run missing
expect_line "expected file not rendered: reported" "^FAIL missing: missing: etc/selftest/extra.conf$"

newcase envchange BBB_DOMAIN=bbb.example.com SELFTEST_WORKERS=8
run envchange
expect_line "fixture env is used (Tier 2 value changes output)" "^FAIL envchange: differs: etc/selftest/app.conf$"

# --- render failure, determinism ---------------------------------------------------------------
newcase renderfail SELFTEST_WORKERS=4
run renderfail
expect_rc "entrypoint fails (missing required var): exit 1" 1
expect_line "entrypoint fails: reported" "^FAIL renderfail: render: exit [1-9]"

newcase random BBB_DOMAIN=bbb.example.com SELFTEST_RANDOM=1
run random
expect_line "two renders differ: reported" "^FAIL random: nondeterministic: etc/selftest/random.txt$"

# --- all cases, update --------------------------------------------------------------------------
run
expect_rc "no NAME: all cases run, failures → exit 1" 1
n="$(grep -cE '^(PASS|FAIL) ' "$WORK/out" || true)"
if [ "$n" -ge 7 ]; then pass "no NAME: every case reported ($n lines)"; else fail "no NAME: every case reported" "$n: $OUT"; fi

run --update differs
expect_line "--update: reported" "^UPDATED differs$"
run differs
expect_rc "--update: case passes afterwards" 0
if grep -q 'workers=4' "$ROOT/differs/expected/etc/selftest/app.conf"; then pass "--update: expected tree rewritten"; else fail "--update: expected tree rewritten"; fi

# --- parity -------------------------------------------------------------------------------------
newcase parity BBB_DOMAIN=bbb.example.com
mkdir -p "$ROOT/parity/reference/selftest"
printf '%s\n' '# bare-metal reference' 'server_name bbb.example.com;' 'workers=16' \
    'proxy_set_header Host $host;' >"$ROOT/parity/reference/selftest/app.conf"
parity_yaml() { # allowed-entries-yaml
    cat >"$ROOT/parity/parity.yaml" <<EOF
reference: reference
files:
  - rendered: etc/selftest/app.conf
    reference: selftest/app.conf
allowed:
$1
EOF
}
parity_yaml '  - {file: etc/selftest/app.conf, line: "^# ", reason: "comment header differs"}
  - {file: etc/selftest/app.conf, line: "^workers=", reason: "bare metal sizes workers to the CPU count"}'
run --parity parity
expect_rc "parity: all differences allowlisted: exit 0" 0
expect_line "parity: PARITY-PASS" "^PARITY-PASS parity$"

parity_yaml '  - {file: etc/selftest/app.conf, line: "^# ", reason: "comment header differs"}'
run --parity parity
expect_rc "parity: unlisted difference: exit 1" 1
expect_line "parity: unlisted difference reported" "^PARITY-FAIL parity: etc/selftest/app.conf: unlisted difference: workers="

parity_yaml '  - {file: etc/selftest/app.conf, line: "^# ", reason: "comment header differs"}
  - {file: etc/selftest/app.conf, line: "^workers="}'
run --parity parity
expect_line "parity: entry without reason reported" "^PARITY-FAIL parity: allowlist: missing reason: \^workers="

parity_yaml '  - {file: etc/selftest/app.conf, line: "^# ", reason: "comment header differs"}
  - {file: etc/selftest/app.conf, line: "^workers=", reason: "cpu count"}
  - {file: etc/selftest/app.conf, line: "^listen ", reason: "stale entry"}'
run --parity parity
expect_line "parity: unused allowlist entry reported" "^PARITY-FAIL parity: allowlist: unused entry: \^listen "

run parity
if grep -q '^PARITY' "$WORK/out"; then fail "without --parity no parity check"; else pass "without --parity no parity check"; fi

echo
echo "$PASSED passed, $FAILED failed"
[ "$FAILED" -eq 0 ]
