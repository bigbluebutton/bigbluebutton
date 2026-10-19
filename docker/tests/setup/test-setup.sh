#!/usr/bin/env bash
# Tests of the setup image (docker/setup): runs it on throwaway project directories and checks
# the .env it writes against docker/config-contract.yaml (read independently of the image, with
# the contract runner, docker/tests/contract/run.sh).
#
# Usage: docker/tests/setup/test-setup.sh [IMAGE]
#   IMAGE   the setup image (default localhost/bbb-setup:4.0.1; build it with
#           docker/tests/buildkit/build.sh --tag 4.0.1 setup, or podman build, see its Dockerfile)
#   CONTAINER_ENGINE=docker|podman   engine to use (default: docker if installed, else podman)
#
# The image runs as the compose service does: no network, read-only root, only CHOWN and
# DAC_OVERRIDE. Generated values are never printed: only variable names appear in the output.
# Prints `ok <case>` / `FAIL <case>: ...` and `SETUP TESTS: PASS|FAIL`. Exit 0 pass, 1 fail,
# 2 usage or engine error.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../../.." && pwd)"
IMAGE="${1:-localhost/bbb-setup:4.0.1}"
[ $# -le 1 ] || { sed -n '2,/^$/{s/^# \{0,1\}//;p}' "$0" >&2; exit 2; }

ENGINE="${CONTAINER_ENGINE:-}"
if [ -z "$ENGINE" ]; then
    if command -v docker >/dev/null 2>&1; then ENGINE=docker; else ENGINE=podman; fi
fi
command -v "$ENGINE" >/dev/null 2>&1 || { echo "$ENGINE not found" >&2; exit 2; }
"$ENGINE" image inspect "$IMAGE" >/dev/null 2>&1 || { echo "image $IMAGE not found" >&2; exit 2; }

# Contract, read with the contract runner's yq: NAME<TAB>setup<TAB>required<TAB>secret<TAB>pattern
# for every variable with a setup mode.
CONTRACT_TSV="$("$REPO/docker/tests/contract/run.sh" yq -r \
    '.variables[] | select(.setup != null) | [.name, .setup, .required, .secret, .pattern] | @tsv' \
    docker/config-contract.yaml)" || { echo "cannot read the contract" >&2; exit 2; }
[ -n "$CONTRACT_TSV" ] || { echo "no setup variables in the contract" >&2; exit 2; }

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
FAILED=0
fail() { echo "FAIL $1: $2"; FAILED=1; }
ok() { echo "ok $1"; }

# Fixture values (the project's test fixtures) used as input.
DOMAIN=bbb.example.com
EMAIL=admin@example.com
IPV4=203.0.113.10
FIXTURE_SECRET=fixturebbbsharedsecretnotreal0000000000000000000

# run DIR [ENGINE-ARGS...] -- [SETUP-ARGS...] — run setup on DIR; output in $WORK/out, status in RC.
run() {
    local dir="$1" engine_args=()
    shift
    while [ $# -gt 0 ] && [ "$1" != -- ]; do engine_args+=("$1"); shift; done
    [ "${1:-}" = -- ] && shift
    RC=0
    "$ENGINE" run --rm -i --network none --read-only --tmpfs /tmp \
        --cap-drop ALL --cap-add CHOWN --cap-add DAC_OVERRIDE --security-opt no-new-privileges \
        --security-opt label=disable -v "$dir:/project" "${engine_args[@]}" "$IMAGE" "$@" \
        >"$WORK/out" 2>&1 || RC=$?
}

# value FILE NAME — the value of NAME in FILE (last line), as compose reads it: surrounding
# quotes removed, or for an unquoted value an inline ` #` comment and trailing blanks.
value() {
    local v
    v="$(sed -n "s/^$2=//p" "$1" | tail -n 1)"
    case "$v" in
        \"*\") v="${v#\"}"; v="${v%\"}" ;;
        *) v="${v%%[[:space:]]#*}"; v="${v%"${v##*[![:space:]]}"}" ;;
    esac
    printf '%s' "$v"
}

# check_env CASE FILE — every setup variable present and matching its pattern, required ones
# non-empty, secrets distinct, mode 0600; no secret value in $WORK/out.
check_env() {
    local case="$1" file="$2" name required secret pattern v re bad=0
    declare -A seen=()
    [ -f "$file" ] || { fail "$case" "no .env written"; return 1; }
    [ "$(stat -c %a "$file")" = 600 ] || { fail "$case" "mode $(stat -c %a "$file"), not 600"; bad=1; }
    while IFS=$'\t' read -r name _ required secret pattern; do
        if ! grep -q "^$name=" "$file"; then fail "$case" "$name missing"; bad=1; continue; fi
        v="$(value "$file" "$name")"
        re="^($pattern)\$"
        if [ -z "$v" ]; then
            [ "$required" = true ] && { fail "$case" "$name empty"; bad=1; }
        elif ! [[ "$v" =~ $re ]]; then
            fail "$case" "$name does not match its pattern"; bad=1
        fi
        if [ "$secret" = true ] && [ -n "$v" ]; then
            if [ -n "${seen[$v]:-}" ]; then fail "$case" "$name equals ${seen[$v]}"; bad=1; fi
            seen[$v]="$name"
            if grep -qF -- "$v" "$WORK/out"; then fail "$case" "the value of $name appears in the output"; bad=1; fi
        fi
    done <<<"$CONTRACT_TSV"
    return "$bad"
}

new_dir() { local d="$WORK/$1"; mkdir -p "$d"; printf '%s' "$d"; }
fingerprint() {
    [ -f "$1" ] || { echo missing; return 0; }
    stat -c '%i %Y %a' "$1"
    sha256sum "$1" | cut -d ' ' -f 1
}

# 1. fresh directory, --non-interactive with the asked values in the environment
d="$(new_dir fresh)"
run "$d" -e BBB_DOMAIN="$DOMAIN" -e ACME_EMAIL="$EMAIL" -e BBB_PUBLIC_IPV4="$IPV4" -- --non-interactive
if [ "$RC" -ne 0 ]; then fail fresh "exit $RC: $(cat "$WORK/out")"
elif check_env fresh "$d/.env"; then
    # shellcheck disable=SC2016 # the literal line of .env.sample
    if [ "$(value "$d/.env" BBB_DOMAIN)" = "$DOMAIN" ] && grep -qx 'BBB_FEATURES=recording' "$d/.env" &&
        grep -qx 'COMPOSE_PROFILES=${BBB_FEATURES-recording}' "$d/.env"; then
        ok fresh
    else fail fresh "asked values or the sample's lines not as expected"; fi
fi
# no .env.setup.* temporary files left behind
if compgen -G "$d/.env.setup.*" >/dev/null; then fail fresh-tmp "temporary file left in the directory"; else ok fresh-tmp; fi

# 2. second run changes nothing (same inode, mtime, mode and content); also interactive with
#    no input: nothing is asked
before="$(fingerprint "$d/.env")"
sleep 1
run "$d" -- --non-interactive
if [ "$RC" -eq 0 ] && [ "$(fingerprint "$d/.env")" = "$before" ] && grep -q 'nothing changed' "$WORK/out"; then
    ok rerun
else fail rerun "exit $RC or .env changed"; fi
run "$d" -- </dev/null
if [ "$RC" -eq 0 ] && [ "$(fingerprint "$d/.env")" = "$before" ]; then ok rerun-interactive
else fail rerun-interactive "exit $RC or .env changed"; fi

# 3. values already set are kept, also against the environment; an optional empty value is a
#    choice (BBB_FEATURES= : no features); missing lines are appended
d="$(new_dir preset)"
cat >"$d/.env" <<EOF
# my settings
BBB_DOMAIN=$DOMAIN
BBB_SHARED_SECRET="$FIXTURE_SECRET"
BBB_FEATURES=
BBB_PUBLIC_IPV4=$IPV4   # floating IP
CUSTOM_LINE=kept as is
EOF
chmod 0644 "$d/.env"
run "$d" -e BBB_DOMAIN=other.example.org -e ACME_EMAIL="$EMAIL" -- --non-interactive
if [ "$RC" -ne 0 ]; then fail preset "exit $RC: $(cat "$WORK/out")"
elif check_env preset "$d/.env"; then
    if grep -qx "BBB_DOMAIN=$DOMAIN" "$d/.env" && grep -qx "BBB_SHARED_SECRET=\"$FIXTURE_SECRET\"" "$d/.env" &&
        grep -qx 'BBB_FEATURES=' "$d/.env" && grep -qx 'CUSTOM_LINE=kept as is' "$d/.env" &&
        grep -qx '# my settings' "$d/.env" && grep -qx "BBB_PUBLIC_IPV4=$IPV4   # floating IP" "$d/.env" &&
        grep -q 'kept (already set): BBB_DOMAIN BBB_PUBLIC_IPV4 BBB_SHARED_SECRET BBB_FEATURES' "$WORK/out" &&
        [ "$(grep -c '^BBB_DOMAIN=' "$d/.env")" = 1 ]; then
        ok preset
    else fail preset "a preset value or line was changed, or the kept names are not reported"; fi
fi

# 4. --non-interactive without the required input: non-zero, names the variables, writes nothing
d="$(new_dir missing)"
run "$d" -- --non-interactive
if [ "$RC" -ne 0 ] && grep -q 'missing required value(s): BBB_DOMAIN BBB_PUBLIC_IPV4 ACME_EMAIL' "$WORK/out" &&
    [ -z "$(ls -A "$d")" ]; then
    ok missing-input
else fail missing-input "exit $RC, output: $(cat "$WORK/out")"; fi

# 5. an invalid value from the environment: non-zero, names the variable, writes nothing
d="$(new_dir invalid)"
run "$d" -e BBB_DOMAIN='not a domain' -e ACME_EMAIL="$EMAIL" -e BBB_PUBLIC_IPV4="$IPV4" -- --non-interactive
if [ "$RC" -ne 0 ] && grep -q 'BBB_DOMAIN does not match its format' "$WORK/out" && [ -z "$(ls -A "$d")" ]; then
    ok invalid-input
else fail invalid-input "exit $RC, output: $(cat "$WORK/out")"; fi

# 6. an invalid value already in .env: non-zero, names it, .env untouched
d="$(new_dir invalid-kept)"
printf 'LIVEKIT_API_KEY=short\n' >"$d/.env"
before="$(fingerprint "$d/.env")"
run "$d" -e BBB_DOMAIN="$DOMAIN" -e ACME_EMAIL="$EMAIL" -e BBB_PUBLIC_IPV4="$IPV4" -- --non-interactive
if [ "$RC" -ne 0 ] && grep -q "LIVEKIT_API_KEY in /project/.env does not match its format" "$WORK/out" &&
    [ "$(fingerprint "$d/.env")" = "$before" ]; then
    ok invalid-kept
else fail invalid-kept "exit $RC, output: $(cat "$WORK/out")"; fi

# 7. interactive: answers on stdin, a wrong answer is asked again; Enter takes the proposal
#    (none for IPv6; BBB_FEATURES takes its default, recording); no address is detected without
#    a network
d="$(new_dir interactive)"
printf '%s\n' 'bad domain' "$DOMAIN" "$IPV4" '' "$EMAIL" '' >"$WORK/answers"
run "$d" -- <"$WORK/answers"
if [ "$RC" -ne 0 ]; then fail interactive "exit $RC: $(cat "$WORK/out")"
elif check_env interactive "$d/.env"; then
    if [ "$(value "$d/.env" BBB_DOMAIN)" = "$DOMAIN" ] && [ "$(value "$d/.env" BBB_PUBLIC_IPV4)" = "$IPV4" ] &&
        [ "$(value "$d/.env" ACME_EMAIL)" = "$EMAIL" ] && grep -qx 'BBB_FEATURES=recording' "$d/.env" &&
        [ -z "$(value "$d/.env" BBB_PUBLIC_IPV6)" ] && grep -q 'BBB_DOMAIN must match' "$WORK/out" &&
        grep -q 'BBB_PUBLIC_IPV4: no address found locally' "$WORK/out"; then
        ok interactive
    else fail interactive "answers not written as given"; fi
fi

# 8. interactive, end of input before all answers: non-zero, names the variable, writes nothing
d="$(new_dir eof)"
printf '%s\n' "$DOMAIN" >"$WORK/answers"
run "$d" -- <"$WORK/answers"
if [ "$RC" -ne 0 ] && grep -q 'no answer for BBB_PUBLIC_IPV4' "$WORK/out" && [ -z "$(ls -A "$d")" ]; then
    ok interactive-eof
else fail interactive-eof "exit $RC, output: $(cat "$WORK/out")"; fi

# 9. a complete .env with a wider mode: rewritten with mode 0600, content unchanged
d="$(new_dir mode)"
[ -f "$WORK/fresh/.env" ] && cp "$WORK/fresh/.env" "$d/.env"
[ -f "$d/.env" ] && chmod 0644 "$d/.env"
sum="$(fingerprint "$d/.env" | tail -n 1)"
run "$d" -- --non-interactive
if [ "$RC" -eq 0 ] && [ "$(fingerprint "$d/.env" | sed -n '1s/.* //p')" = 600 ] &&
    [ "$(fingerprint "$d/.env" | tail -n 1)" = "$sum" ]; then
    ok mode-0600
else fail mode-0600 "exit $RC, or mode not 600, or content changed"; fi

# 10. two fresh runs generate different secrets
d="$(new_dir fresh2)"
run "$d" -e BBB_DOMAIN="$DOMAIN" -e ACME_EMAIL="$EMAIL" -e BBB_PUBLIC_IPV4="$IPV4" -- --non-interactive
if [ "$RC" -eq 0 ] && [ "$(value "$d/.env" BBB_SHARED_SECRET)" != "$(value "$WORK/fresh/.env" BBB_SHARED_SECRET)" ]; then
    ok random
else fail random "exit $RC or the same secret twice"; fi

# 11. as any non-root user (--user UID:GID, no capabilities), in a directory it may write to
d="$(new_dir user)"
chmod 0777 "$d"
run "$d" --user 12345:12345 --cap-drop ALL \
    -e BBB_DOMAIN="$DOMAIN" -e ACME_EMAIL="$EMAIL" -e BBB_PUBLIC_IPV4="$IPV4" -- --non-interactive
# The file belongs to that user (mode 0600): read it back as that user.
owner="$("$ENGINE" run --rm --network none --user 12345:12345 --security-opt label=disable -v "$d:/project" \
    --entrypoint stat "$IMAGE" -c '%u:%g %a' /project/.env 2>/dev/null || true)"
( umask 077; "$ENGINE" run --rm --network none --user 12345:12345 --security-opt label=disable \
    -v "$d:/project" --entrypoint cat "$IMAGE" /project/.env >"$WORK/user.env" 2>/dev/null || true )
if [ "$RC" -eq 0 ] && [ "$owner" = '12345:12345 600' ] && check_env any-user "$WORK/user.env"; then ok any-user
else fail any-user "exit $RC, owner/mode '$owner'"; fi

if [ "$FAILED" -eq 0 ]; then echo "SETUP TESTS: PASS"; else echo "SETUP TESTS: FAIL"; exit 1; fi
