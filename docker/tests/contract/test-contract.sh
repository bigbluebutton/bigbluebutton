#!/usr/bin/env bash
# Tests of the configuration contract tools: validate.sh, generate.sh, drift-check.sh.
# Run in the runner image: docker/tests/contract/run.sh
# Needs bash, coreutils, diffutils, grep, sed, awk and mikefarah/yq v4. Writes only to $TMPDIR.

# Single-quoted strings with $ are fixture content and yq expressions, not shell expansions.
# shellcheck disable=SC2016
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../../.." && pwd)"
TOOLS="$REPO/docker/contract"
FIX="$HERE/fixtures"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

if command -v yq >/dev/null 2>&1; then YQ=yq; else YQ=yq-go; fi

PASS=0
FAIL=0
pass() { PASS=$((PASS + 1)); printf 'ok   %s\n' "$1"; }
fail() { FAIL=$((FAIL + 1)); printf 'FAIL %s\n' "$1"; [ -z "${2:-}" ] || printf '%s\n' "$2" | sed 's/^/     | /'; }

# run CMD... — capture stdout in $OUT, stderr in $ERR, exit status in $RC
run() {
    RC=0
    "$@" >"$WORK/out" 2>"$WORK/err" || RC=$?
    OUT="$(cat "$WORK/out")"
    ERR="$(cat "$WORK/err")"
}
expect_rc() { # NAME RC
    if [ "$RC" -eq "$2" ]; then pass "$1"; else fail "$1 (exit $RC, expected $2)" "$OUT$ERR"; fi
}
expect_out() { # NAME EXPECTED-STDOUT
    if [ "$OUT" = "$2" ]; then pass "$1"; else fail "$1" "expected:
$2
got:
$OUT"; fi
}
expect_contains() { # NAME HAYSTACK NEEDLE
    case "$2" in *"$3"*) pass "$1" ;; *) fail "$1 (missing: $3)" "$2" ;; esac
}
expect_not_contains() { # NAME HAYSTACK NEEDLE
    case "$2" in *"$3"*) fail "$1 (unexpected: $3)" "$2" ;; *) pass "$1" ;; esac
}

# planted_contract NAME YQ-EXPRESSION — copy of the fixture contract with one change
planted_contract() {
    "$YQ" "$2" "$FIX/contract.yaml" >"$WORK/$1.yaml"
    printf '%s' "$WORK/$1.yaml"
}

# fresh_tree — copy of the fixture tree in $WORK/tree
fresh_tree() {
    rm -rf "$WORK/tree"
    cp -R "$FIX/tree" "$WORK/tree"
}

echo "== validate.sh"
run "$TOOLS/validate.sh"
expect_rc "validate: repository contract is valid" 0
run "$TOOLS/validate.sh" --fixtures "$FIX/fixtures.env" "$FIX/contract.yaml"
expect_rc "validate: fixture contract with fixtures is valid" 0

# validate_planted NAME YQ-EXPRESSION EXPECTED-MESSAGE — the change must fail with the message
validate_planted() {
    local c
    c="$(planted_contract "$1" "$2")"
    run "$TOOLS/validate.sh" "$c"
    expect_rc "validate: $1 fails" 1
    expect_contains "validate: $1 is reported" "$OUT" "$3"
}
validate_planted missing-description 'del(.variables[0].description)' "variables[0] (BBB_DOMAIN): missing field 'description'"
validate_planted unknown-field '.variables[0].colour = "blue"' "unknown field 'colour'"
validate_planted bad-tier '.variables[3].tier = 3' "tier must be 1 or 2"
validate_planted duplicate-name '.variables[1].name = "BBB_DOMAIN"' "duplicate name"
validate_planted invalid-pattern '.variables[3].pattern = "[1-9"' "pattern is not a valid ERE"
validate_planted secret-default '.variables[1].default = "fixtureturnsecretnotreal000000000000000000000000"' "secrets have no default"
validate_planted secret-example '.variables[1].example = "Abcdefghijklmnopqrstuvwxyz0123456789"' "a secret's example must be null or a project fixture"
validate_planted default-pattern '.variables[3].default = "many"' "default 'many' does not match the pattern"
validate_planted required-default '.variables[0].default = "bbb.example.com"' "a required variable has no default"
validate_planted bool-type '.variables[0].secret = "no"' "field 'secret' must be !!bool"
validate_planted no-citation '.variables[0].sources = ["somewhere in the code"]' "neither 'path:lines @ sha' nor UNVERIFIED"
validate_planted bad-status '.variables[0].status = "final"' "field 'status' must be one of"
validate_planted formula-undeclared '.derived[0].formula = "${NOPE}"' "formula references undeclared variable NOPE"
validate_planted two-lines '.variables[0].description = "line one\nline two"' "must be one line"
validate_planted unbalanced-backtick '.variables[0].description = "a `b"' "unbalanced backticks"
validate_planted decision-affects '.decisions_needed[0].affects = ["NOPE"]' "affects undeclared variable NOPE"
validate_planted decision-option '.decisions_needed[0].options[1] = {"id": "b"}' "options[1] must have exactly the string fields id and text"
validate_planted override-path '.overrides[0].path = "etc/x"' "path must be absolute"
validate_planted feature-pattern '.features[1].name = "chat"' "name is not accepted by the BBB_FEATURES pattern"
validate_planted feature-settings-uncited '.features[0].sources = []' "features[0] (recording): field 'sources' must not be empty"
validate_planted decided-date '.decided[0].date = "17.10.2026"' "date must be a quoted YYYY-MM-DD"
validate_planted decided-duplicate-id '.decided[0].id = "sample-decision"' "decisions_needed[0] (sample-decision): duplicate id"
validate_planted decided-affects '.decided[0].affects = ["NOPE"]' "decided[0] (sample-decided): affects undeclared variable NOPE"
validate_planted env-precedence-type '.overrides[0].env_precedence = ["x"]' "field 'env_precedence' must be !!str"
c="$(planted_contract optional-sections 'del(.features) | del(.decided) | del(.decisions_needed)')"
run "$TOOLS/validate.sh" "$c"
expect_rc "validate: optional sections may be missing" 0

printf 'BBB_DOMAIN=not a host\nTURN_SECRET=short\nUNKNOWN_VAR=x\n' >"$WORK/bad-fixtures.env"
run "$TOOLS/validate.sh" --fixtures "$WORK/bad-fixtures.env" "$FIX/contract.yaml"
expect_rc "validate: bad fixtures fail" 1
expect_contains "validate: fixture not matching its pattern" "$OUT" "fixture BBB_DOMAIN: 'not a host' does not match the pattern"
expect_contains "validate: secret fixture mismatch reported" "$OUT" "fixture TURN_SECRET: does not match the pattern"
expect_not_contains "validate: secret fixture value not printed" "$OUT$ERR" "short"
expect_contains "validate: fixture of an unknown variable" "$OUT" "fixture UNKNOWN_VAR: no such variable"
printf 'Text\n```\nBBB_DOMAIN=bbb.example.com\n```\n```\nNOT_READ=1\n```\n' >"$WORK/fixtures.md"
run "$TOOLS/validate.sh" --fixtures "$WORK/fixtures.md" "$FIX/contract.yaml"
expect_contains "validate: only the first fenced block of a Markdown fixtures file is read" "$OUT" "Tier 1 variable TURN_SECRET has no fixture"
expect_not_contains "validate: second fenced block ignored" "$OUT" "NOT_READ"

echo "== drift-check.sh"
fresh_tree
run "$TOOLS/drift-check.sh" --root "$WORK/tree" --contract "$FIX/contract.yaml"
expect_rc "drift: clean tree passes" 0
expect_out "drift: clean tree has no findings" ""

fresh_tree
printf 'listen ${PLANTED_UNDECLARED};\n' >>"$WORK/tree/docker/web/app.conf.tmpl"
run "$TOOLS/drift-check.sh" --root "$WORK/tree" --contract "$FIX/contract.yaml"
expect_rc "drift: planted undeclared variable fails" 1
expect_out "drift: planted undeclared variable reported with file:line" "UNDECLARED PLANTED_UNDECLARED docker/web/app.conf.tmpl:6"

c="$(planted_contract unused '.variables += [.variables[3] | .name = "PLANTED_UNUSED"]')"
fresh_tree
run "$TOOLS/drift-check.sh" --root "$WORK/tree" --contract "$c"
expect_rc "drift: planted unused variable fails" 1
expect_out "drift: planted unused variable reported" "UNUSED PLANTED_UNUSED"

c="$(planted_contract unused-pending '.variables += [.variables[3] | .name = "PLANTED_PENDING" | .status = "pending-g3"]')"
run "$TOOLS/drift-check.sh" --root "$WORK/tree" --contract "$c"
expect_rc "drift: unused pending variable is not a finding" 0

fresh_tree
cat >>"$WORK/tree/docker/web/entrypoint.sh" <<'EOF'
bbb_require_secret PLANTED_HELPER
bbb_write_shell_vars --mode 0600 /etc/x PLANTED_SHELL_VAR
yq -i '.a = strenv(PLANTED_STRENV)' /etc/y
echo "PLANTED_IN_STRING=$PLANTED_IN_STRING"
EOF
printf '    command2: ["sh", "-c", "echo $${ESCAPED} $PLANTED_UNBRACED"]\n' >>"$WORK/tree/docker-compose.yml"
printf 'unbraced $NOT_IN_TEMPLATES and ${?PLANTED_HOCON}\n' >>"$WORK/tree/docker/web/app.conf.tmpl"
run "$TOOLS/drift-check.sh" --root "$WORK/tree" --contract "$FIX/contract.yaml"
expect_rc "drift: use forms fail" 1
expect_out "drift: helper args, strenv, strings, unbraced compose and HOCON uses are found" "UNDECLARED PLANTED_UNBRACED docker-compose.yml:12
UNDECLARED PLANTED_HOCON docker/web/app.conf.tmpl:6
UNDECLARED PLANTED_HELPER docker/web/entrypoint.sh:17
UNDECLARED PLANTED_SHELL_VAR docker/web/entrypoint.sh:18
UNDECLARED PLANTED_STRENV docker/web/entrypoint.sh:19
UNDECLARED PLANTED_IN_STRING docker/web/entrypoint.sh:20"

fresh_tree
mkdir -p "$WORK/tree/docker/tests" "$WORK/tree/other/docker"
printf 'x ${IN_TESTS}\n' >"$WORK/tree/docker/tests/t.tmpl"
printf 'x ${IN_OTHER_COMPONENT}\n' >"$WORK/tree/other/docker/t.tmpl"
printf 'LOCAL_URL=elsewhere\n' >"$WORK/tree/other/docker/set.sh"
printf 'x ${LOCAL_URL}\n' >>"$WORK/tree/other/docker/t.tmpl"
run "$TOOLS/drift-check.sh" --root "$WORK/tree" --contract "$FIX/contract.yaml"
expect_out "drift: tests excluded, component docker dirs scanned, locals scoped per image" "UNDECLARED IN_OTHER_COMPONENT other/docker/t.tmpl:1"

run "$TOOLS/drift-check.sh" --root "$WORK/tree" --contract "$FIX/contract.yaml" docker/tests/t.tmpl
expect_contains "drift: explicit path is scanned without exclusions" "$OUT" "UNDECLARED IN_TESTS docker/tests/t.tmpl:1"
expect_contains "drift: UNUSED is relative to the scanned paths" "$OUT" "UNUSED BBB_DOMAIN"

fresh_tree
printf '    env_file: .env\n' >>"$WORK/tree/docker-compose.yml"
run "$TOOLS/drift-check.sh" --root "$WORK/tree" --contract "$FIX/contract.yaml"
expect_rc "drift: env_file note is not a finding" 0
expect_contains "drift: env_file note on stderr" "$ERR" "NOTE docker-compose.yml:12 env_file"

echo "== generate.sh"
fresh_tree
run "$TOOLS/generate.sh" --root "$WORK/tree" --contract "$FIX/contract.yaml"
expect_rc "generate: writes outputs" 0
env_sample="$WORK/tree/.env.sample"
doc="$WORK/tree/docs/docs/administration/docker-configuration.md"
if [ -f "$env_sample" ] && [ -f "$doc" ]; then pass "generate: both outputs exist"; else fail "generate: both outputs exist"; fi
OUT="$(grep -v '^#' "$env_sample" | grep -v '^$')"
expect_out "generate: .env.sample has Tier 1 only, secrets empty, derived line last" "BBB_DOMAIN=
TURN_SECRET=
BBB_FEATURES=recording
COMPOSE_PROFILES=\${BBB_FEATURES}"
expect_not_contains "generate: no fixture secret in .env.sample" "$(cat "$env_sample")" "fixtureturnsecret"
expect_not_contains "generate: no fixture secret in the docs page" "$(cat "$doc")" "fixtureturnsecret"
expect_contains "generate: docs page lists Tier 2" "$(cat "$doc")" "### RECORDING_WORKERS"
expect_contains "generate: docs page lists features" "$(cat "$doc")" '| `recording` | recorder | web: disableRecordingDefault from the feature |'
expect_contains "generate: docs page lists decisions" "$(cat "$doc")" '| `sample-decided` | 2026-10-17 | (a) Keep the domain variable. |'
expect_contains "generate: docs page says patterns are enforced" "$(cat "$doc")" "Every
  image entrypoint enforces it"
expect_contains "generate: docs page escapes MDX outside code" "$(cat "$doc")" '| `compose_profiles` | `${BBB_FEATURES}` |'

cp "$env_sample" "$WORK/env.first"
cp "$doc" "$WORK/doc.first"
run "$TOOLS/generate.sh" --root "$WORK/tree" --contract "$FIX/contract.yaml"
if cmp -s "$env_sample" "$WORK/env.first" && cmp -s "$doc" "$WORK/doc.first"; then
    pass "generate: deterministic (second run byte-identical)"
else
    fail "generate: deterministic (second run byte-identical)"
fi

run "$TOOLS/generate.sh" --check --root "$WORK/tree" --contract "$FIX/contract.yaml"
expect_rc "generate --check: passes after generation" 0

printf 'EXTRA=1\n' >>"$env_sample"
run "$TOOLS/generate.sh" --check --root "$WORK/tree" --contract "$FIX/contract.yaml"
expect_rc "generate --check: hand-edited .env.sample fails" 1
expect_contains "generate --check: shows the difference" "$OUT" "-EXTRA=1"
cp "$WORK/env.first" "$env_sample"

rm "$doc"
run "$TOOLS/generate.sh" --check --root "$WORK/tree" --contract "$FIX/contract.yaml"
expect_rc "generate --check: missing docs page fails" 1

c="$(planted_contract invalid 'del(.variables[0].pattern)')"
run "$TOOLS/generate.sh" --root "$WORK/tree" --contract "$c"
expect_rc "generate: refuses an invalid contract" 1

run "$TOOLS/generate.sh" --check
expect_rc "generate --check: committed outputs of the repository match its contract" 0

echo
echo "$PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
