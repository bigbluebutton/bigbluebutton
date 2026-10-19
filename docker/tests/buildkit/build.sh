#!/usr/bin/env bash
# Build bake targets with BuildKit, the builder of `docker buildx bake`, on a host that has only
# podman, and load the images into podman. Podman builds with buildah, which differs from
# BuildKit in details that matter at runtime (for example the mode of the parent directories
# that `COPY --chmod` creates, see docker/tests/dirmodes/check.sh), so images tested only with
# `podman build` can still break when built with Docker.
#
# Usage: docker/tests/buildkit/build.sh [--tag TAG] TARGET...
#
#   --tag TAG   tag of the loaded images (bake variable BBB_IMAGE_TAG, default `buildkit`):
#               localhost/bbb-<image>:TAG. Targets without tags (build stages) load untagged.
#   TARGET      bake targets, as in `docker buildx bake` (docker/README.md, "Building").
#   COMMIT_DATE (environment) is passed to bake: the html5 client's build identifier
#               (empty: `0`, as in docker-checks.yml).
#
# How: a BuildKit daemon runs in a podman container (BUILDKITD_NAME, default bbb-buildkitd,
# started if it is not running; its cache is the volume BUILDKITD_NAME-state). The docker CLI
# image runs `docker buildx bake` with the bake files of this repository against that daemon
# (remote driver), so named contexts, `target:` contexts and tags are exactly what bake passes.
# Each target is exported as a docker archive and loaded with `podman load`.
#
# Versions: BuildKit v0.34.0 and buildx of Docker 29.9.1, the Docker Engine the stack was
# tested with (dockerd 29.9.1 is built with github.com/moby/buildkit v0.34.0). The daemon
# container runs privileged (rootless podman: privileged within the user namespace only).
#
# Stop the daemon with `podman rm -f bbb-buildkitd`; remove its cache with
# `podman volume rm bbb-buildkitd-state`.
#
# Exit status: 0 all targets built and loaded, 1 build or load failed, 2 usage or engine error.

set -euo pipefail

# moby/buildkit:v0.34.0 (multi-arch index)
BUILDKIT_IMAGE="docker.io/moby/buildkit@sha256:b059f8d7226d0b326bc871af489a5dddf65e36af4d20d14251b072974d9ee87c"
# docker:29.9.1-cli (multi-arch index): docker CLI with buildx
DOCKER_CLI_IMAGE="docker.io/library/docker@sha256:6fae2214c3121a28d5aa639d09032f61310b7c9c75ffbad1025f261a1b621800"

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../../.." && pwd)"
NAME="${BUILDKITD_NAME:-bbb-buildkitd}"

usage() { sed -n '2,/^$/{s/^# \{0,1\}//;p}' "$0" >&2; exit 2; }

tag="buildkit"
while [ $# -gt 0 ]; do
    case "$1" in
        --tag) [ $# -ge 2 ] || usage; tag="$2"; shift 2 ;;
        -h | --help) usage ;;
        -*) echo "unknown option: $1" >&2; usage ;;
        *) break ;;
    esac
done
[ $# -ge 1 ] || usage
[[ "$tag" =~ ^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$ ]] || { echo "invalid tag: $tag" >&2; exit 2; }
for t in "$@"; do
    [[ "$t" =~ ^[A-Za-z0-9_-]+$ ]] || { echo "invalid target name: $t" >&2; exit 2; }
done
command -v podman >/dev/null 2>&1 || { echo "podman not found" >&2; exit 2; }

if [ "$(podman inspect -f '{{.State.Running}}' "$NAME" 2>/dev/null || true)" != "true" ]; then
    podman rm -f "$NAME" >/dev/null 2>&1 || true
    echo "starting BuildKit daemon $NAME"
    podman run -d --name "$NAME" --privileged \
        -v "$NAME-state:/var/lib/buildkit" \
        "$BUILDKIT_IMAGE" --addr tcp://127.0.0.1:1234 >/dev/null
    for _ in $(seq 30); do
        podman exec "$NAME" buildctl --addr tcp://127.0.0.1:1234 debug workers >/dev/null 2>&1 && break
        sleep 1
    done
    podman exec "$NAME" buildctl --addr tcp://127.0.0.1:1234 debug workers >/dev/null \
        || { echo "BuildKit daemon $NAME did not start" >&2; podman logs "$NAME" >&2; exit 2; }
fi

out="$(mktemp -d)"
trap 'rm -rf "$out"' EXIT
chmod 0777 "$out"

bake_files=(-f docker-bake.hcl)
for f in "$REPO"/docker/bake/*.hcl; do bake_files+=(-f "docker/bake/${f##*/}"); done
sets=()
for t in "$@"; do sets+=(--set "$t.output=type=docker,dest=/out/$t.tar"); done

# The repository is mounted read-only; label=disable lets SELinux hosts read it unrelabelled.
# The CLI shares the daemon's network namespace to reach it on 127.0.0.1.
rc=0
podman run --rm --network "container:$NAME" --security-opt label=disable \
    -v "$REPO:/src:ro" -v "$out:/out" -w /src \
    -e BBB_IMAGE_TAG="$tag" -e COMMIT_DATE="${COMMIT_DATE:-}" -e BUILDX_GIT_INFO=false \
    "$DOCKER_CLI_IMAGE" sh -euc '
        docker buildx create --name bbb-buildkitd --driver remote tcp://127.0.0.1:1234 --use >/dev/null
        exec docker buildx bake --allow fs.write=/out --progress plain --provenance false "$@"
    ' sh "${bake_files[@]}" "${sets[@]}" "$@" || rc=$?
[ "$rc" -eq 0 ] || { echo "bake failed (exit $rc)" >&2; exit 1; }

for t in "$@"; do
    podman load -q -i "$out/$t.tar" || { echo "loading $t failed" >&2; exit 1; }
done
