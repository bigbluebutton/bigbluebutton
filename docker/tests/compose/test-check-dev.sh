#!/usr/bin/env bash
# Tests for docker/tests/compose/check-dev.sh: the repository's compose.dev.yml passes, and
# modified copies of it give the expected findings.
#
# Usage: docker/tests/compose/test-check-dev.sh [--repo DIR] [--bake-json FILE]
#   (needs bash, yq v4, a compose CLI; without --bake-json the bake cases are skipped unless
#   `docker buildx` is available)

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="$HERE/check-dev.sh"
REPO="$(cd "$HERE/../../.." && pwd)"
BAKE_ARGS=()
while [ $# -gt 0 ]; do
    case "$1" in
        --repo) REPO="$(cd "$2" && pwd)"; shift 2 ;;
        --bake-json) BAKE_ARGS=(--bake-json "$(cd "$(dirname "$2")" && pwd)/$(basename "$2")"); shift 2 ;;
        *) echo "unknown argument: $1" >&2; exit 2 ;;
    esac
done
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

PASSED=0
FAILED=0
pass() { PASSED=$((PASSED + 1)); echo "ok   $1"; }
fail() { FAILED=$((FAILED + 1)); echo "FAIL $1${2:+: $2}"; }

# variant NAME YQ-EXPRESSION: a copy of the two compose files with compose.dev.yml modified
# (paths stay those of the repository).
variant() {
    local dir="$WORK/$1"
    mkdir -p "$dir"
    cp "$REPO/docker-compose.yml" "$dir/"
    yq "$2" "$REPO/compose.dev.yml" >"$dir/compose.dev.yml" 2>"$dir/yq.err" || { cat "$dir/yq.err" >&2; exit 2; }
    ln -sfn "$REPO/docker-bake.hcl" "$dir/docker-bake.hcl"
    mkdir -p "$dir/docker"
    ln -sfn "$REPO/docker/bake" "$dir/docker/bake"
    printf '%s' "$dir"
}
run() { # repo-dir [args]
    set +e
    "$SCRIPT" --repo "$@" >"$WORK/out" 2>"$WORK/err"
    RC=$?
    set -e
    OUT="$(cat "$WORK/out" "$WORK/err")"
}
expect() { # name rc [rule subject]
    if [ "$RC" -ne "$2" ]; then fail "$1" "exit $RC, expected $2: $OUT"; return; fi
    if [ -n "${3:-}" ] && ! grep -qE "^VIOLATION $3: $4: " "$WORK/out"; then
        fail "$1" "no 'VIOLATION $3: $4:' in: $OUT"; return
    fi
    pass "$1"
}

run "$REPO" "${BAKE_ARGS[@]}"
expect "the repository's compose.dev.yml has no finding" 0

d="$(variant no-build 'del(.services.coturn.build)')"
run "$d" --no-bake
expect "a BBB image without build is a finding" 1 build coturn

d="$(variant image 'with(.services.redis; .image = "docker.io/library/redis:7.4")')"
run "$d" --no-bake
expect "a changed image of docker-compose.yml is a finding" 1 image redis

d="$(variant extra '.services.extra = {"image": "docker.io/library/alpine:3.20", "command": ["true"]}')"
run "$d" --no-bake
expect "an added service that would start is a finding" 1 dev-service extra

d="$(variant builder 'with(.services["bbb-web-build"]; .image = "localhost/bbb-web-build:other")')"
run "$d" --no-bake
expect "a builder whose image no service builds is a finding" 1 build bbb-web-build

d="$(variant invalid '.services["bbb-web"].build.additional_contexts["java-base"] = "service:no-such-service"')"
run "$d" --no-bake
expect "a named context of an unknown service is invalid" 1 config-invalid compose

if [ "${#BAKE_ARGS[@]}" -gt 0 ] || { command -v docker >/dev/null 2>&1 && docker buildx version >/dev/null 2>&1; }; then
    d="$(variant context '.services.livekit.build.additional_contexts["bbb-livekit"] = "./build/packages-template/bbb-webrtc-sfu"')"
    run "$d" "${BAKE_ARGS[@]}"
    expect "a named context that differs from bake is a finding" 1 bake livekit

    d="$(variant arg '.services.playback.build.args.BBB_PLAYBACK_BUILD = "0000000"')"
    run "$d" "${BAKE_ARGS[@]}"
    expect "a build argument that differs from bake is a finding" 1 bake playback

    d="$(variant stage 'del(.services["bbb-common-web"].build.additional_contexts)')"
    run "$d" "${BAKE_ARGS[@]}"
    expect "a build stage that differs from bake is a finding" 1 bake bbb-common-web
else
    echo "NOTICE: bake cases SKIPPED (no --bake-json, no docker buildx)"
fi

echo "passed $PASSED, failed $FAILED"
[ "$FAILED" -eq 0 ]
