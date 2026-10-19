#!/usr/bin/env bash
# Check the development override compose.dev.yml together with docker-compose.yml. Only
# `config` (and, if available, `docker buildx bake --print`) is run; nothing is built or started.
#
# Usage: check-dev.sh [--repo DIR] [--bake-json FILE|--no-bake]
#   --repo DIR        repository root with docker-compose.yml and compose.dev.yml (default: this
#                     script's repository)
#   --bake-json FILE  output of `docker buildx bake -f docker-bake.hcl -f docker/bake/*.hcl
#                     --print default`; default: run that command if `docker buildx` is there
#   --no-bake         skip the comparison with the bake targets
#   COMPOSE_CMD       compose CLI (default: `docker compose`), split on spaces
#
# Output: one line per finding, `VIOLATION <rule>: <service>: <detail>`, rule one of
#   config-invalid  `config` of both files fails for a feature combination (every subset of the
#                   profiles of docker-compose.yml)
#   image           the override changes the image of a service of docker-compose.yml
#   build           a service that runs a BBB image (`.../bbb-<image>:<tag>`) has no build, or
#                   one that the override adds runs an image that is neither pinned by digest
#                   nor built by a service
#   dev-service     a service that only the override adds is not in a profile (run-only builders),
#                   not scaled to 0 (build stages) and not pinned by digest
#   bake            a build differs from its bake target (context, named contexts, arguments,
#                   target), or a bake target has no service that builds it
# Exit: 0 no finding, 1 at least one finding, 2 usage error or missing tool.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../../.." && pwd)"
BAKE_JSON=""
BAKE=auto
SKIP_REASON=""
BAKE_DONE=0

usage() {
    sed -n '5,11p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//' >&2
    [ -n "${1:-}" ] && echo "error: $1" >&2
    exit 2
}

while [ $# -gt 0 ]; do
    case "$1" in
        --repo) [ $# -ge 2 ] || usage "--repo needs a value"; REPO="$(cd "$2" && pwd)"; shift 2 ;;
        --bake-json) [ $# -ge 2 ] || usage "--bake-json needs a value"; BAKE_JSON="$2"; BAKE="file"; shift 2 ;;
        --no-bake) BAKE=no; SKIP_REASON="--no-bake"; shift ;;
        -h | --help) usage ;;
        *) usage "unknown argument: $1" ;;
    esac
done

PROD="$REPO/docker-compose.yml"
DEV="$REPO/compose.dev.yml"
[ -f "$PROD" ] || usage "not found: $PROD"
[ -f "$DEV" ] || usage "not found: $DEV"
read -r -a COMPOSE <<<"${COMPOSE_CMD:-docker compose}"
command -v "${COMPOSE[0]}" >/dev/null 2>&1 || usage "compose CLI not found: ${COMPOSE[0]} (set COMPOSE_CMD)"
command -v yq >/dev/null 2>&1 || usage "yq (mikefarah/yq v4) not found"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
FINDINGS="$WORK/findings"
: >"$FINDINGS"
v() { printf 'VIOLATION %s: %s: %s\n' "$1" "$2" "$3" >>"$FINDINGS"; }

# Image names as bake gives them, so that services and bake targets can be matched by name.
export BBB_IMAGE_REGISTRY=localhost BBB_IMAGE_TAG=dev-check

# config PROFILES OUT [FILES...]: resolved config as JSON (stderr in OUT.err).
config() {
    local profiles="$1" out="$2"
    shift 2
    local args=() f
    for f in "$@"; do args+=(-f "$f"); done
    COMPOSE_PROFILES="$profiles" BBB_FEATURES="$profiles" \
        "${COMPOSE[@]}" --project-directory "$REPO" "${args[@]}" config --format json >"$out" 2>"$out.err"
}

# errors FILE...: the messages of compose's stderr without its warnings, on one line.
errors() { cat "$@" 2>/dev/null | grep -v 'level=warning' | tr '\n' ' ' || true; }

# 1. config of both files for every feature combination (profiles of docker-compose.yml).
mapfile -t FEATURES < <(yq '[(.services // {}) | .[] | (.profiles // []) | .[]] | unique | .[]' "$PROD")
n="${#FEATURES[@]}"
[ "$n" -le 10 ] || usage "$n profiles in $PROD give 2^$n combinations"
combos=0
for ((mask = 0; mask < (1 << n); mask++)); do
    combo=()
    for ((i = 0; i < n; i++)); do
        if (((mask >> i) & 1)); then combo+=("${FEATURES[i]}"); fi
    done
    list="$(IFS=','; printf '%s' "${combo[*]}")"
    combos=$((combos + 1))
    if ! config "$list" "$WORK/combo.json" "$PROD" "$DEV"; then
        v config-invalid compose "BBB_FEATURES=\"$list\": $(errors "$WORK/combo.json.err")"
    fi
done

# 2. All services of both files (every profile), and those of docker-compose.yml alone.
if ! config '*' "$WORK/dev.json" "$PROD" "$DEV" || ! config '*' "$WORK/prod.json" "$PROD"; then
    v config-invalid compose "all profiles: $(errors "$WORK/dev.json.err" "$WORK/prod.json.err")"
else
    # shellcheck disable=SC2016 # yq expressions
    # Empty fields as `-`: `read` with a tab IFS joins consecutive tabs.
    yq -r '.services | to_entries | .[] | [.key, (.value.image // "-"), ((.value.build.context // "-") | tostring),
        (((.value.profiles // []) | join(",")) | sub("^$"; "-")), ((.value.scale // .value.deploy.replicas // "-") | tostring)] | @tsv' \
        "$WORK/dev.json" >"$WORK/dev.tsv"
    # shellcheck disable=SC2016
    yq -r '.services | to_entries | .[] | [.key, (.value.image // "")] | @tsv' "$WORK/prod.json" >"$WORK/prod.tsv"
    while IFS=$'\t' read -r svc image; do
        dev_image="$(awk -F'\t' -v s="$svc" '$1 == s { print $2 }' "$WORK/dev.tsv")"
        [ "$dev_image" = "$image" ] || v image "$svc" "image \"$image\" becomes \"$dev_image\""
    done <"$WORK/prod.tsv"
    while IFS=$'\t' read -r svc image context profiles scale; do
        if [[ "$image" == localhost/bbb-*:dev-check ]] && [ "$context" = - ]; then
            v build "$svc" "runs $image but has no build"
        fi
        if ! awk -F'\t' -v s="$svc" '$1 == s { found = 1 } END { exit !found }' "$WORK/prod.tsv"; then
            if [ "$profiles" = - ] && [ "$scale" != 0 ] && [[ "$image" != *@sha256:* ]]; then
                v dev-service "$svc" "added by compose.dev.yml, but in no profile, not scaled to 0 and not pinned by digest"
            fi
            if [ "$context" = - ] && [[ "$image" != *@sha256:* ]] \
                && ! awk -F'\t' -v i="$image" '$2 == i && $3 != "-" { f = 1 } END { exit !f }' "$WORK/dev.tsv"; then
                v build "$svc" "runs $image, which no service builds"
            fi
        fi
    done <"$WORK/dev.tsv"

    # 3. Builds against the bake targets.
    if [ "$BAKE" = auto ]; then
        if command -v docker >/dev/null 2>&1 && docker buildx version >/dev/null 2>&1; then
            BAKE_JSON="$WORK/bake.json"
            bake_files=(-f "$REPO/docker-bake.hcl")
            for f in "$REPO"/docker/bake/*.hcl; do bake_files+=(-f "$f"); done
            if ! (cd "$REPO" && docker buildx bake "${bake_files[@]}" --print default) >"$BAKE_JSON" 2>"$WORK/bake.err"; then
                echo "check-dev.sh: docker buildx bake --print failed:" >&2
                cat "$WORK/bake.err" >&2
                exit 2
            fi
        else
            BAKE=no
            SKIP_REASON="docker buildx not found; pass --bake-json"
        fi
    fi
    if [ "$BAKE" != no ]; then
        [ -f "$BAKE_JSON" ] || usage "bake JSON not found: $BAKE_JSON"
        # Per bake target: name, image name (bbb-<image>, empty for build stages), and the build as
        # sorted key=value lines: context, target, contexts, args. Paths relative to the repository.
        # The same for each service's build; a bake target is matched to the services that run
        # its image, a build stage (no tags) to the service of its name without a leading `_`.
        # shellcheck disable=SC2016
        yq -r '.target | to_entries | .[] | [.key, (((.value.tags // [])[0] // "") | sub("^.*/"; "") | sub(":.*$"; ""))] | @tsv' \
            "$BAKE_JSON" >"$WORK/bake.tsv"
        norm() { # a context value: paths relative to the repository; target:X -> service:<name of X>
            local value="$1" t
            case "$value" in
                *://* | docker-image:*) printf '%s' "$value" ;;
                target:*)
                    t="${value#target:}"
                    printf 'service:%s' "$(target_service "$t")" ;;
                service:*) printf '%s' "$value" ;;
                /*) value="${value#"$REPO"}"; printf '%s' "${value#/}" ;;
                *) value="${value#./}"; printf '%s' "${value%/}" ;;
            esac
        }
        target_service() { # bake target -> compose service that builds it (first match)
            local t="$1" img
            img="$(awk -F'\t' -v t="$t" '$1 == t { print $2 }' "$WORK/bake.tsv")"
            if [ -z "$img" ]; then printf '%s' "${t#_}"; return; fi
            awk -F'\t' -v i="localhost/$img:dev-check" '$2 == i && $3 != "-" { print $1; exit }' "$WORK/dev.tsv"
        }
        build_lines() { # FILE PATH-EXPR: the build at that path as key=value lines
            # shellcheck disable=SC2016
            yq -r "$2"' | (
                ["context=" + (.context | tostring)],
                ["target=" + ((.target // "") | tostring)],
                ((.contexts // .additional_contexts // {}) | to_entries | .[] | ["contexts." + .key + "=" + (.value | tostring)]),
                ((.args // {}) | to_entries | .[] | ["args." + .key + "=" + (.value | tostring)])
              ) | .[0]' "$1" | while IFS='=' read -r key value; do
                case "$key" in
                    context | contexts.*) printf '%s=%s\n' "$key" "$(norm "$value")" ;;
                    *) printf '%s=%s\n' "$key" "$value" ;;
                esac
            done | sort
        }
        while IFS=$'\t' read -r target img; do
            if [ -n "$img" ]; then
                mapfile -t svcs < <(awk -F'\t' -v i="localhost/$img:dev-check" '$2 == i { print $1 }' "$WORK/dev.tsv")
            else
                svcs=("${target#_}")
            fi
            if [ "${#svcs[@]}" -eq 0 ] || ! awk -F'\t' -v s="${svcs[0]}" '$1 == s { f = 1 } END { exit !f }' "$WORK/dev.tsv"; then
                v bake "$target" "no service builds this bake target"
                continue
            fi
            build_lines "$BAKE_JSON" ".target[\"$target\"]" >"$WORK/want"
            for svc in "${svcs[@]}"; do
                build_lines "$WORK/dev.json" ".services[\"$svc\"].build" >"$WORK/got"
                if ! diff -q "$WORK/want" "$WORK/got" >/dev/null; then
                    v bake "$svc" "build differs from bake target $target: $(diff "$WORK/want" "$WORK/got" | grep '^[<>]' | tr '\n' ' ')"
                fi
            done
        done <"$WORK/bake.tsv"
        BAKE_DONE=1
    fi
fi

sort -u "$FINDINGS"
count="$(sort -u "$FINDINGS" | wc -l)"
if [ "$BAKE_DONE" -eq 0 ]; then
    bake_status=skipped
    echo "NOTICE: the builds were NOT compared with the bake targets (${SKIP_REASON:-config invalid})" >&2
else
    bake_status=compared
fi
echo "check-dev.sh: $count finding(s); $combos feature combination(s); bake targets: $bake_status" >&2
[ "$count" -eq 0 ]
