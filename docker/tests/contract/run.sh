#!/usr/bin/env bash
# Build the contract tools runner image and run a command in it with the repository mounted.
#
# Usage: docker/tests/contract/run.sh [--write] [COMMAND [ARGS...]]
#   no COMMAND   run docker/tests/contract/test-contract.sh (repository mounted read-only)
#   --write      mount the repository writable and run as the calling user, e.g.
#                docker/tests/contract/run.sh --write docker/contract/generate.sh
#   CONTAINER_ENGINE=docker|podman   engine to use (default: docker if installed, else podman)
#   BBB_TEST_IMAGE=<name:tag>        image name (default: bbb-contract-test:local)

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../../.." && pwd)"
YQ_PKG="$REPO/build/packages-template/bbb-yq-go"
IMAGE="${BBB_TEST_IMAGE:-bbb-contract-test:local}"

WRITE=0
if [ "${1:-}" = --write ]; then WRITE=1; shift; fi
[ $# -gt 0 ] || set -- docker/tests/contract/test-contract.sh

ENGINE="${CONTAINER_ENGINE:-}"
if [ -z "$ENGINE" ]; then
    if command -v docker >/dev/null 2>&1; then ENGINE=docker; else ENGINE=podman; fi
fi
case "$ENGINE" in
    docker | podman) ;;
    *) echo "CONTAINER_ENGINE must be docker or podman, got '$ENGINE'" >&2; exit 2 ;;
esac
command -v "$ENGINE" >/dev/null 2>&1 || { echo "$ENGINE not found" >&2; exit 2; }

YQ_VERSION="$(sed -n 's/^YQ_VERSION=//p' "$YQ_PKG/build.sh")"
[ -n "$YQ_VERSION" ] || { echo "YQ_VERSION not found in $YQ_PKG/build.sh" >&2; exit 2; }

CTX="$(mktemp -d)"
trap 'rm -rf "$CTX"' EXIT
mkdir -p "$CTX/bbb-yq-go"
cp "$HERE/Dockerfile" "$CTX/"
cp "$YQ_PKG/build.sh" "$YQ_PKG/bbb-yq-go.sha256sum" "$CTX/bbb-yq-go/"

echo "Building $IMAGE with $ENGINE (yq $YQ_VERSION)" >&2
if ! "$ENGINE" build --build-arg "YQ_VERSION=$YQ_VERSION" -t "$IMAGE" "$CTX" >"$CTX/build.log" 2>&1; then
    cat "$CTX/build.log" >&2
    echo "image build failed" >&2
    exit 1
fi

RUN_ARGS=(--rm)
if [ "$WRITE" -eq 1 ]; then
    RUN_ARGS+=(-v "$REPO:/src:z" --user "$(id -u):$(id -g)")
    [ "$ENGINE" = podman ] && RUN_ARGS+=(--userns=keep-id)
else
    RUN_ARGS+=(-v "$REPO:/src:ro,z")
fi
exec "$ENGINE" run "${RUN_ARGS[@]}" "$IMAGE" "$@"
