#!/usr/bin/env bash
# Check that an image runs under an arbitrary UID/GID (docker/README.md, "Running under an
# arbitrary UID/GID"). Every probe runs the image as --user UID:GID with no passwd entry for
# that UID, as Docker Compose (`user: "${BBB_UID}:${BBB_GID}"`) and Kubernetes (`runAsUser`) do.
#
# Usage: docker/tests/uid/check.sh [OPTIONS] IMAGE [-- COMMAND [ARGS...]]
#
#   --user UID:GID     identity to run as (default 12345:12345)
#   --env-file FILE    environment for the probes (e.g. docker/tests/golden/<image>/fixture.env)
#   --writable PATH    PATH must be writable at runtime (a directory the entrypoint renders into
#                      or the service writes). Repeatable.
#   --volume PATH      PATH is a volume mount point: probed with a fresh anonymous volume, which
#                      gets its owner and mode from the image like a new named volume. Repeatable.
#   --no-render        skip the render probe (images without an entrypoint and no COMMAND)
#   -- COMMAND...      run COMMAND instead of the render probe's `--render-only DIR` arguments
#
# Probes:
#   render    IMAGE --render-only /tmp/bbb-uid-check (or COMMAND), with a read-only root
#             filesystem and a tmpfs /tmp. Fails on a non-zero exit or a permission error in
#             the output.
#   writable  for each --writable/--volume PATH: create and remove a file in PATH as UID:GID.
#
#   CONTAINER_ENGINE=docker|podman   engine to use (default: docker if installed, else podman)
#
# Exit status: 0 all probes passed, 1 a probe failed, 2 usage or engine error.

set -euo pipefail

usage() { sed -n '2,/^$/{s/^# \{0,1\}//;p}' "$0" >&2; exit 2; }

user="12345:12345"
env_file=""
render=1
writable=()
volumes=()
while [ $# -gt 0 ]; do
    case "$1" in
        --user) [ $# -ge 2 ] || usage; user="$2"; shift 2 ;;
        --env-file) [ $# -ge 2 ] || usage; env_file="$2"; shift 2 ;;
        --writable) [ $# -ge 2 ] || usage; writable+=("$2"); shift 2 ;;
        --volume) [ $# -ge 2 ] || usage; volumes+=("$2"); shift 2 ;;
        --no-render) render=0; shift ;;
        -h | --help) usage ;;
        -*) echo "unknown option: $1" >&2; usage ;;
        *) break ;;
    esac
done
[ $# -ge 1 ] || usage
image="$1"
shift
if [ $# -gt 0 ]; then
    [ "$1" = "--" ] || { echo "unexpected argument: $1 (COMMAND must follow --)" >&2; usage; }
    shift
    [ $# -gt 0 ] || { echo "-- needs a COMMAND" >&2; usage; }
    cmd=("$@")
else
    cmd=(--render-only /tmp/bbb-uid-check)
fi
[[ "$user" =~ ^[0-9]+:[0-9]+$ ]] || { echo "--user must be numeric UID:GID, got '$user'" >&2; exit 2; }
if [ -n "$env_file" ] && [ ! -f "$env_file" ]; then
    echo "env file not found: $env_file" >&2
    exit 2
fi

engine="${CONTAINER_ENGINE:-}"
if [ -z "$engine" ]; then
    if command -v docker >/dev/null 2>&1; then engine=docker; else engine=podman; fi
fi
case "$engine" in
    docker | podman) ;;
    *) echo "CONTAINER_ENGINE must be docker or podman, got '$engine'" >&2; exit 2 ;;
esac
command -v "$engine" >/dev/null 2>&1 || { echo "$engine not found" >&2; exit 2; }

run_opts=(--rm --user "$user")
# podman adds a passwd entry for --user by default; Docker and Kubernetes do not.
if [ "$engine" = podman ]; then run_opts+=(--passwd=false); fi
if [ -n "$env_file" ]; then run_opts+=(--env-file "$env_file"); fi

# Messages that mean the image assumed a particular user (shell, coreutils, JVM, Node).
perm_re='Permission denied|Operation not permitted|Read-only file system|AccessDeniedException|EACCES|EPERM|EROFS'

failed=0
pass() { echo "PASS $1"; }
fail() { echo "FAIL $1"; failed=1; }

if [ "$render" -eq 1 ]; then
    out="$(mktemp)"
    trap 'rm -f "$out"' EXIT
    rc=0
    "$engine" run "${run_opts[@]}" --read-only --tmpfs /tmp:rw,mode=1777 \
        "$image" "${cmd[@]}" >"$out" 2>&1 || rc=$?
    if [ "$rc" -ne 0 ]; then
        fail "render: exit $rc as $user: ${cmd[*]}"
        sed 's/^/    /' "$out"
    elif grep -Eq "$perm_re" "$out"; then
        fail "render: permission error in output as $user: ${cmd[*]}"
        grep -E "$perm_re" "$out" | sed 's/^/    /'
    else
        pass "render as $user: ${cmd[*]}"
    fi
fi

# Create and remove a file in DIR as the probe user. Needs /bin/sh in the image.
# shellcheck disable=SC2016 # expanded by the container's sh, not here
probe='f="$1/.bbb-uid-check.$$" && : >"$f" && rm -f "$f"'

for path in "${writable[@]}"; do
    if msg="$("$engine" run "${run_opts[@]}" --entrypoint /bin/sh "$image" -c "$probe" sh "$path" 2>&1)"; then
        pass "writable $path as $user"
    else
        fail "writable $path as $user"
        printf '%s\n' "$msg" | sed 's/^/    /'
    fi
done

for path in "${volumes[@]}"; do
    if msg="$("$engine" run "${run_opts[@]}" --mount "type=volume,dst=$path" --entrypoint /bin/sh \
        "$image" -c "$probe" sh "$path" 2>&1)"; then
        pass "volume $path writable as $user"
    else
        fail "volume $path writable as $user"
        printf '%s\n' "$msg" | sed 's/^/    /'
    fi
done

exit "$failed"
