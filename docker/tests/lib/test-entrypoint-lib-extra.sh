#!/usr/bin/env bash
# Additional tests for docker/lib/entrypoint-lib.sh: behaviour the interface tests
# (test-entrypoint-lib.sh) do not pin down. Same harness and conventions.
#
# Usage: docker/tests/lib/test-entrypoint-lib-extra.sh
#   BBB_ENTRYPOINT_LIB=/path/to/entrypoint-lib.sh overrides the helper location.

# Snippets passed to run_lib are single-quoted on purpose: they are expanded by the child shell.
# shellcheck disable=SC2016

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB="${BBB_ENTRYPOINT_LIB:-$HERE/../../lib/entrypoint-lib.sh}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

PASSED=0
FAILED=0

pass() { PASSED=$((PASSED + 1)); echo "ok   $1"; }
fail() { FAILED=$((FAILED + 1)); echo "FAIL $1${2:+: $2}"; }

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

expect_rc() { if [ "$RC" -eq "$2" ]; then pass "$1"; else fail "$1" "exit $RC, expected $2; stderr: $ERR"; fi; }
expect_out() { if [ "$OUT" = "$2" ]; then pass "$1"; else fail "$1" "got '$OUT'"; fi; }
expect_err_contains() { case "$ERR" in *"$2"*) pass "$1" ;; *) fail "$1" "stderr does not contain '$2': $ERR" ;; esac; }
expect_not_contains() { case "$2" in *"$3"*) fail "$1" "output contains '$3'" ;; *) pass "$1" ;; esac; }
expect_mode() { # name file mode
    local m
    m="$(stat -c %a "$2" 2>/dev/null || echo missing)"
    if [ "$m" = "$3" ]; then pass "$1"; else fail "$1" "mode $m, expected $3"; fi
}
no_hidden_files() { # name dir
    if [ -n "$(find "$2" -maxdepth 1 -name '.*' -type f)" ]; then fail "$1" "$(ls -a "$2")"; else pass "$1"; fi
}
expect_file() { # name file expected-content
    if [ -f "$2" ] && [ "$(cat "$2"; printf x)" = "$3"x ]; then pass "$1"
    else fail "$1" "$(cat "$2" 2>&1)"; fi
}

[ -r "$LIB" ] || { echo "helper not found: $LIB"; exit 1; }
T="$WORK/tpl"
mkdir -p "$T"

# --- bbb_render: what passes through ----------------------------------------------------

printf '%s\n' 'a=${BBB_DOMAIN}' 'b=$host ${host} ${lower_case}' 'c=${?INTERFACE} ${BBB_DOMAIN:-x}' 'd=$$ \$' >"$T/pass.tmpl"
run_lib "bbb_render '$T/pass.tmpl' '$WORK/r/pass.out'" BBB_DOMAIN=bbb.example.com host=WRONG lower_case=WRONG INTERFACE=WRONG
expect_rc "render: renders template with non-project variables" 0
expect_file "render: only braced upper-case names are substituted" "$WORK/r/pass.out" \
    "$(printf '%s\n' 'a=bbb.example.com' 'b=$host ${host} ${lower_case}' 'c=${?INTERFACE} ${BBB_DOMAIN:-x}' 'd=$$ \$')
"

printf 'x=${BBB_DERIVED}\n' >"$T/derived.tmpl"
run_lib "BBB_DERIVED=https://bbb.example.com; bbb_render '$T/derived.tmpl' '$WORK/r/derived.out'; printf %s \"\$(bash -c 'printf %s \"\${BBB_DERIVED:-unset}\"')\""
expect_rc "render: unexported shell variable is substituted" 0
expect_file "render: derived value written" "$WORK/r/derived.out" "x=https://bbb.example.com
"
expect_out "render: caller environment unchanged (not exported)" "unset"

run_lib "bbb_render '$T/derived.tmpl' '$WORK/r/empty.out'" BBB_DERIVED=
expect_rc "render: set but empty variable is allowed" 0
expect_file "render: empty value substituted" "$WORK/r/empty.out" "x=
"

printf 'v=${BBB_VALUE}\n' >"$T/special.tmpl"
run_lib "bbb_render '$T/special.tmpl' '$WORK/r/special.out'" 'BBB_VALUE=a$b\c&d/e"f'"'g"
expect_file "render: special characters in values copied literally" "$WORK/r/special.out" 'v=a$b\c&d/e"f'"'g
"

printf 'static\n\n' >"$T/static.tmpl"
run_lib "bbb_render '$T/static.tmpl' '$WORK/r/static.out'"
expect_rc "render: template without variables" 0
if cmp -s "$T/static.tmpl" "$WORK/r/static.out"; then pass "render: template without variables copied byte for byte"
else fail "render: template without variables copied byte for byte"; fi

printf 'a=${BBB_DOMAIN}\nb=$BBB_DOMAIN\n' >"$T/unbraced.tmpl"
run_lib "bbb_render '$T/unbraced.tmpl' '$WORK/r/unbraced.out'" BBB_DOMAIN=bbb.example.com
expect_rc "render: unbraced form of a project variable fails" 1
expect_err_contains "render: names the unbraced variable" "BBB_DOMAIN"

printf 'a=${BBB_A}\nb=${BBB_B}\n' >"$T/two.tmpl"
run_lib "bbb_render '$T/two.tmpl' '$WORK/r/two.out'"
expect_err_contains "render: reports every undefined variable (first)" "BBB_A"
expect_err_contains "render: reports every undefined variable (second)" "BBB_B"

# --- bbb_render: failure leaves no partial files -----------------------------------------

printf 'old\n' >"$WORK/r/keep.out"
printf 'missing=${BBB_NOT_SET}\n' >"$T/missing.tmpl"
run_lib "bbb_render '$T/missing.tmpl' '$WORK/r/keep.out'"
expect_rc "render: failure exits 1" 1
expect_file "render: failure keeps the existing destination" "$WORK/r/keep.out" "old
"
if [ -n "$(find "$WORK/r" -maxdepth 1 -name '.*' -type f)" ]; then fail "render: no temporary files left"; else pass "render: no temporary files left"; fi

run_lib "bbb_render '$T/does-not-exist.tmpl' '$WORK/r/x.out'"
expect_rc "render: missing template fails" 1
expect_err_contains "render: names the missing template" "does-not-exist.tmpl"

run_lib "umask 077; bbb_render '$T/derived.tmpl' '$WORK/r/mode.out'" BBB_DERIVED=fixtureturnsecretnotreal000000000000000000000000
if [ "$(stat -c %a "$WORK/r/mode.out")" = 600 ]; then pass "render: umask 077 gives 0600"
else fail "render: umask 077 gives 0600" "$(stat -c %a "$WORK/r/mode.out")"; fi

# --- bbb_require_secret ------------------------------------------------------------------

run_lib 'bbb_require_secret TURN_SECRET' TURN_SECRET=CHANGEME
expect_rc "secret: placeholders compared case-insensitively" 1
run_lib 'BBB_SECRET_PLACEHOLDERS+=(bbb_core); bbb_require_secret POSTGRES_BBB_CORE_PASSWORD' POSTGRES_BBB_CORE_PASSWORD=bbb_core
expect_rc "secret: entrypoints can add placeholders" 1
expect_not_contains "secret: added placeholder not echoed" "$OUT$ERR" "bbb_core"

run_lib 'bbb_require "bad-name"'
expect_rc "require: invalid variable name fails" 1

# --- bbb_feature_enabled -----------------------------------------------------------------

run_lib 'bbb_feature_enabled greenlight' 'BBB_FEATURES=recording, greenlight'
expect_rc "feature: spaces in the list are tolerated" 0
run_lib 'if bbb_feature_enabled webhooks; then echo on; else echo off; fi' BBB_FEATURES=recording
expect_out "feature: usable in if under set -e" "off"

# --- bbb_init / bbb_path / bbb_is_render_only --------------------------------------------

run_lib "bbb_init --render-only '$WORK/r3/' nginx -g 'daemon off;'; bbb_path /etc/x; printf '%s|' \"\${BBB_ARGS[@]}\"; bbb_is_render_only && echo yes"
expect_out "init: trailing slash stripped, remaining args kept" "$WORK/r3/etc/x
nginx|-g|daemon off;|yes"

run_lib 'bbb_init nginx -g "daemon off;"; printf "%s|" "${BBB_ARGS[@]}"; bbb_is_render_only || echo no'
expect_out "init: normal mode keeps all args" "nginx|-g|daemon off;|no"

run_lib 'bbb_init; printf "%s" "${#BBB_ARGS[@]}"'
expect_out "init: no args gives empty BBB_ARGS under set -u" "0"

run_lib 'bbb_path etc/relative'
expect_rc "path: relative path fails" 1

run_lib "bbb_init --render-only '$WORK/r4'; bbb_render '$T/static.tmpl' \"\$(bbb_path /etc/bigbluebutton/static.conf)\""
if [ -f "$WORK/r4/etc/bigbluebutton/static.conf" ]; then pass "render-only: bbb_render into bbb_path lands below the dir"
else fail "render-only: bbb_render into bbb_path lands below the dir"; fi

run_lib 'bbb_exec'
expect_rc "exec: no command fails" 1

# --- bbb_merge_yaml ----------------------------------------------------------------------

Y="$WORK/yaml"
mkdir -p "$Y"
printf 'a:\n  b: 1\n  c: [1, 2]\nd: x\n' >"$Y/base.yml"
printf -- '- 1\n- 2\n' >"$Y/list.yml"
printf 'a: {b: 2}\n---\na: {b: 3}\n' >"$Y/multi.yml"
: >"$Y/empty.yml"
printf '# only a comment\n' >"$Y/comment.yml"

run_lib "bbb_merge_yaml '$Y/base.yml' '$Y/list.yml' '$WORK/m/list.yml'"
expect_rc "merge: override that is not a mapping fails" 1
expect_err_contains "merge: names the non-mapping override" "list.yml"

run_lib "bbb_merge_yaml '$Y/base.yml' '$Y/multi.yml' '$WORK/m/multi.yml'"
expect_rc "merge: multi-document override fails" 1

for f in empty comment; do
    run_lib "bbb_merge_yaml '$Y/base.yml' '$Y/$f.yml' '$WORK/m/$f.yml'"
    expect_rc "merge: $f override is fine" 0
    if [ "$(yq -o=json -I=0 '.' "$WORK/m/$f.yml" 2>/dev/null)" = "$(yq -o=json -I=0 '.' "$Y/base.yml")" ]; then
        pass "merge: $f override keeps base"
    else fail "merge: $f override keeps base" "$(cat "$WORK/m/$f.yml" 2>&1)"; fi
done

printf 'old: true\n' >"$WORK/m/keep.yml"
printf 'a: [unclosed\n' >"$Y/broken.yml"
run_lib "bbb_merge_yaml '$Y/base.yml' '$Y/broken.yml' '$WORK/m/keep.yml'"
expect_file "merge: failure keeps the existing destination" "$WORK/m/keep.yml" "old: true
"

# The override is valid, the base is not: yq itself fails while writing the destination.
printf 'a: [unclosed\n' >"$Y/broken-base.yml"
printf 'a: 1\n' >"$Y/ok.yml"
run_lib "bbb_merge_yaml '$Y/broken-base.yml' '$Y/ok.yml' '$WORK/m/keep.yml'"
expect_rc "merge: failing yq exits 1" 1
expect_file "merge: failing yq keeps the existing destination" "$WORK/m/keep.yml" "old: true
"
if [ -n "$(find "$WORK/m" -maxdepth 1 -name '.*' -type f)" ]; then fail "merge: no temporary files left"; else pass "merge: no temporary files left"; fi

run_lib "bbb_merge_yaml '$Y/no-base.yml' '$Y/empty.yml' '$WORK/m/x.yml'"
expect_rc "merge: missing base fails" 1
expect_err_contains "merge: names the missing base" "no-base.yml"

printf 'secret: fixturelivekitapisecretnotreal000000000000000000\n' >"$Y/secret.yml"
run_lib "bbb_merge_yaml '$Y/base.yml' '$Y/secret.yml' '$WORK/m/secret.yml'"
expect_not_contains "merge: does not log values" "$OUT$ERR" "fixturelivekitapisecretnotreal"

# === more merge and render cases =========================================================

# --- M1: value validation ----------------------------------------------------------------

printf 'k=${BBB_VALUE}\nother=1\n' >"$T/props.tmpl"
run_lib "bbb_render '$T/props.tmpl' '$WORK/r/nl.out'" "BBB_VALUE=good
securitySalt=injectedvalue"
expect_rc "render: value with LF refused" 1
expect_err_contains "render: LF message names the variable" "BBB_VALUE"
expect_not_contains "render: LF message does not print the value" "$OUT$ERR" "injectedvalue"
if [ -e "$WORK/r/nl.out" ]; then fail "render: nothing written for LF value"; else pass "render: nothing written for LF value"; fi

run_lib "bbb_render '$T/props.tmpl' '$WORK/r/cr.out'" "BBB_VALUE=good$(printf '\r')x"
expect_rc "render: value with CR refused" 1

run_lib 'bbb_require_match RECORDING_RETENTION_DAYS "[0-9]+"' RECORDING_RETENTION_DAYS=14
expect_rc "match: matching value passes" 0
run_lib 'bbb_require_match RECORDING_RETENTION_DAYS "[0-9]+"' 'RECORDING_RETENTION_DAYS=7; echo PWNED'
expect_rc "match: partial match fails (anchored)" 1
expect_err_contains "match: message names the variable" "RECORDING_RETENTION_DAYS"
expect_not_contains "match: message does not print the value" "$OUT$ERR" "PWNED"
run_lib 'bbb_require_match BBB_DOMAIN "[a-z0-9.-]+|localhost"' BBB_DOMAIN=bbb.example.com
expect_rc "match: alternation is anchored as a whole" 0
run_lib 'bbb_require_match BBB_DOMAIN "[a-z0-9.-]+|localhost"' 'BBB_DOMAIN=x;}'
expect_rc "match: alternation does not let a suffix through" 1
run_lib 'bbb_require_match RECORDING_RETENTION_DAYS "[0-9]+"'
expect_rc "match: unset variable fails" 1
run_lib 'bbb_require_match RECORDING_RETENTION_DAYS "[0-9]*"' RECORDING_RETENTION_DAYS=
expect_rc "match: empty value can be allowed by the pattern" 0

printf '<url>turn:${BBB_DOMAIN}</url>\n<s a="${TURN_SECRET}"/>\n' >"$T/x.xml"
run_lib "bbb_render --xml '$T/x.xml' '$WORK/r/x.xml'" 'BBB_DOMAIN=a</url><url>evil&amp;' "TURN_SECRET=q\"u'o"
expect_rc "render --xml: renders" 0
expect_file "render --xml: & < > \" ' escaped" "$WORK/r/x.xml" '<url>turn:a&lt;/url&gt;&lt;url&gt;evil&amp;amp;</url>
<s a="q&quot;u&apos;o"/>
'
run_lib "bbb_render --xml '$T/x.xml' '$WORK/r/x2.xml'; printf %s \"\$BBB_DOMAIN\"" 'BBB_DOMAIN=a&b' TURN_SECRET=s
expect_out "render --xml: caller's value unchanged" "a&b"

run_lib "bbb_write_shell_vars '$WORK/r/cron-config' RECORDING_RETENTION_DAYS" 'RECORDING_RETENTION_DAYS=7; echo PWNED'
expect_rc "shell vars: writes" 0
for sh in sh bash; do
    out="$("$sh" -c ". '$WORK/r/cron-config'; printf '%s' \"\$RECORDING_RETENTION_DAYS\"" 2>&1)" || true
    if [ "$out" = "7; echo PWNED" ]; then pass "shell vars: sourced by $sh, value intact, nothing executed"
    else fail "shell vars: sourced by $sh, value intact, nothing executed" "got '$out'"; fi
done
VAL="it's \$(id) \`id\` \"q\" \\ $(printf 'two\nlines')"
run_lib "bbb_write_shell_vars '$WORK/r/q' A B" "A=$VAL" B=
out="$(sh -c ". '$WORK/r/q'; printf '%s|%s' \"\$A\" \"\$B\"" 2>&1)" || true
if [ "$out" = "$VAL|" ]; then pass "shell vars: quotes, \$(), backticks, backslash, newline round-trip"
else fail "shell vars: quotes, \$(), backticks, backslash, newline round-trip" "got '$out'"; fi
run_lib "bbb_write_shell_vars '$WORK/r/q2' A UNSET_ONE" A=1
expect_rc "shell vars: unset variable fails" 1
expect_err_contains "shell vars: names the unset variable" "UNSET_ONE"
run_lib "bbb_write_shell_vars --mode 0640 '$WORK/r/q3' A" A=1
expect_mode "shell vars: --mode applied" "$WORK/r/q3" 640

# --- M2: permissions ---------------------------------------------------------------------

run_lib "bbb_render --mode 0600 '$T/derived.tmpl' '$WORK/r/m1.out'" BBB_DERIVED=x
expect_mode "render --mode 0600 sets the mode" "$WORK/r/m1.out" 600
printf 'old\n' >"$WORK/r/m2.out"; chmod 600 "$WORK/r/m2.out"
run_lib "bbb_render '$T/derived.tmpl' '$WORK/r/m2.out'" BBB_DERIVED=x
expect_mode "render: existing 0600 destination keeps its mode" "$WORK/r/m2.out" 600
run_lib "bbb_render '$T/derived.tmpl' '$WORK/r/m3.out'" BBB_DERIVED=x
expect_mode "render: new file gets the umask default (022 -> 644)" "$WORK/r/m3.out" 644
run_lib "(umask 077; bbb_render '$T/derived.tmpl' '$WORK/r/m4.out'); umask" BBB_DERIVED=x
expect_mode "render: scoped umask 077 gives 0600" "$WORK/r/m4.out" 600
expect_out "render: scoped umask does not leak to the entrypoint" "0022"
run_lib "bbb_render --mode 999 '$T/derived.tmpl' '$WORK/r/m5.out'" BBB_DERIVED=x
expect_rc "render: invalid --mode refused" 1
run_lib "bbb_render --bogus '$T/derived.tmpl' '$WORK/r/m6.out'" BBB_DERIVED=x
expect_rc "render: unknown option refused" 1
printf 'a: 1\n' >"$Y/m-base.yml"; printf 'a: 2\n' >"$Y/m-ov.yml"
printf 'x: 1\n' >"$WORK/m/mode.yml"; chmod 640 "$WORK/m/mode.yml"
run_lib "bbb_merge_yaml '$Y/m-base.yml' '$Y/m-ov.yml' '$WORK/m/mode.yml'"
expect_mode "merge: existing 0640 destination keeps its mode" "$WORK/m/mode.yml" 640
run_lib "bbb_merge_yaml --mode 0600 '$Y/m-base.yml' '$Y/m-ov.yml' '$WORK/m/mode2.yml'"
expect_mode "merge --mode 0600 sets the mode" "$WORK/m/mode2.yml" 600
run_lib "bbb_merge_yaml --mode 0600 '$Y/m-base.yml' '$Y/missing.yml' '$WORK/m/mode3.yml'"
expect_mode "merge --mode also applies without override" "$WORK/m/mode3.yml" 600

# --- M3: destinations --------------------------------------------------------------------

mkdir -p "$WORK/cwd"
run_lib "cd '$WORK/cwd'; bbb_render '$T/derived.tmpl' ''" BBB_DERIVED=fixturesecretnotreal0000
expect_rc "render: empty destination refused" 1
no_hidden_files "render: empty destination leaves no file in cwd" "$WORK/cwd"
if [ -z "$(ls -A "$WORK/cwd")" ]; then pass "render: cwd stays empty"; else fail "render: cwd stays empty" "$(ls -A "$WORK/cwd")"; fi
run_lib "bbb_render '$T/derived.tmpl' '$WORK/r/dir/'" BBB_DERIVED=x
expect_rc "render: destination ending in / refused" 1
mkdir -p "$WORK/r/isdir"
run_lib "bbb_render '$T/derived.tmpl' '$WORK/r/isdir'" BBB_DERIVED=x
expect_rc "render: destination that is a directory refused" 1
run_lib "bbb_merge_yaml '$Y/m-base.yml' '$Y/m-ov.yml' ''"
expect_rc "merge: empty destination refused" 1
run_lib "cd '$WORK/cwd'; dest=\"\$(bbb_path etc/relative)\"; echo CONTINUED"
expect_rc "README idiom: failing bbb_path in an assignment stops the entrypoint" 1
expect_not_contains "README idiom: nothing after the failed assignment runs" "$OUT" "CONTINUED"
# A destination directory without write permission: no file may appear in it.
mkdir -p "$WORK/ro"; chmod 555 "$WORK/ro"
run_lib "bbb_render '$T/derived.tmpl' '$WORK/ro/x.out'" BBB_DERIVED=x
expect_rc "render: unwritable directory fails" 1
no_hidden_files "render: unwritable directory leaves no temp file" "$WORK/ro"
chmod 755 "$WORK/ro"

# --- L1: render-only root ----------------------------------------------------------------

for root in / // /. /tmp/..; do
    run_lib "bbb_init --render-only '$root'"
    expect_rc "init: render-only root '$root' refused" 1
done
run_lib "cd '$WORK'; bbb_init --render-only ./rel/../rel2/; bbb_path /etc/x"
expect_out "init: relative root made absolute and normalized" "$WORK/rel2/etc/x"
run_lib "bbb_init --render-only '$WORK/sp ace//./x/../y'; bbb_path /etc/x"
expect_out "init: root with spaces, // . and .. normalized" "$WORK/sp ace/y/etc/x"
run_lib "cd /tmp; bbb_init --render-only ../../../.."
expect_rc "init: '..' above / resolves to / and is refused" 1
run_lib "bbb_init --render-only '$WORK/r5'; bbb_path /../../etc/passwd"
expect_rc "path: '..' refused" 1
run_lib "bbb_path /etc/a..b/c"
expect_out "path: '..' inside a name is fine" "/etc/a..b/c"

# --- L2: shell variables -----------------------------------------------------------------

for v in RANDOM SECONDS BASHPID EPOCHSECONDS UID; do
    printf 'x=${%s}\n' "$v" >"$T/dyn-$v.tmpl"
    run_lib "bbb_render '$T/dyn-$v.tmpl' '$WORK/r/dyn.out'"
    expect_rc "render: bash-set \${$v} refused" 1
done

# --- L4, L5, L6: yq, temp files, overrides -----------------------------------------------

run_lib "bbb_merge_yaml '$Y/m-base.yml' '$Y/m-ov.yml' '$WORK/m/yq.yml'" BBB_YQ=/bin/echo _BBB_YQ=/bin/echo
expect_rc "merge: yq is not taken from the environment" 0
expect_file "merge: real yq used" "$WORK/m/yq.yml" "a: 2
"
ln -s /nonexistent "$Y/dangling.yml"
run_lib "bbb_merge_yaml '$Y/m-base.yml' '$Y/dangling.yml' '$WORK/m/dang.yml'"
expect_rc "merge: dangling-symlink override fails" 1
expect_err_contains "merge: names the dangling override" "dangling.yml"
mkdir -p "$Y/ovdir.yml"
run_lib "bbb_merge_yaml '$Y/m-base.yml' '$Y/ovdir.yml' '$WORK/m/dir.yml'"
expect_err_contains "merge: directory override says so" "is a directory"

echo
echo "$PASSED passed, $FAILED failed"
[ "$FAILED" -eq 0 ]
