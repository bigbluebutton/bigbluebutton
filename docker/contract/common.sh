# shellcheck shell=bash
# Shared functions of the contract tools (validate.sh, generate.sh, drift-check.sh).
# Sourced, not executed. Requires bash >= 4.4 and mikefarah/yq v4 (`yq` or upstream's `yq-go`).

# The constants below are used by the scripts that source this file.
# shellcheck disable=SC2034
CONTRACT_TOOLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTRACT_REPO_ROOT="$(cd "$CONTRACT_TOOLS_DIR/../.." && pwd)"

# Field lists per section (schema: docker/contract/README.md).
VAR_FIELDS=(name tier required secret default pattern setup description consumers example status sources notes)
VAR_REQUIRED=(name tier required secret default pattern description consumers example status sources)
DERIVED_FIELDS=(name formula inputs env env_file targets description status sources)
DERIVED_REQUIRED=(name formula inputs targets description status sources)
INTERNAL_FIELDS=(name consumer value description status sources)
INTERNAL_REQUIRED=("${INTERNAL_FIELDS[@]}")
OVERRIDE_FIELDS=(component path format merge env_precedence support status sources)
OVERRIDE_REQUIRED=(component path format merge support status sources)
FEATURE_FIELDS=(name services settings description status sources)
FEATURE_REQUIRED=("${FEATURE_FIELDS[@]}")
DECIDED_FIELDS=(id date choice decision affects related)
DECIDED_REQUIRED=(id date choice decision affects)
DECISION_FIELDS=(id question options recommendation affects related)
DECISION_REQUIRED=(id question options recommendation affects)
TOP_LEVEL_KEYS=(version meta variables derived internal overrides features decided decisions_needed)

STATUSES=(draft pending-g2 pending-g3)
SETUP_MODES=(generate detect ask)
OVERRIDE_FORMATS=(properties xml hocon yaml json env ini nginx shell)
OVERRIDE_SUPPORT=(supported not-supported pending)

# `path:lines @ sha`, the citation form of this project.
CITATION_ERE='^[A-Za-z0-9_./@{}-]+:[0-9]+(-[0-9]+)?(,[0-9]+(-[0-9]+)?)* @ [0-9a-f]{7,40}( .*)?$'
# Upper-case environment variable name.
NAME_ERE='^[A-Z][A-Z0-9_]*$'

contract_die() {
    printf '%s: ERROR: %s\n' "${CONTRACT_TOOL:-contract}" "$1" >&2
    exit 2
}

# Find yq v4 (as the entrypoint helper does: `yq`, then upstream's `yq-go`).
contract_find_yq() {
    local candidate
    for candidate in yq yq-go; do
        if command -v "$candidate" >/dev/null 2>&1 &&
            "$candidate" --version 2>/dev/null | grep -q 'mikefarah/yq.* v4\.'; then
            YQ="$candidate"
            return 0
        fi
    done
    contract_die "mikefarah/yq v4 not found (looked for yq, yq-go)"
}

# contract_in_list WORD LIST... — true if WORD is one of LIST.
contract_in_list() {
    local word="$1" item
    shift
    for item in "$@"; do [ "$item" = "$word" ] && return 0; done
    return 1
}

# contract_ere_valid ERE — true if bash accepts ERE (anchored as the entrypoint helper does).
contract_ere_valid() {
    local re="^($1)\$" rc=0
    # shellcheck disable=SC2319 # the status of [[ ]] itself is wanted: 2 means invalid ERE
    [[ "" =~ $re ]] || rc=$?
    [ "$rc" -ne 2 ]
}

# contract_full_match VALUE ERE — the whole VALUE matches ERE (same anchoring as
# bbb_require_match in docker/lib/entrypoint-lib.sh).
contract_full_match() {
    local re="^($2)\$"
    [[ "$1" =~ $re ]]
}

# contract_load FILE SECTION PREFIX FIELD... — load a list section into bash arrays:
#   ${PREFIX}_n            number of items
#   ${PREFIX}__t[i]        yq type of item i (!!map expected)
#   ${PREFIX}__keys[i]     its keys, comma-separated
#   ${PREFIX}_<f>[i]       field value as a string ("" for null; lists joined with newlines)
#   ${PREFIX}_<f>_t[i]     yq type of the field (!!str, !!int, !!bool, !!null, !!seq, ...)
# Values are quoted by yq's @sh encoder before eval.
contract_load() {
    local file="$1" section="$2" prefix="$3" field expr code
    shift 3
    expr=".${section} // [] | to_entries | .[] | (.key | tostring) as \$i | .value as \$o |"
    expr+=" ((\$o | select(type == \"!!map\")) // {}) as \$v | ("
    expr+=" (\"${prefix}__t[\" + \$i + \"]=\" + (\$o | type | @sh)),"
    expr+=" (\"${prefix}__keys[\" + \$i + \"]=\" + (\$v | keys | join(\",\") | @sh))"
    for field in "$@"; do
        expr+=", (\"${prefix}_${field}[\" + \$i + \"]=\" + (("
        expr+="(\$v.${field} | select(type == \"!!seq\") | map(tostring) | join(\"\n\"))"
        expr+=" // (\$v.${field} | select(type != \"!!null\") | tostring) // \"\") | @sh))"
        expr+=", (\"${prefix}_${field}_t[\" + \$i + \"]=\" + (\$v.${field} | type | @sh))"
    done
    expr+=" )"
    code="$("$YQ" -r "$expr" "$file")" || contract_die "cannot read section $section of $file"
    eval "declare -g -a ${prefix}__t=() ${prefix}__keys=()"
    for field in "$@"; do eval "declare -g -a ${prefix}_${field}=() ${prefix}_${field}_t=()"; done
    eval "$code"
    eval "${prefix}_n=\${#${prefix}__t[@]}"
    # a missing key has an empty type: normalize to !!null
    local i n
    eval "n=\$${prefix}_n"
    for field in "$@"; do
        for ((i = 0; i < n; i++)); do
            eval "[ -n \"\${${prefix}_${field}_t[$i]}\" ] || ${prefix}_${field}_t[$i]='!!null'"
        done
    done
}

# contract_read_fixtures FILE — KEY=value lines into the associative array FIXTURES. If FILE
# contains fenced code blocks, only the first block is read (Markdown fixture lists).
contract_read_fixtures() {
    local file="$1" line in_block=0 fenced=0
    declare -g -A FIXTURES=()
    declare -g -a FIXTURE_ORDER=()
    [ -r "$file" ] || contract_die "fixtures file not readable: $file"
    grep -q '^```' "$file" && fenced=1
    while IFS= read -r line || [ -n "$line" ]; do
        if [ "$fenced" -eq 1 ]; then
            case "$line" in
                '```'*) if [ "$in_block" -eq 0 ]; then in_block=1; continue; else break; fi ;;
            esac
            [ "$in_block" -eq 1 ] || continue
        fi
        line="${line%%#*}"
        line="${line%"${line##*[![:space:]]}"}"
        [[ "$line" =~ ^([A-Z][A-Z0-9_]*)=(.*)$ ]] || continue
        FIXTURES["${BASH_REMATCH[1]}"]="${BASH_REMATCH[2]}"
        FIXTURE_ORDER+=("${BASH_REMATCH[1]}")
    done <"$file"
}
