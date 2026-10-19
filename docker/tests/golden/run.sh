#!/usr/bin/env bash
# Run the golden-file runner's tests: test-golden.sh and test-expectations.sh (interface,
# protected), then test-golden-extra.sh (additional behaviour).
#
# Usage: docker/tests/golden/run.sh
#   CONTAINER_ENGINE=docker|podman   engine to use (default: docker if installed, else podman)
#
# The runner runs on the host and starts the images under test with the engine. It needs yq
# (mikefarah v4) for --parity and expectations.yaml. run.sh uses the version upstream pins
# (build/packages-template/bbb-yq-go/build.sh): a `yq` in PATH of exactly that version, else
# the binary built by the `yq` stage of docker/tests/lib/Dockerfile (checksum-verified against
# upstream's bbb-yq-go.sha256sum), copied out once into
# ${XDG_CACHE_HOME:-~/.cache}/bbb-golden/yq-<version>/.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../../.." && pwd)"
YQ_PKG="$REPO/build/packages-template/bbb-yq-go"

ENGINE="${CONTAINER_ENGINE:-}"
if [ -z "$ENGINE" ]; then
    if command -v docker >/dev/null 2>&1; then ENGINE=docker; else ENGINE=podman; fi
fi
case "$ENGINE" in
    docker | podman) ;;
    *) echo "CONTAINER_ENGINE must be docker or podman, got '$ENGINE'" >&2; exit 2 ;;
esac
command -v "$ENGINE" >/dev/null 2>&1 || { echo "$ENGINE not found" >&2; exit 2; }
export CONTAINER_ENGINE="$ENGINE"

YQ_VERSION="$(sed -n 's/^YQ_VERSION=//p' "$YQ_PKG/build.sh")"
[ -n "$YQ_VERSION" ] || { echo "YQ_VERSION not found in $YQ_PKG/build.sh" >&2; exit 2; }

yq_is_pinned() { # binary
    "$1" --version 2>/dev/null | grep -q "mikefarah.* v$YQ_VERSION\$"
}

CACHE="${XDG_CACHE_HOME:-$HOME/.cache}/bbb-golden/yq-$YQ_VERSION"
if command -v yq >/dev/null 2>&1 && yq_is_pinned yq; then
    echo "== yq $YQ_VERSION from PATH"
elif [ -x "$CACHE/yq" ] && yq_is_pinned "$CACHE/yq"; then
    echo "== yq $YQ_VERSION from $CACHE"
    PATH="$CACHE:$PATH"
else
    echo "== building yq $YQ_VERSION with $ENGINE (docker/tests/lib/Dockerfile, stage yq)"
    IMAGE="bbb-golden-yq:$YQ_VERSION"
    CTX="$(mktemp -d)"
    CID=""
    trap 'rm -rf "$CTX"; [ -z "$CID" ] || "$ENGINE" rm -f "$CID" >/dev/null 2>&1 || true' EXIT
    mkdir -p "$CTX/bbb-yq-go"
    cp "$REPO/docker/tests/lib/Dockerfile" "$CTX/"
    cp "$YQ_PKG/build.sh" "$YQ_PKG/bbb-yq-go.sha256sum" "$CTX/bbb-yq-go/"
    if ! "$ENGINE" build --target yq --build-arg "YQ_VERSION=$YQ_VERSION" -t "$IMAGE" "$CTX" \
        >"$CTX/build.log" 2>&1; then
        cat "$CTX/build.log" >&2
        echo "yq image build failed" >&2
        exit 1
    fi
    CID="$("$ENGINE" create "$IMAGE" /usr/local/bin/yq)"
    mkdir -p "$CACHE"
    "$ENGINE" cp "$CID:/usr/local/bin/yq" "$CACHE/yq.new"
    chmod 0755 "$CACHE/yq.new"
    mv "$CACHE/yq.new" "$CACHE/yq"
    yq_is_pinned "$CACHE/yq" || { echo "copied yq is not version $YQ_VERSION" >&2; exit 1; }
    PATH="$CACHE:$PATH"
fi
export PATH
echo "== $ENGINE $("$ENGINE" --version | head -n 1)"

rc=0
echo "== test-golden.sh"
"$HERE/test-golden.sh" || rc=1
echo "== test-expectations.sh"
"$HERE/test-expectations.sh" || rc=1
if [ -f "$HERE/test-golden-extra.sh" ]; then
    echo "== test-golden-extra.sh"
    "$HERE/test-golden-extra.sh" || rc=1
fi
exit "$rc"
