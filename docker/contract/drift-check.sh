#!/usr/bin/env bash
# Compare the configuration contract with the variables that compose files, entrypoints and
# templates actually use. Rules and limits: docker/contract/README.md ("Drift check").
#
# Usage: docker/contract/drift-check.sh [--root DIR] [--contract FILE] [PATH...]
#   --root DIR        repository root (default: this repository); output paths are relative to it
#   --contract FILE   contract (default: DIR/docker/config-contract.yaml)
#   PATH...           files or directories to scan, relative to DIR or absolute. Default: the
#                     compose files at the root, docker/, */docker/ and */docker-entrypoint.sh,
#                     minus the contract tooling, the tests and the shared helper.
#
# Output (stdout), in this order:
#   UNDECLARED <VAR> <file:line>   used, but neither a contract variable, nor internal wiring,
#                                  nor a derived env name, nor assigned by a shell script of
#                                  the same image scope
#   UNUSED <VAR>                   contract variable with status draft that nothing uses
# Notes on stderr (`NOTE ...`) do not count as findings.
# Exit: 0 no finding, 1 at least one finding, 2 usage error.

set -euo pipefail
CONTRACT_TOOL=drift-check
# shellcheck source=docker/contract/common.sh
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

usage() {
    sed -n '4,10p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//' >&2
    [ -n "${1:-}" ] && echo "error: $1" >&2
    exit 2
}

ROOT="$CONTRACT_REPO_ROOT"
CONTRACT=""
PATHS=()
while [ $# -gt 0 ]; do
    case "$1" in
        --root) [ $# -ge 2 ] || usage "--root needs a value"; ROOT="$2"; shift 2 ;;
        --contract) [ $# -ge 2 ] || usage "--contract needs a value"; CONTRACT="$2"; shift 2 ;;
        -h | --help) usage ;;
        --) shift; PATHS+=("$@"); break ;;
        -*) usage "unknown option: $1" ;;
        *) PATHS+=("$1"); shift ;;
    esac
done
[ -d "$ROOT" ] || usage "root is not a directory: $ROOT"
ROOT="$(cd "$ROOT" && pwd)"
CONTRACT="${CONTRACT:-$ROOT/docker/config-contract.yaml}"
[ -r "$CONTRACT" ] || usage "contract not readable: $CONTRACT"
IGNORE_FILE="$CONTRACT_TOOLS_DIR/drift-ignore.txt"
[ -r "$IGNORE_FILE" ] || usage "ignore list not readable: $IGNORE_FILE"

contract_find_yq

# --- declared names --------------------------------------------------------------------------
declare -A DECLARED=() SCAN_STATUS=() IGNORED=()
declare -a VAR_ORDER=()
while IFS=$'\t' read -r name status; do
    [ -n "$name" ] || continue
    DECLARED[$name]=variable
    SCAN_STATUS[$name]="$status"
    VAR_ORDER+=("$name")
done < <("$YQ" -r '.variables[] | .name + "\t" + .status' "$CONTRACT")
while IFS= read -r name; do
    [[ "$name" =~ $NAME_ERE ]] && DECLARED[$name]=internal
done < <("$YQ" -r '.internal[].name, (.derived[] | select(.env != null) | .env)' "$CONTRACT")
while IFS= read -r line || [ -n "$line" ]; do
    line="${line%%#*}"
    for name in $line; do IGNORED[$name]=1; done
done <"$IGNORE_FILE"

# --- files to scan ---------------------------------------------------------------------------
# excluded: path relative to ROOT is one of these (default scan only)
excluded() {
    case "$1" in
        docker/contract/* | docker/tests/* | docker/lib/* | docker/config-contract.yaml) return 0 ;;
        *.md | */Dockerfile | Dockerfile | */Dockerfile.* | */.dockerignore) return 0 ;;
    esac
    return 1
}

FILES=()
add_tree() { # PATH (absolute), apply exclusions?
    local p="$1" filter="$2" f rel
    if [ -f "$p" ]; then
        rel="${p#"$ROOT"/}"
        if [ "$filter" = no ] || ! excluded "$rel"; then FILES+=("$p"); fi
        return 0
    fi
    while IFS= read -r -d '' f; do
        rel="${f#"$ROOT"/}"
        if [ "$filter" = yes ] && excluded "$rel"; then continue; fi
        grep -Iq . "$f" 2>/dev/null || continue # skip binary and empty files
        FILES+=("$f")
    done < <(find "$p" -type f -print0 | sort -z)
}

if [ "${#PATHS[@]}" -gt 0 ]; then
    for p in "${PATHS[@]}"; do
        case "$p" in /*) ;; *) p="$ROOT/$p" ;; esac
        [ -e "$p" ] || usage "no such file or directory: $p"
        add_tree "$p" no
    done
else
    shopt -s nullglob
    for p in "$ROOT"/docker-compose*.yml "$ROOT"/docker-compose*.yaml "$ROOT"/compose*.yml \
        "$ROOT"/compose*.yaml "$ROOT"/docker "$ROOT"/*/docker "$ROOT"/*/docker-entrypoint.sh; do
        add_tree "$p" yes
    done
    shopt -u nullglob
fi

# --- extraction ------------------------------------------------------------------------------
# Prints `KIND<TAB>NAME<TAB>LINE` per occurrence; KIND is `use` or `assign`.
# shellcheck disable=SC2016 # an awk program, not shell
EXTRACT_AWK='
function emit(kind, name) { print kind "\t" name "\t" FNR }
function upper_name(s) { return s ~ /^[A-Z_][A-Z0-9_]*$/ }
# references $NAME / ${NAME} / ${?NAME}; any_case=1 for compose files
function refs(s, any_case,   tok, name) {
    while (match(s, /\$\{?\??[A-Za-z_][A-Za-z0-9_]*/)) {
        tok = substr(s, RSTART, RLENGTH)
        s = substr(s, RSTART + RLENGTH)
        name = tok; sub(/^\$\{?\??/, "", name)
        if (substr(tok, 2, 1) != "{" && mode == "template") continue
        if (any_case || upper_name(name)) emit("use", name)
    }
}
# arguments of bbb_* helper calls that take variable names
function helper_args(s,   n, a, i, fn, arg, skip, first) {
    while (match(s, /bbb_(require_secret|require_match|require|default|write_shell_vars)[ \t]+[^;&|)#]*/)) {
        n = split(substr(s, RSTART, RLENGTH), a, /[ \t]+/)
        fn = a[1]; s = substr(s, RSTART + RLENGTH)
        skip = 0; first = 1
        for (i = 2; i <= n; i++) {
            arg = a[i]; gsub(/["\047]/, "", arg)
            if (skip) { skip = 0; continue }
            if (arg == "--mode") { skip = 1; continue }
            if (fn == "bbb_write_shell_vars" && first) { first = 0; continue }
            if (upper_name(arg)) emit("use", arg)
            if (fn == "bbb_require_match" || fn == "bbb_default") break
        }
    }
}
function assignments(s,   t, name) {
    t = s
    # NAME= at the start of a statement, optionally after export/local/declare/readonly/typeset
    while (match(t, /(^|[;&|(])[ \t]*((export|local|declare|readonly|typeset)([ \t]+-[a-zA-Z]+)*[ \t]+)?[A-Z_][A-Z0-9_]*\+?=/)) {
        name = substr(t, RSTART, RLENGTH); sub(/\+?=$/, "", name); sub(/^.*[^A-Z0-9_]/, "", name)
        emit("assign", name); t = substr(t, RSTART + RLENGTH)
    }
    t = s
    while (match(t, /(for|printf[ \t]+-v|read([ \t]+-[a-z]+)*)[ \t]+[A-Z_][A-Z0-9_]*/)) {
        name = substr(t, RSTART, RLENGTH); sub(/^.*[ \t]/, "", name)
        emit("assign", name); t = substr(t, RSTART + RLENGTH)
    }
}
/^[ \t]*#/ { next }
{
    line = $0
    if (mode == "compose") {
        gsub(/\$\$/, "", line)
        if (line ~ /^[ \t]*env_file[ \t]*:/) print "note\tenv_file\t" FNR
        refs(line, 1)
    } else if (mode == "shell") {
        refs(line, 0)
        helper_args(line)
        t = line
        while (match(t, /(str)?env\([A-Z_][A-Z0-9_]*\)/)) {
            name = substr(t, RSTART, RLENGTH); sub(/^(str)?env\(/, "", name); sub(/\)$/, "", name)
            emit("use", name); t = substr(t, RSTART + RLENGTH)
        }
        assignments(line)
    } else {
        refs(line, 0)
    }
}'

file_mode() { # FILE -> compose | shell | template
    local base
    base="$(basename "$1")"
    case "$base" in
        docker-compose*.yml | docker-compose*.yaml | compose*.yml | compose*.yaml) echo compose; return ;;
        *.sh) echo shell; return ;;
    esac
    if head -n 1 "$1" | grep -Eq '^#!.*(ba|da|z|k)?sh\b'; then echo shell; else echo template; fi
}

# scope_of REL — image scope of a file: docker/<name> for files below docker/, else the first
# path component (<component> for <component>/docker/... and <component>/docker-entrypoint.sh);
# a file at the root is its own scope. Names assigned in any shell script of a scope are local
# to all files of that scope (an entrypoint derives a value, its templates use it).
scope_of() {
    case "$1" in
        docker/*/*) local rest="${1#docker/}"; printf 'docker/%s' "${rest%%/*}" ;;
        */*) printf '%s' "${1%%/*}" ;;
        *) printf '%s' "$1" ;;
    esac
}

declare -A USED=() SCOPE_LOCAL=() OCCURRENCES=()
for f in "${FILES[@]}"; do
    rel="${f#"$ROOT"/}"
    mode="$(file_mode "$f")"
    OCCURRENCES[$rel]="$(awk -v mode="$mode" "$EXTRACT_AWK" "$f")" || contract_die "cannot scan $rel"
    scope="$(scope_of "$rel")"
    while IFS=$'\t' read -r kind name line; do
        [ "$kind" = assign ] && SCOPE_LOCAL[$scope:$name]=1
    done <<<"${OCCURRENCES[$rel]}"
done

FINDINGS=0
for f in "${FILES[@]}"; do
    rel="${f#"$ROOT"/}"
    scope="$(scope_of "$rel")"
    declare -A seen=()
    while IFS=$'\t' read -r kind name line; do
        case "$kind" in
            note) printf 'NOTE %s:%s env_file: variables passed this way are invisible to the drift check\n' "$rel" "$line" >&2 ;;
            use)
                USED[$name]=1
                [ -n "${DECLARED[$name]+set}" ] && continue
                [ -n "${IGNORED[$name]+set}" ] && continue
                [ -n "${SCOPE_LOCAL[$scope:$name]+set}" ] && continue
                [ -z "${seen[$name:$line]+set}" ] || continue
                seen[$name:$line]=1
                printf 'UNDECLARED %s %s:%s\n' "$name" "$rel" "$line"
                FINDINGS=$((FINDINGS + 1))
                ;;
        esac
    done <<<"${OCCURRENCES[$rel]}"
    unset seen
done

for name in "${VAR_ORDER[@]}"; do
    [ "${SCAN_STATUS[$name]}" = draft ] || continue
    [ -n "${USED[$name]+set}" ] && continue
    printf 'UNUSED %s\n' "$name"
    FINDINGS=$((FINDINGS + 1))
done

echo "drift-check: ${#FILES[@]} file(s) scanned, $FINDINGS finding(s)" >&2
[ "$FINDINGS" -eq 0 ]
