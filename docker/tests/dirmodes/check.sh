#!/usr/bin/env bash
# Check that every directory of an image can be traversed by any UID (execute bit for others),
# as an image that runs under an arbitrary UID/GID needs (docker/README.md, "Running under an
# arbitrary UID/GID", rule 3). Catches what `docker/tests/uid/check.sh` sees only for the paths
# an entrypoint happens to use, for example parent directories that BuildKit creates with the
# mode of `COPY --chmod=0644` (docker/README.md, "Shared entrypoint helper").
#
# Usage: docker/tests/dirmodes/check.sh [--allow PATH]... IMAGE...
#
#   --allow PATH   also accept PATH (absolute; a trailing /* accepts everything below it).
#                  Repeatable.
#   IMAGE          local image (never pulled). Its file system is read with `create` + `export`;
#                  nothing in the image runs, so images without a shell work too.
#
#   CONTAINER_ENGINE=docker|podman   engine to use (default: docker if installed, else podman)
#
# Accepted without --allow: directories that the pinned base images keep private by design
# (ubuntu, debian-based node/postgres/coturn, alpine-based haproxy/nginx), and everything below
# them: /root, /home/*, /etc/ssl/private, /var/cache/apt/archives/partial,
# /var/lib/apt/lists/partial, /var/cache/ldconfig.
#
# Prints `PASS IMAGE`, or `FAIL IMAGE` followed by one line per directory (mode, uid/gid, path).
# Exit status: 0 every image passed, 1 a directory without the execute bit for others, 2 usage
# or engine error.

set -euo pipefail

usage() { sed -n '2,/^$/{s/^# \{0,1\}//;p}' "$0" >&2; exit 2; }

allow=(/root '/home/*' /etc/ssl/private /var/cache/apt/archives/partial /var/lib/apt/lists/partial
    /var/cache/ldconfig)
while [ $# -gt 0 ]; do
    case "$1" in
        --allow)
            [ $# -ge 2 ] || usage
            [[ "$2" == /* ]] || { echo "--allow needs an absolute path, got '$2'" >&2; exit 2; }
            allow+=("${2%/}"); shift 2 ;;
        -h | --help) usage ;;
        -*) echo "unknown option: $1" >&2; usage ;;
        *) break ;;
    esac
done
[ $# -ge 1 ] || usage

engine="${CONTAINER_ENGINE:-}"
if [ -z "$engine" ]; then
    if command -v docker >/dev/null 2>&1; then engine=docker; else engine=podman; fi
fi
case "$engine" in
    docker | podman) ;;
    *) echo "CONTAINER_ENGINE must be docker or podman, got '$engine'" >&2; exit 2 ;;
esac
command -v "$engine" >/dev/null 2>&1 || { echo "$engine not found" >&2; exit 2; }

allowed() {
    local p
    for p in "${allow[@]}"; do
        # shellcheck disable=SC2053 # $p is a glob pattern on purpose (/home/*)
        [[ "$1" == $p || "$1" == $p/* ]] && return 0
    done
    return 1
}

cid=""
listing="$(mktemp)"
trap '[ -z "$cid" ] || "$engine" rm -f "$cid" >/dev/null 2>&1; rm -f "$listing"' EXIT

failed=0
for image in "$@"; do
    "$engine" image inspect "$image" >/dev/null 2>&1 || { echo "image not found locally: $image" >&2; exit 2; }
    # The command is never run; it only satisfies `create` for images without CMD.
    cid="$("$engine" create "$image" true)" || { echo "cannot create a container of $image" >&2; exit 2; }
    # Directories whose mode lacks x (or t) for others: `mode uid/gid path`, path without a
    # trailing slash and with a leading one.
    "$engine" export "$cid" | tar -tvf - --numeric-owner \
        | awk 'substr($1, 1, 1) == "d" && substr($1, 10, 1) != "x" && substr($1, 10, 1) != "t" {
                   path = $0
                   sub(/^([^ ]+ +){5}/, "", path)
                   sub(/\/$/, "", path)
                   print $1, $2, "/" path
               }' >"$listing" \
        || { echo "cannot read the file system of $image" >&2; exit 2; }
    "$engine" rm -f "$cid" >/dev/null 2>&1 || true
    cid=""

    bad=()
    while read -r mode owner path; do
        allowed "$path" || bad+=("$mode $owner $path")
    done <"$listing"
    if [ "${#bad[@]}" -eq 0 ]; then
        echo "PASS $image"
    else
        echo "FAIL $image: ${#bad[@]} director$([ "${#bad[@]}" -eq 1 ] && echo y || echo ies) without the execute bit for others"
        printf '    %s\n' "${bad[@]}"
        failed=1
    fi
done
exit "$failed"
