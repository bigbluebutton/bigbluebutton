#!/usr/bin/env bash
# Build the test-runner image for docker/lib/entrypoint-lib.sh and run the tests in it.
#
# Usage: docker/tests/lib/run.sh
#   CONTAINER_ENGINE=docker|podman   engine to use (default: docker if installed, else podman)
#   BBB_TEST_IMAGE=<name:tag>        image name (default: bbb-entrypoint-lib-test:local)
#
# Runs the interface tests (test-entrypoint-lib.sh), then the additional tests
# (test-entrypoint-lib-extra.sh). Exits 0 only if both pass.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../../.." && pwd)"
YQ_PKG="$REPO/build/packages-template/bbb-yq-go"
IMAGE="${BBB_TEST_IMAGE:-bbb-entrypoint-lib-test:local}"

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

# Minimal build context: no need to send the whole repository.
CTX="$(mktemp -d)"
trap 'rm -rf "$CTX"' EXIT
mkdir -p "$CTX/bbb-yq-go"
cp "$HERE/Dockerfile" "$CTX/"
cp "$YQ_PKG/build.sh" "$YQ_PKG/bbb-yq-go.sha256sum" "$CTX/bbb-yq-go/"
cp -R "$REPO/docker/lib" "$CTX/lib"
cp -R "$HERE" "$CTX/tests"

echo "Building $IMAGE with $ENGINE (yq $YQ_VERSION)"
if ! "$ENGINE" build --build-arg "YQ_VERSION=$YQ_VERSION" -t "$IMAGE" "$CTX" >"$CTX/build.log" 2>&1; then
    cat "$CTX/build.log" >&2
    echo "image build failed" >&2
    exit 1
fi

echo "== tool versions in $IMAGE"
"$ENGINE" run --rm "$IMAGE" sh -c \
    'dpkg-query -W bash gettext-base; yq --version; envsubst --version | head -n 1'

rc=0
echo "== test-entrypoint-lib.sh"
"$ENGINE" run --rm "$IMAGE" /src/docker/tests/lib/test-entrypoint-lib.sh || rc=1
if [ -f "$HERE/test-entrypoint-lib-extra.sh" ]; then
    echo "== test-entrypoint-lib-extra.sh"
    "$ENGINE" run --rm "$IMAGE" /src/docker/tests/lib/test-entrypoint-lib-extra.sh || rc=1
fi
exit "$rc"
