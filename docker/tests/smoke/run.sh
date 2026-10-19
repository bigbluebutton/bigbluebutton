#!/usr/bin/env bash
# Build the test-runner image for docker/tests/smoke/api-smoke.sh and run the tests in it.
#
# Usage: docker/tests/smoke/run.sh
#   CONTAINER_ENGINE=docker|podman   engine to use (default: docker if installed, else podman)
#   BBB_TEST_IMAGE=<name:tag>        image name (default: bbb-api-smoke-test:local)
#
# Runs the interface tests (test-api-smoke.sh) against the API mock, then the additional
# tests (test-api-smoke-extra.sh). Exits 0 only if both pass.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IMAGE="${BBB_TEST_IMAGE:-bbb-api-smoke-test:local}"

ENGINE="${CONTAINER_ENGINE:-}"
if [ -z "$ENGINE" ]; then
    if command -v docker >/dev/null 2>&1; then ENGINE=docker; else ENGINE=podman; fi
fi
case "$ENGINE" in
    docker | podman) ;;
    *) echo "CONTAINER_ENGINE must be docker or podman, got '$ENGINE'" >&2; exit 2 ;;
esac
command -v "$ENGINE" >/dev/null 2>&1 || { echo "$ENGINE not found" >&2; exit 2; }

# Minimal build context: the smoke test directory only.
CTX="$(mktemp -d)"
trap 'rm -rf "$CTX"' EXIT
mkdir -p "$CTX/tests"
cp "$HERE"/*.sh "$CTX/tests/"
mkdir -p "$CTX/tests/mock"
cp "$HERE/mock/bbb_api_mock.py" "$CTX/tests/mock/"

# The runner only needs bash, coreutils, curl and python3 (for the mock). The digest-pinned
# base is the reproducibility anchor; installed versions are printed before the tests.
cat >"$CTX/Dockerfile" <<'EOF'
# ubuntu:24.04
FROM docker.io/library/ubuntu@sha256:534baea6a22c03a63003dbc8dbe78fe34bc0d7e595d9a9dc9834884ff530eb55

# hadolint ignore=DL3008
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl python3 \
    && rm -rf /var/lib/apt/lists/*

COPY tests/ /src/docker/tests/smoke/

USER 65534:65534
WORKDIR /src
ENV TMPDIR=/tmp
CMD ["/src/docker/tests/smoke/test-api-smoke.sh"]
EOF

echo "Building $IMAGE with $ENGINE"
if ! "$ENGINE" build -t "$IMAGE" "$CTX" >"$CTX/build.log" 2>&1; then
    cat "$CTX/build.log" >&2
    echo "image build failed" >&2
    exit 1
fi

echo "== tool versions in $IMAGE"
"$ENGINE" run --rm "$IMAGE" sh -c 'dpkg-query -W bash coreutils curl python3'

rc=0
echo "== test-api-smoke.sh"
"$ENGINE" run --rm "$IMAGE" /src/docker/tests/smoke/test-api-smoke.sh || rc=1
if [ -f "$HERE/test-api-smoke-extra.sh" ]; then
    echo "== test-api-smoke-extra.sh"
    "$ENGINE" run --rm "$IMAGE" /src/docker/tests/smoke/test-api-smoke-extra.sh || rc=1
fi
exit "$rc"
