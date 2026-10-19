#!/usr/bin/env bash
# Run hadolint (pinned image) with docker/.hadolint.yaml over every Dockerfile in the repository.
#
# Usage: docker/tests/lint/run.sh [DOCKERFILE...]
#   Without arguments: every tracked file named Dockerfile or *.Dockerfile (git ls-files).
#   CONTAINER_ENGINE=docker|podman   engine to use (default: docker if installed, else podman)
#
# Prints the findings per Dockerfile. Exit status: 0 no findings at or above hadolint's failure
# threshold, 1 findings, 2 usage or engine error.

set -euo pipefail

# hadolint/hadolint:v2.15.1 (multi-arch index)
HADOLINT_IMAGE="docker.io/hadolint/hadolint@sha256:32dac94127fd60b7b7e3fbfc65e1383b9b5e25c9bfd7b8536de7a539fe68a12d"

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../../.." && pwd)"
CONFIG="docker/.hadolint.yaml"

ENGINE="${CONTAINER_ENGINE:-}"
if [ -z "$ENGINE" ]; then
    if command -v docker >/dev/null 2>&1; then ENGINE=docker; else ENGINE=podman; fi
fi
case "$ENGINE" in
    docker | podman) ;;
    *) echo "CONTAINER_ENGINE must be docker or podman, got '$ENGINE'" >&2; exit 2 ;;
esac
command -v "$ENGINE" >/dev/null 2>&1 || { echo "$ENGINE not found" >&2; exit 2; }

files=()
if [ $# -gt 0 ]; then
    for f in "$@"; do
        [ -f "$REPO/$f" ] || { echo "not a file below the repository root: $f" >&2; exit 2; }
        files+=("$f")
    done
else
    while IFS= read -r f; do
        # Not built until the recording stack is reworked (docker-bake.hcl default group).
        [ "$f" = record-and-playback/Dockerfile ] && { echo "== $f: skipped (not built yet)"; continue; }
        files+=("$f")
    done < <(
        git -C "$REPO" ls-files -- '*Dockerfile' '*.Dockerfile' '*/Dockerfile.*' | sort
    )
fi
[ "${#files[@]}" -gt 0 ] || { echo "no Dockerfiles found" >&2; exit 2; }

# The repository is mounted read-only; label=disable lets SELinux hosts read it unrelabelled.
# Pull once up front, so that pull progress is never mistaken for findings of the first file.
"$ENGINE" image inspect "$HADOLINT_IMAGE" >/dev/null 2>&1 \
    || "$ENGINE" pull -q "$HADOLINT_IMAGE" >/dev/null \
    || { echo "cannot pull $HADOLINT_IMAGE" >&2; exit 2; }

rc=0
for f in "${files[@]}"; do
    out="$("$ENGINE" run --rm --network none --security-opt label=disable \
        -v "$REPO:/repo:ro" -w /repo "$HADOLINT_IMAGE" \
        hadolint --config "$CONFIG" --no-color "$f" 2>&1)" || {
        status=$?
        # hadolint exits 1 for findings; anything else is a tool or engine error.
        [ "$status" -eq 1 ] || { printf '%s\n' "$out" >&2; echo "hadolint failed on $f (exit $status)" >&2; exit 2; }
        rc=1
    }
    if [ -n "$out" ]; then
        echo "== $f: $(printf '%s\n' "$out" | grep -c .) finding(s)"
        printf '%s\n' "$out"
    else
        echo "== $f: clean"
    fi
done
exit "$rc"
