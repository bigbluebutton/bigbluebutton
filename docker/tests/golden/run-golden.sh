#!/usr/bin/env bash
# Golden-file runner: renders each image's configuration with `--render-only` and the fixture
# env, and compares it with the committed expected tree (and, with --parity, with the
# bare-metal reference). The interface is fixed by test-golden.sh (protected); see its header.
#
# Usage: run-golden.sh [--engine podman|docker] [--root DIR] [--update] [--parity] [NAME...]
#   --engine   container engine (default: $CONTAINER_ENGINE, else docker if installed, else podman)
#   --root     golden root, one directory per case (default: the directory of this script)
#   --update   replace each case's expected/ with the rendered tree
#   --parity   also compare with the reference tree named in the case's parity.yaml
#   NAME       cases to run (default: every directory below --root that contains `image`)
#
# Case directory: image (one line, image reference), fixture.env (env file), expected/,
# parity.yaml (optional). Each render is
#   <engine> run --rm --pull=never --network=none --env-file fixture.env \
#       -v <tmp>:/golden-out[:Z] IMAGE --render-only /golden-out
# The image must exist locally (never pulled); rendering must not need the network.
# `:Z` is added when SELinux is enabled on the host.
#
# Files written by the container: the mount directory is world-writable (inside a private
# 0700 temporary directory), so images running as a non-root user can write to it. Files the
# container leaves owned by another host UID are handed back before they are compared:
#   rootless podman   `podman unshare chown -R 0:0` (container root is the invoking user)
#   rootless docker   helper container `chown -R 0:0` (same mapping)
#   rootful engines   helper container `chown -R <uid>:<gid>` of the invoking user
# The helper is the pinned ubuntu:24.04 base used by the test images. Nothing is left behind
# that the user cannot delete; the temporary directory is removed on exit.
#
# Comparison covers regular files (content) and symlinks (target); file modes are not compared.
#
# Expectations (interface fixed by test-expectations.sh, protected): a case with an
# `expectations.yaml` is also checked against it, after the golden comparison, and prints
# `EXPECT-PASS <name>` or one `EXPECT-FAIL <name>: ...` line per failed check.
#   render     checks on the tree rendered with fixture.env. yaml/json: the yq path must select
#              at most one node; `equals` compares value and tag (4 is not "4"); `absent` means
#              missing or null. properties: `key=value`, `key = value`, `key: value`, `key value`,
#              backslash continuation lines joined, no escape processing; first occurrence wins.
#              lines: each line of the file. EREs are bash `=~` (POSIX ERE), unanchored.
#   must_fail  one run per entry with fixture.env minus the named variables; `set` values reach
#              the engine through its environment (`-e NAME`), never through argv or a file, and
#              are never printed. The run must exit non-zero, its output must contain `message`
#              and must not contain any `set` value verbatim. Its output is not shown.
#   uid        one render with `--user UID:GID` (podman: also --passwd=false, as Docker and
#              Kubernetes add no passwd entry): must exit 0 and produce the same tree.
# All expectations files are validated before anything runs; an invalid one is a usage error.
# yq (mikefarah v4, `yq` or `yq-go` in PATH) is needed for --parity and for expectations.
#
# Exit: 0 everything passed, 1 any FAIL, PARITY-FAIL or EXPECT-FAIL, 2 usage or environment
# error (including an invalid expectations.yaml).

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# ubuntu:24.04, the same digest as the other test images.
HELPER_IMAGE=docker.io/library/ubuntu@sha256:534baea6a22c03a63003dbc8dbe78fe34bc0d7e595d9a9dc9834884ff530eb55
DIFF_LINES=12

usage() {
    sed -n '6,11p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//' >&2
    [ -n "${1:-}" ] && echo "error: $1" >&2
    exit 2
}
die_env() { echo "error: $1" >&2; exit 2; }

ENGINE="${CONTAINER_ENGINE:-}"
ROOT="$HERE"
UPDATE=0
PARITY=0
NAMES=()
while [ $# -gt 0 ]; do
    case "$1" in
        --engine) [ $# -ge 2 ] || usage "--engine needs a value"; ENGINE="$2"; shift 2 ;;
        --root) [ $# -ge 2 ] || usage "--root needs a value"; ROOT="$2"; shift 2 ;;
        --update) UPDATE=1; shift ;;
        --parity) PARITY=1; shift ;;
        -h | --help) usage ;;
        --) shift; NAMES+=("$@"); break ;;
        -*) usage "unknown option: $1" ;;
        *) NAMES+=("$1"); shift ;;
    esac
done

if [ -z "$ENGINE" ]; then
    if command -v docker >/dev/null 2>&1; then ENGINE=docker; else ENGINE=podman; fi
fi
case "$ENGINE" in
    docker | podman) ;;
    *) usage "--engine must be podman or docker, got '$ENGINE'" ;;
esac
command -v "$ENGINE" >/dev/null 2>&1 || die_env "$ENGINE not found"
[ -d "$ROOT" ] || usage "golden root is not a directory: $ROOT"
ROOT="$(cd "$ROOT" && pwd)"

# --- cases -------------------------------------------------------------------------------------
if [ "${#NAMES[@]}" -eq 0 ]; then
    while IFS= read -r -d '' f; do
        NAMES+=("$(basename "$(dirname "$f")")")
    done < <(find "$ROOT" -mindepth 2 -maxdepth 2 -name image -type f -print0 | LC_ALL=C sort -z)
fi
for name in ${NAMES[@]+"${NAMES[@]}"}; do
    case "$name" in '' | . | .. | */*) usage "invalid case name: '$name'" ;; esac
    [ -d "$ROOT/$name" ] || usage "unknown case: $name"
    [ -f "$ROOT/$name/image" ] || usage "case $name has no image file"
    [ -f "$ROOT/$name/fixture.env" ] || usage "case $name has no fixture.env file"
done

HAS_EXPECTATIONS=0
for name in ${NAMES[@]+"${NAMES[@]}"}; do
    if [ -f "$ROOT/$name/expectations.yaml" ]; then HAS_EXPECTATIONS=1; fi
done

YQ=""
if [ "$PARITY" -eq 1 ] || [ "$HAS_EXPECTATIONS" -eq 1 ]; then
    for c in yq yq-go; do
        if command -v "$c" >/dev/null 2>&1; then YQ="$c"; break; fi
    done
    [ -n "$YQ" ] || die_env "--parity and expectations.yaml need yq (mikefarah v4) in PATH; docker/tests/golden/run.sh provides it"
fi

# --- expectations: validation -------------------------------------------------------------------
EFILE=""
EXP_NAME=""
EXP_INVALID=0
exp_invalid() {
    echo "error: $EXP_NAME/expectations.yaml: $1" >&2
    EXP_INVALID=1
}

# ey EXPR: yq on the expectations file, raw output. etag EXPR: the tag of EXPR.
ey() { "$YQ" -r "$1" "$EFILE"; }
etag() { "$YQ" -r "($1) | tag" "$EFILE"; }
# exact_str VAR EXPR FILE [YQ-OPTS...]: VAR := raw value of EXPR in FILE, trailing newlines kept.
exact_str() {
    local __v
    __v="$("$YQ" "${@:4}" -r "$2" "$3" && printf x)" || return 1
    __v="${__v%x}"
    printf -v "$1" '%s' "${__v%$'\n'}"
}
# ekeys ARRAY EXPR: ARRAY := the keys of the mapping EXPR.
ekeys() { mapfile -t "$1" < <("$YQ" -r "($2) | keys | .[]" "$EFILE"); }

valid_ere() { # ERE
    local rc=0
    # shellcheck disable=SC2319 # the status of =~ is wanted: 2 means an invalid ERE
    [[ "" =~ $1 ]] || rc=$?
    [ "$rc" -ne 2 ]
}
valid_env_name() { [[ "$1" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; }
# Variables the engine, or the shell that starts it, reads itself: a must_fail `set` cannot pass
# them through the environment without changing how the engine runs.
engine_env_name() {
    case "$1" in
        PATH | HOME | USER | LOGNAME | SHELL | TMPDIR | IFS | PWD | OLDPWD | SHLVL | ENV | TZ | \
            BASH* | SHELLOPTS | PS4 | POSIXLY_CORRECT | LANG | LANGUAGE | LC_* | LD_* | XDG_* | \
            DOCKER_* | CONTAINER_* | CONTAINERS_* | PODMAN_* | BUILDAH_* | REGISTRY_* | \
            *_PROXY | *_proxy | GODEBUG | GOMAXPROCS | GOGC | _) return 0 ;;
    esac
    return 1
}

# validate_check WHERE CHECK-EXPR FORMAT
validate_check() {
    local where="$1" c="$2" format="$3" selector="" ops k nops=0 t v
    local -a keys
    case "$format" in
        yaml | json) selector=path; ops=" equals absent matches " ;;
        properties) selector=key; ops=" equals absent matches " ;;
        lines) ops=" contains_line no_line " ;;
    esac
    if [ "$(etag "$c")" != '!!map' ]; then exp_invalid "$where: not a mapping"; return; fi
    ekeys keys "$c"
    for k in ${keys[@]+"${keys[@]}"}; do
        if [ -n "$selector" ] && [ "$k" = "$selector" ]; then continue; fi
        case "$ops" in
            *" $k "*) nops=$((nops + 1)); continue ;;
        esac
        case "$k" in
            path | key | equals | absent | matches | contains_line | no_line)
                exp_invalid "$where: '$k' is not valid for format $format" ;;
            *) exp_invalid "$where: unknown operator: $k" ;;
        esac
    done
    if [ "$nops" -eq 0 ]; then exp_invalid "$where: no operator"; fi
    if [ "$nops" -gt 1 ]; then exp_invalid "$where: more than one operator"; fi
    if [ -n "$selector" ]; then
        if [ "$(etag "$c.$selector")" != '!!str' ] || [ -z "$(ey "$c.$selector")" ]; then
            exp_invalid "$where: missing $selector"
        elif [ "$selector" = path ]; then
            v="$(ey "$c.path")"
            if [ "${v:0:1}" != . ] || ! "$YQ" -n "$v" >/dev/null 2>&1; then
                exp_invalid "$where: invalid yq path: $v"
            fi
        fi
    fi
    for k in ${keys[@]+"${keys[@]}"}; do
        t="$(etag "$c.$k")"
        case "$k" in
            equals)
                case "$t" in
                    '!!str' | '!!int' | '!!float' | '!!bool') ;;
                    *) exp_invalid "$where: equals needs a scalar (use absent for missing values)" ;;
                esac
                ;;
            absent)
                if [ "$t" != '!!bool' ] || [ "$(ey "$c.absent")" != true ]; then
                    exp_invalid "$where: absent must be true"
                fi
                ;;
            matches | contains_line | no_line)
                v="$(ey "$c.$k")"
                if [ "$t" != '!!str' ] || [ -z "$v" ]; then
                    exp_invalid "$where: $k needs a non-empty ERE"
                elif ! valid_ere "$v"; then
                    exp_invalid "$where: invalid ERE: $v"
                fi
                ;;
        esac
    done
}

# validate_expectations NAME FILE: report every problem; EXP_INVALID=1 if there is one.
validate_expectations() {
    EXP_NAME="$1"
    EFILE="$2"
    local err
    if ! err="$("$YQ" -e 'tag == "!!map"' "$EFILE" 2>&1 >/dev/null)"; then
        exp_invalid "not a YAML mapping${err:+ ($(printf '%s' "$err" | head -n 1))}"
        return
    fi
    local -a keys ckeys
    local k n i j m e file format where t name
    ekeys keys .
    [ "${#keys[@]}" -gt 0 ] || exp_invalid "empty mapping"
    for k in ${keys[@]+"${keys[@]}"}; do
        case "$k" in
            render | must_fail | uid) ;;
            *) exp_invalid "unknown key: $k" ;;
        esac
    done

    if [ "$(ey 'has("render")')" = true ]; then
        if [ "$(etag .render)" != '!!seq' ]; then
            exp_invalid "render: not a list"
        else
            n="$(ey '.render | length')"
            for ((i = 0; i < n; i++)); do
                e=".render[$i]"
                where="render[$i]"
                if [ "$(etag "$e")" != '!!map' ]; then exp_invalid "$where: not a mapping"; continue; fi
                ekeys ckeys "$e"
                for k in ${ckeys[@]+"${ckeys[@]}"}; do
                    case "$k" in
                        file | format | checks) ;;
                        *) exp_invalid "$where: unknown key: $k" ;;
                    esac
                done
                file="$(ey "$e.file // \"\"")"
                if [ "$(etag "$e.file")" != '!!str' ] || [ -z "$file" ]; then
                    exp_invalid "$where: missing file"
                    file=""
                else
                    case "/$file/" in
                        //*) exp_invalid "$where: file must be relative to the render root: $file" ;;
                        */../* | */./*) exp_invalid "$where: file must not contain . or .. components: $file" ;;
                    esac
                    where="$where ($file)"
                fi
                format="$(ey "$e.format // \"\"")"
                case "$format" in
                    yaml | json | properties | lines) ;;
                    "") exp_invalid "$where: missing format"; continue ;;
                    *) exp_invalid "$where: unknown format: $format"; continue ;;
                esac
                t="$(etag "$e.checks")"
                if [ "$t" != '!!seq' ] || [ "$(ey "$e.checks | length")" -eq 0 ]; then
                    exp_invalid "$where: checks must be a non-empty list"
                    continue
                fi
                m="$(ey "$e.checks | length")"
                for ((j = 0; j < m; j++)); do
                    validate_check "$where: checks[$j]" "$e.checks[$j]" "$format"
                done
            done
        fi
    fi

    if [ "$(ey 'has("must_fail")')" = true ]; then
        if [ "$(etag .must_fail)" != '!!seq' ]; then
            exp_invalid "must_fail: not a list"
        else
            n="$(ey '.must_fail | length')"
            for ((i = 0; i < n; i++)); do
                e=".must_fail[$i]"
                where="must_fail[$i]"
                if [ "$(etag "$e")" != '!!map' ]; then exp_invalid "$where: not a mapping"; continue; fi
                ekeys ckeys "$e"
                m=0
                for k in ${ckeys[@]+"${ckeys[@]}"}; do
                    case "$k" in
                        unset | set) m=$((m + 1)) ;;
                        message) ;;
                        *) exp_invalid "$where: unknown key: $k" ;;
                    esac
                done
                [ "$m" -eq 1 ] || exp_invalid "$where: needs exactly one of unset and set"
                if [ "$(etag "$e.message")" != '!!str' ] || [ -z "$(ey "$e.message")" ]; then
                    exp_invalid "$where: missing message"
                fi
                if [ "$(ey "$e | has(\"unset\")")" = true ]; then
                    name="$(ey "$e.unset")"
                    if [ "$(etag "$e.unset")" != '!!str' ] || ! valid_env_name "$name"; then
                        exp_invalid "$where: unset needs a variable name"
                    fi
                fi
                if [ "$(ey "$e | has(\"set\")")" = true ]; then
                    if [ "$(etag "$e.set")" != '!!map' ] || [ "$(ey "$e.set | length")" -eq 0 ]; then
                        exp_invalid "$where: set needs a mapping of variables"
                        continue
                    fi
                    ekeys ckeys "$e.set"
                    for name in "${ckeys[@]}"; do
                        if ! valid_env_name "$name"; then
                            exp_invalid "$where: set: invalid variable name"
                            continue
                        fi
                        if engine_env_name "$name"; then
                            exp_invalid "$where: set: $name is read by the engine or shell and cannot be passed"
                        fi
                        # Never print the value.
                        case "$(etag "$e.set[\"$name\"]")" in
                            '!!str' | '!!int' | '!!float' | '!!bool') ;;
                            *) exp_invalid "$where: set: value of $name must be a scalar" ;;
                        esac
                    done
                fi
            done
        fi
    fi

    if [ "$(ey 'has("uid")')" = true ]; then
        if [ "$(etag .uid)" != '!!map' ]; then
            exp_invalid "uid: not a mapping"
        else
            ekeys ckeys .uid
            for k in ${ckeys[@]+"${ckeys[@]}"}; do
                [ "$k" = user ] || exp_invalid "uid: unknown key: $k"
            done
            if [ "$(etag .uid.user)" != '!!str' ] || [[ ! "$(ey .uid.user)" =~ ^[0-9]+:[0-9]+$ ]]; then
                exp_invalid "uid: user must be a quoted \"UID:GID\" string"
            fi
        fi
    fi
}

for name in ${NAMES[@]+"${NAMES[@]}"}; do
    if [ -f "$ROOT/$name/expectations.yaml" ]; then validate_expectations "$name" "$ROOT/$name/expectations.yaml"; fi
done
[ "$EXP_INVALID" -eq 0 ] || exit 2

MOUNT_OPT=""
if [ -e /sys/fs/selinux/enforce ]; then MOUNT_OPT=":Z"; fi

ROOTLESS=""
engine_rootless() {
    if [ -z "$ROOTLESS" ]; then
        if [ "$ENGINE" = podman ]; then
            ROOTLESS="$(podman info --format '{{.Host.Security.Rootless}}' 2>/dev/null || echo false)"
        elif docker info --format '{{json .SecurityOptions}}' 2>/dev/null | grep -q 'name=rootless'; then
            ROOTLESS=true
        else
            ROOTLESS=false
        fi
    fi
    [ "$ROOTLESS" = true ]
}

WORK="$(mktemp -d)"
chmod 0700 "$WORK"
# shellcheck disable=SC2329 # invoked by the EXIT trap
cleanup() {
    # Last resort for files a failed hand-back left behind.
    rm -rf "$WORK" 2>/dev/null || {
        reclaim "$WORK" >/dev/null 2>&1 || true
        rm -rf "$WORK" 2>/dev/null || echo "warning: could not remove $WORK" >&2
    }
}
trap cleanup EXIT

# reclaim DIR: make every file below DIR owned by, readable and deletable for the invoking user.
reclaim() {
    local dir="$1" uid gid
    uid="$(id -u)"
    gid="$(id -g)"
    if [ -n "$(find "$dir" ! -user "$uid" -print -quit 2>/dev/null)" ]; then
        if engine_rootless && [ "$ENGINE" = podman ]; then
            podman unshare chown -R 0:0 "$dir"
        elif engine_rootless; then
            "$ENGINE" run --rm --network=none --user 0:0 -v "$dir:/golden-out$MOUNT_OPT" \
                "$HELPER_IMAGE" chown -R 0:0 /golden-out >/dev/null
        else
            "$ENGINE" run --rm --network=none --user 0:0 -v "$dir:/golden-out$MOUNT_OPT" \
                "$HELPER_IMAGE" chown -R "$uid:$gid" /golden-out >/dev/null
        fi
    fi
    chmod -R u+rwX "$dir"
}

# Extra variables for the next render (must_fail `set`): names and values, index-aligned.
RENDER_SET_NAMES=()
RENDER_SET_VALUES=()

# render IMAGE ENVFILE OUTDIR LOG [ENGINE-RUN-OPTIONS...] -> exit code of the container
render() {
    local image="$1" envfile="$2" out="$3" log="$4" rc=0 name
    shift 4
    mkdir -p "$out"
    chmod 0777 "$out"
    local -a cmd=("$ENGINE" run --rm --pull=never --network=none --env-file "$envfile")
    for name in ${RENDER_SET_NAMES[@]+"${RENDER_SET_NAMES[@]}"}; do cmd+=(-e "$name"); done
    cmd+=("$@" -v "$out:/golden-out$MOUNT_OPT" "$image" --render-only /golden-out)
    if [ "${#RENDER_SET_NAMES[@]}" -eq 0 ]; then
        "${cmd[@]}" >"$log" 2>&1 || rc=$?
    else
        # The values go through stdin into the environment of a child shell, which execs the
        # engine; `-e NAME` takes them from there. They never appear in argv or in a file, and
        # the child reads each value straight into its variable, so no name can collide.
        # shellcheck disable=SC2016 # expanded by the child shell
        bash -c 'while [ "$1" != -- ]; do IFS= read -r -d "" "$1" || exit 125; export "${1?}"; shift; done; shift; exec "$@"' \
            golden-env "${RENDER_SET_NAMES[@]}" -- "${cmd[@]}" \
            < <(printf '%s\0' "${RENDER_SET_VALUES[@]}") >"$log" 2>&1 || rc=$?
    fi
    reclaim "$out" >>"$log" 2>&1 || { echo "cannot reclaim rendered files in $out" >>"$log"; [ "$rc" -ne 0 ] || rc=125; }
    return "$rc"
}

# list_tree DIR: relative paths of regular files and symlinks, NUL-separated, sorted.
list_tree() {
    [ -d "$1" ] || return 0
    (cd "$1" && find . \( -type f -o -type l \) -print0 | sed -z 's|^\./||' | LC_ALL=C sort -z)
}

# same_entry A B: 0 if both are the same symlink target or regular files with equal content.
same_entry() {
    if [ -L "$1" ] || [ -L "$2" ]; then
        [ -L "$1" ] && [ -L "$2" ] && [ "$(readlink "$1")" = "$(readlink "$2")" ]
    else
        cmp -s "$1" "$2"
    fi
}

# tree_join A B: "<1|2|3>\t<relpath>" NUL-separated; 1 only in A, 2 only in B, 3 in both.
tree_join() {
    LC_ALL=C comm -z <(list_tree "$1") <(list_tree "$2") |
        while IFS= read -r -d '' line; do
            case "$line" in
                $'\t\t'*) printf '3\t%s\0' "${line#$'\t\t'}" ;;
                $'\t'*) printf '2\t%s\0' "${line#$'\t'}" ;;
                *) printf '1\t%s\0' "$line" ;;
            esac
        done
}

FAILED=0
CASE=""
CASE_FAILED=0
fail() { # detail
    echo "FAIL $CASE: $1"
    CASE_FAILED=1
    FAILED=1
}
indent() { sed 's/^/  /'; }

EXPECTED=""
RENDERED=""
on_golden() {
    case "$1" in
        only-a) fail "missing: $2" ;;
        only-b) fail "unexpected: $2" ;;
        differs)
            fail "differs: $2"
            if [ -f "$EXPECTED/$2" ] && [ -f "$RENDERED/$2" ] && [ ! -L "$EXPECTED/$2" ] && [ ! -L "$RENDERED/$2" ]; then
                diff -u "$EXPECTED/$2" "$RENDERED/$2" | tail -n +3 | head -n "$DIFF_LINES" | indent || true
            fi
            ;;
    esac
}

# --- parity ------------------------------------------------------------------------------------
PARITY_FAILED=0
parity_fail() {
    echo "PARITY-FAIL $CASE: $1"
    PARITY_FAILED=1
    FAILED=1
}

# yq_lines EXPR FILE: one output line per result (null/absent -> empty string).
yq_lines() { "$YQ" -r "$1" "$2"; }

parity_check() {
    local dir="$1" rendered_root="$2" pfile="$1/parity.yaml"
    PARITY_FAILED=0
    if [ ! -f "$pfile" ]; then
        echo "PARITY-SKIP $CASE: no parity.yaml"
        return 0
    fi
    local err
    if ! err="$("$YQ" -e 'tag == "!!map"' "$pfile" 2>&1 >/dev/null)"; then
        parity_fail "parity.yaml: not a YAML mapping${err:+ ($(printf '%s' "$err" | head -n 1))}"
        return 0
    fi
    local ref nfiles nallowed
    ref="$(yq_lines '.reference // ""' "$pfile")"
    nfiles="$(yq_lines '(.files // []) | length' "$pfile")"
    nallowed="$(yq_lines '(.allowed // []) | length' "$pfile")"
    if [ -z "$ref" ]; then parity_fail "parity.yaml: no reference"; return 0; fi
    if [ "$nfiles" -eq 0 ]; then parity_fail "parity.yaml: no files"; return 0; fi
    case "$ref" in /*) ;; *) ref="$dir/$ref" ;; esac
    [ -d "$ref" ] || { parity_fail "parity.yaml: reference is not a directory: $(yq_lines '.reference' "$pfile")"; return 0; }

    local -a a_file a_line a_used
    local i j
    for ((i = 0; i < nallowed; i++)); do
        a_file[i]="$(yq_lines ".allowed[$i].file // \"\"" "$pfile")"
        a_line[i]="$(yq_lines ".allowed[$i].line // \"\"" "$pfile")"
        a_used[i]=0
        local reason
        reason="$(yq_lines ".allowed[$i].reason // \"\"" "$pfile" | tr -d '[:space:]')"
        if [ -z "${a_file[i]}" ] || [ -z "${a_line[i]}" ]; then
            parity_fail "allowlist: entry $((i + 1)) needs file and line"
            a_file[i]=""
            continue
        fi
        [ -n "$reason" ] || parity_fail "allowlist: missing reason: ${a_line[i]}"
        local rc=0
        # shellcheck disable=SC2319 # the status of =~ is wanted: 2 means an invalid ERE
        [[ "" =~ ${a_line[i]} ]] || rc=$?
        if [ "$rc" -eq 2 ]; then
            parity_fail "allowlist: invalid ERE: ${a_line[i]}"
            a_file[i]=""
        fi
    done

    local rendered reference line matched
    for ((j = 0; j < nfiles; j++)); do
        rendered="$(yq_lines ".files[$j].rendered // \"\"" "$pfile")"
        reference="$(yq_lines ".files[$j].reference // \"\"" "$pfile")"
        if [ -z "$rendered" ] || [ -z "$reference" ]; then
            parity_fail "parity.yaml: files entry $((j + 1)) needs rendered and reference"
            continue
        fi
        if [ ! -f "$rendered_root/$rendered" ]; then parity_fail "$rendered: not rendered"; continue; fi
        if [ ! -f "$ref/$reference" ]; then parity_fail "$rendered: reference missing: $reference"; continue; fi
        # Every line only on one side (reference: -, rendered: +), without the marker.
        while IFS= read -r line; do
            matched=0
            for ((i = 0; i < nallowed; i++)); do
                [ "${a_file[i]}" = "$rendered" ] || continue
                if [[ "$line" =~ ${a_line[i]} ]]; then
                    matched=1
                    a_used[i]=1
                fi
            done
            [ "$matched" -eq 1 ] || parity_fail "$rendered: unlisted difference: $line"
        done < <(diff --unchanged-line-format= --old-line-format='%L' --new-line-format='%L' \
            "$ref/$reference" "$rendered_root/$rendered" || true)
    done
    for ((i = 0; i < nallowed; i++)); do
        if [ -n "${a_file[i]}" ] && [ "${a_used[i]}" -eq 0 ]; then
            parity_fail "allowlist: unused entry: ${a_line[i]}"
        fi
    done
    [ "$PARITY_FAILED" -eq 1 ] || echo "PARITY-PASS $CASE"
}

# --- expectations: evaluation -------------------------------------------------------------------
EXPECT_FAILED=0
expect_fail() {
    echo "EXPECT-FAIL $CASE: $1"
    EXPECT_FAILED=1
    FAILED=1
}

# show VALUE: one line, at most 80 characters, for EXPECT-FAIL reasons.
show() {
    local s="${1//$'\n'/\\n}"
    s="${s//$'\r'/\\r}"
    if [ "${#s}" -gt 80 ]; then s="${s:0:77}..."; fi
    printf '%s' "$s"
}

# prop_get VAR FILE KEY: VAR := value of the first KEY in the properties FILE; 1 if absent.
prop_get() {
    local __v
    __v="$(GOLDEN_KEY="$3" awk '
        BEGIN { key = ENVIRON["GOLDEN_KEY"]; cont = 0; found = 0 }
        {
            line = $0
            sub(/\r$/, "", line)
            if (cont) {
                sub(/^[ \t\f]+/, "", line)
                logical = logical line
            } else {
                logical = line
                sub(/^[ \t\f]+/, "", logical)
                if (logical == "" || logical ~ /^[#!]/) next
            }
            # An odd number of trailing backslashes continues the line.
            if (match(logical, /\\+$/) && RLENGTH % 2 == 1) {
                logical = substr(logical, 1, length(logical) - 1)
                cont = 1
                next
            }
            cont = 0
            if (match(logical, /[=: \t\f]/)) {
                k = substr(logical, 1, RSTART - 1)
                rest = substr(logical, RSTART)
            } else {
                k = logical
                rest = ""
            }
            if (k != key) next
            sub(/^[ \t\f]*/, "", rest)
            if (rest ~ /^[=:]/) rest = substr(rest, 2)
            sub(/^[ \t\f]*/, "", rest)
            printf "%s", rest
            found = 1
            exit
        }
        END { exit !found }' "$2" && printf x)" || return 1
    printf -v "$1" '%s' "${__v%x}"
}

# check_structured FILE FORMAT WHERE CHECK-EXPR (yaml and json)
check_structured() {
    local f="$1" format="$2" where="$3" c="$4" path count tag value evalue etagv ere
    path="$(ey "$c.path")"
    local -a yqo=(-p "$format" -o yaml)
    if ! count="$("$YQ" "${yqo[@]}" "[($path)] | length" "$f" 2>/dev/null)"; then
        expect_fail "$where: $path: cannot be evaluated"
        return
    fi
    if [ "$count" -gt 1 ]; then expect_fail "$where: $path: selects $count nodes"; return; fi
    tag="$("$YQ" "${yqo[@]}" "($path) | tag" "$f")"
    exact_str value "$path" "$f" "${yqo[@]}" || { expect_fail "$where: $path: cannot be evaluated"; return; }
    if [ "$(ey "$c | has(\"absent\")")" = true ]; then
        [ "$tag" = '!!null' ] || expect_fail "$where: $path: present ($(show "$value")), expected absent"
    elif [ "$tag" = '!!null' ]; then
        expect_fail "$where: $path: absent"
    elif [ "$(ey "$c | has(\"equals\")")" = true ]; then
        exact_str evalue "$c.equals" "$EFILE"
        etagv="$(etag "$c.equals")"
        if [ "$tag" != "$etagv" ] || [ "$value" != "$evalue" ]; then
            expect_fail "$where: $path: expected $(show "$evalue") ($etagv), got $(show "$value") ($tag)"
        fi
    else
        exact_str ere "$c.matches" "$EFILE"
        [[ "$value" =~ $ere ]] || expect_fail "$where: $path: $(show "$value") does not match"
    fi
}

# check_properties FILE WHERE CHECK-EXPR
check_properties() {
    local f="$1" where="$2" c="$3" key value="" present=1 evalue ere
    exact_str key "$c.key" "$EFILE"
    prop_get value "$f" "$key" || present=0
    if [ "$(ey "$c | has(\"absent\")")" = true ]; then
        [ "$present" -eq 0 ] || expect_fail "$where: $key: present ($(show "$value")), expected absent"
    elif [ "$present" -eq 0 ]; then
        expect_fail "$where: $key: absent"
    elif [ "$(ey "$c | has(\"equals\")")" = true ]; then
        exact_str evalue "$c.equals" "$EFILE"
        [ "$value" = "$evalue" ] || expect_fail "$where: $key: expected $(show "$evalue"), got $(show "$value")"
    else
        exact_str ere "$c.matches" "$EFILE"
        [[ "$value" =~ $ere ]] || expect_fail "$where: $key: $(show "$value") does not match"
    fi
}

# check_lines WHERE CHECK-EXPR, on the lines in FILE_LINES
FILE_LINES=()
check_lines() {
    local where="$1" c="$2" ere i
    if [ "$(ey "$c | has(\"contains_line\")")" = true ]; then
        exact_str ere "$c.contains_line" "$EFILE"
        for ((i = 0; i < ${#FILE_LINES[@]}; i++)); do
            if [[ "${FILE_LINES[i]}" =~ $ere ]]; then return 0; fi
        done
        expect_fail "$where: $ere: no matching line"
    else
        exact_str ere "$c.no_line" "$EFILE"
        for ((i = 0; i < ${#FILE_LINES[@]}; i++)); do
            if [[ "${FILE_LINES[i]}" =~ $ere ]]; then
                expect_fail "$where: $ere: line $((i + 1)) matches: $(show "${FILE_LINES[i]}")"
                return 0
            fi
        done
    fi
}

# expectations_check DIR RENDERED-ROOT WORKDIR IMAGE
expectations_check() {
    local dir="$1" rendered_root="$2" w="$3" image="$4"
    EFILE="$dir/expectations.yaml"
    EXPECT_FAILED=0
    local n m i j k e file format f real root

    # render
    root="$(realpath "$rendered_root")"
    n="$(ey '(.render // []) | length')"
    for ((i = 0; i < n; i++)); do
        e=".render[$i]"
        exact_str file "$e.file" "$EFILE"
        format="$(ey "$e.format")"
        f="$rendered_root/$file"
        if [ ! -e "$f" ] && [ ! -L "$f" ]; then expect_fail "$file: not rendered"; continue; fi
        real="$(realpath -m "$f")"
        case "$real" in
            "$root"/*) ;;
            *) expect_fail "$file: symlink points outside the rendered tree"; continue ;;
        esac
        if [ ! -f "$real" ]; then expect_fail "$file: not a regular file"; continue; fi
        case "$format" in
            yaml | json)
                if ! "$YQ" -p "$format" -o yaml -e 'tag == "!!map" or tag == "!!seq"' "$real" >/dev/null 2>&1; then
                    expect_fail "$file: not a $format mapping or list"
                    continue
                fi
                ;;
            lines) mapfile -t FILE_LINES <"$real" ;;
        esac
        m="$(ey "$e.checks | length")"
        for ((j = 0; j < m; j++)); do
            case "$format" in
                yaml | json) check_structured "$real" "$format" "$file" "$e.checks[$j]" ;;
                properties) check_properties "$real" "$file" "$e.checks[$j]" ;;
                lines) check_lines "$file" "$e.checks[$j]" ;;
            esac
        done
    done

    # must_fail
    local desc envfile log rc name value message leaked
    local -a names values
    n="$(ey '(.must_fail // []) | length')"
    for ((k = 0; k < n; k++)); do
        e=".must_fail[$k]"
        names=()
        values=()
        if [ "$(ey "$e | has(\"unset\")")" = true ]; then
            names=("$(ey "$e.unset")")
            desc="unset ${names[0]}"
        else
            mapfile -t names < <(ey "$e.set | keys | .[]")
            for name in "${names[@]}"; do
                exact_str value "$e.set[\"$name\"]" "$EFILE"
                values+=("$value")
            done
            desc="set ${names[*]}"
        fi
        exact_str message "$e.message" "$EFILE"
        envfile="$w/must_fail$k.env"
        log="$w/must_fail$k.log"
        # fixture.env without the variables of this entry (docker env-file syntax: NAME=value or
        # NAME, leading whitespace ignored, # comments).
        GOLDEN_DROP="${names[*]}" awk '
            BEGIN { n = split(ENVIRON["GOLDEN_DROP"], d, " "); for (i = 1; i <= n; i++) drop[d[i]] = 1 }
            { l = $0; sub(/^[ \t]+/, "", l); name = l; sub(/=.*/, "", name); if (!(name in drop)) print }
        ' "$dir/fixture.env" >"$envfile"
        rc=0
        if [ "${#values[@]}" -gt 0 ]; then
            RENDER_SET_NAMES=("${names[@]}")
            RENDER_SET_VALUES=("${values[@]}")
        fi
        render "$image" "$envfile" "$w/must_fail$k" "$log" || rc=$?
        RENDER_SET_NAMES=()
        RENDER_SET_VALUES=()
        if [ "$rc" -eq 0 ]; then
            expect_fail "must_fail: $desc: exit 0, expected non-zero"
        elif ! grep -qF -- "$message" "$log"; then
            expect_fail "must_fail: $desc: exit $rc, output does not contain \"$(show "$message")\""
        fi
        leaked="$(<"$log")"
        for ((i = 0; i < ${#values[@]}; i++)); do
            if [[ "$leaked" == *"${values[i]}"* ]]; then
                expect_fail "must_fail: $desc: output contains the value of ${names[i]}"
            fi
        done
    done

    # uid
    local user
    if [ "$(ey 'has("uid")')" = true ]; then
        user="$(ey .uid.user)"
        rc=0
        local -a uid_opts=(--user "$user")
        # As docker/tests/uid/check.sh: podman adds a passwd entry for --user by
        # default; Docker and Kubernetes do not.
        if [ "$ENGINE" = podman ]; then uid_opts+=(--passwd=false); fi
        render "$image" "$dir/fixture.env" "$w/uid" "$w/uid.log" "${uid_opts[@]}" || rc=$?
        if [ "$rc" -ne 0 ]; then
            expect_fail "uid: render as $user: exit $rc"
            tail -n 20 "$w/uid.log" | indent || true
        else
            local kind path
            while IFS=$'\t' read -r -d '' kind path; do
                if [ "$kind" != 3 ] || ! same_entry "$rendered_root/$path" "$w/uid/$path"; then
                    expect_fail "uid: render as $user differs from the default render: $path"
                fi
            done < <(tree_join "$rendered_root" "$w/uid")
        fi
    fi

    [ "$EXPECT_FAILED" -eq 1 ] || echo "EXPECT-PASS $CASE"
}

# --- run ---------------------------------------------------------------------------------------
for CASE in ${NAMES[@]+"${NAMES[@]}"}; do
    CASE_FAILED=0
    dir="$ROOT/$CASE"
    image="$(head -n 1 "$dir/image" | tr -d '[:space:]')"
    [ -n "$image" ] || { fail "render: empty image file"; continue; }
    w="$WORK/$CASE"
    mkdir -p "$w"
    rc=0
    render "$image" "$dir/fixture.env" "$w/r1" "$w/r1.log" || rc=$?
    if [ "$rc" -eq 0 ]; then render "$image" "$dir/fixture.env" "$w/r2" "$w/r2.log" || rc=$?; fi
    if [ "$rc" -ne 0 ]; then
        fail "render: exit $rc"
        tail -n 20 "$w/r1.log" "$w/r2.log" 2>/dev/null | grep -v '^==>' | indent || true
        continue
    fi

    while IFS=$'\t' read -r -d '' kind path; do
        if [ "$kind" != 3 ] || ! same_entry "$w/r1/$path" "$w/r2/$path"; then fail "nondeterministic: $path"; fi
    done < <(tree_join "$w/r1" "$w/r2")
    [ "$CASE_FAILED" -eq 0 ] || continue

    if [ "$UPDATE" -eq 1 ]; then
        rm -rf "$dir/expected"
        cp -R "$w/r1" "$dir/expected"
        chmod 0755 "$dir/expected"
        echo "UPDATED $CASE"
    fi

    EXPECTED="$dir/expected"
    RENDERED="$w/r1"
    while IFS=$'\t' read -r -d '' kind path; do
        case "$kind" in
            1) on_golden only-a "$path" ;;
            2) on_golden only-b "$path" ;;
            3) same_entry "$EXPECTED/$path" "$RENDERED/$path" || on_golden differs "$path" ;;
        esac
    done < <(tree_join "$EXPECTED" "$RENDERED")
    [ "$CASE_FAILED" -eq 1 ] || echo "PASS $CASE"

    if [ "$PARITY" -eq 1 ]; then parity_check "$dir" "$w/r1"; fi
    if [ -f "$dir/expectations.yaml" ]; then expectations_check "$dir" "$w/r1" "$w" "$image"; fi
done

exit "$FAILED"
