#!/usr/bin/env bash
# Schema check of the configuration contract (schema: docker/contract/README.md).
#
# Usage: docker/contract/validate.sh [--fixtures FILE] [CONTRACT]
#   CONTRACT          default: docker/config-contract.yaml of this repository
#   --fixtures FILE   KEY=value lines with the project's test fixtures (if FILE has fenced code
#                     blocks, only the first is read). Every fixture must belong to a declared
#                     variable (or a derived value written to .env) and match its pattern.
#
# Output: one line per problem, `SCHEMA <where>: <message>`. Values of secrets are never printed.
# Exit: 0 valid, 1 problems found, 2 usage error or unreadable input.

# V_*, D_*, I_*, O_*, Q_* arrays are created by contract_load (common.sh) with eval.
# shellcheck disable=SC2154
set -euo pipefail
CONTRACT_TOOL=validate
# shellcheck source=docker/contract/common.sh
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

usage() {
    sed -n '4,9p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//' >&2
    [ -n "${1:-}" ] && echo "error: $1" >&2
    exit 2
}

FIXTURES_FILE=""
CONTRACT=""
while [ $# -gt 0 ]; do
    case "$1" in
        --fixtures) [ $# -ge 2 ] || usage "--fixtures needs a value"; FIXTURES_FILE="$2"; shift 2 ;;
        -h | --help) usage ;;
        -*) usage "unknown option: $1" ;;
        *) [ -z "$CONTRACT" ] || usage "only one contract file"; CONTRACT="$1"; shift ;;
    esac
done
CONTRACT="${CONTRACT:-$CONTRACT_REPO_ROOT/docker/config-contract.yaml}"
[ -r "$CONTRACT" ] || usage "contract not readable: $CONTRACT"

contract_find_yq
PROBLEMS=0
problem() {
    printf 'SCHEMA %s: %s\n' "$1" "$2"
    PROBLEMS=$((PROBLEMS + 1))
}

"$YQ" 'true' "$CONTRACT" >/dev/null 2>&1 || { problem "$CONTRACT" "not valid YAML"; exit 1; }
[ "$("$YQ" 'type' "$CONTRACT")" = '!!map' ] || { problem "$CONTRACT" "top level must be a mapping"; exit 1; }

# --- top level -------------------------------------------------------------------------------
while IFS= read -r key; do
    [ -n "$key" ] || continue
    contract_in_list "$key" "${TOP_LEVEL_KEYS[@]}" || problem "top level" "unknown key '$key'"
done < <("$YQ" -r 'keys | .[]' "$CONTRACT")
[ "$("$YQ" '.version' "$CONTRACT")" = 1 ] || problem "version" "must be 1"
# variables is required; the other sections are optional (missing = empty list)
for section in variables derived internal overrides features decided decisions_needed; do
    t="$("$YQ" ".${section} | type" "$CONTRACT")"
    if [ "$t" = '!!null' ] && [ "$section" != variables ]; then continue; fi
    [ "$t" = '!!seq' ] || problem "$section" "must be a list (is $t)"
done
[ "$PROBLEMS" -eq 0 ] || exit 1

# --- helpers on loaded arrays ----------------------------------------------------------------
# check_keys WHERE PREFIX INDEX REQUIRED_FIELDS... -- ALLOWED_FIELDS...
check_keys() {
    local where="$1" prefix="$2" i="$3" f
    shift 3
    local -a required=() allowed=()
    while [ $# -gt 0 ] && [ "$1" != -- ]; do required+=("$1"); shift; done
    shift
    allowed=("$@")
    local t keys
    eval "t=\${${prefix}__t[$i]}; keys=\${${prefix}__keys[$i]}"
    if [ "$t" != '!!map' ]; then problem "$where" "must be a mapping (is $t)"; return 1; fi
    for f in "${required[@]}"; do
        case ",$keys," in *",$f,"*) ;; *) problem "$where" "missing field '$f'" ;; esac
    done
    local IFS=,
    for f in $keys; do
        contract_in_list "$f" "${allowed[@]}" || problem "$where" "unknown field '$f'"
    done
    return 0
}
# field PREFIX NAME INDEX -> value; ftype PREFIX NAME INDEX -> yq type
field() { eval "printf '%s' \"\${${1}_${2}[$3]}\""; }
ftype() { eval "printf '%s' \"\${${1}_${2}_t[$3]}\""; }

need_type() { # WHERE PREFIX FIELD INDEX TYPE...
    local where="$1" prefix="$2" f="$3" i="$4" t keys
    shift 4
    eval "keys=\${${prefix}__keys[$i]}"
    case ",$keys," in *",$f,"*) ;; *) return 1 ;; esac # missing: already reported
    t="$(ftype "$prefix" "$f" "$i")"
    contract_in_list "$t" "$@" || { problem "$where" "field '$f' must be ${*} (is $t)"; return 1; }
}
need_text() { # WHERE PREFIX FIELD INDEX: non-empty single-line string, balanced backticks
    local where="$1" prefix="$2" f="$3" i="$4" v ticks
    need_type "$where" "$prefix" "$f" "$i" '!!str' || return 1
    v="$(field "$prefix" "$f" "$i")"
    [ -n "$v" ] || { problem "$where" "field '$f' is empty"; return 1; }
    case "$v" in *$'\n'* | *$'\t'*) problem "$where" "field '$f' must be one line without tabs"; return 1 ;; esac
    ticks="${v//[!\`]/}"
    [ $((${#ticks} % 2)) -eq 0 ] || problem "$where" "field '$f' has unbalanced backticks"
}
need_list() { # WHERE PREFIX FIELD INDEX [nonempty]: list of one-line strings
    local where="$1" prefix="$2" f="$3" i="$4" v
    need_type "$where" "$prefix" "$f" "$i" '!!seq' || return 1
    v="$(field "$prefix" "$f" "$i")"
    if [ "${5:-}" = nonempty ] && [ -z "$v" ]; then problem "$where" "field '$f' must not be empty"; fi
    case "$v" in *$'\t'*) problem "$where" "field '$f' must not contain tabs" ;; esac
}
need_enum() { # WHERE PREFIX FIELD INDEX VALUE...
    local where="$1" prefix="$2" f="$3" i="$4" v
    shift 4
    need_type "$where" "$prefix" "$f" "$i" '!!str' || return 1
    v="$(field "$prefix" "$f" "$i")"
    contract_in_list "$v" "$@" || problem "$where" "field '$f' must be one of: $* (is '$v')"
}
need_sources() { # WHERE PREFIX INDEX: at least one `path:lines @ sha` citation
    local where="$1" prefix="$2" i="$3" s cited=0
    need_list "$where" "$prefix" sources "$i" nonempty || return 1
    while IFS= read -r s; do
        [ -n "$s" ] || continue
        if [[ "$s" =~ $CITATION_ERE ]]; then cited=$((cited + 1))
        elif [[ "$s" != UNVERIFIED* ]]; then problem "$where" "source is neither 'path:lines @ sha' nor UNVERIFIED: $s"
        fi
    done <<<"$(field "$prefix" sources "$i")"
    [ "$cited" -gt 0 ] || problem "$where" "needs at least one 'path:lines @ sha' source"
}

# --- variables -------------------------------------------------------------------------------
contract_load "$CONTRACT" variables V "${VAR_FIELDS[@]}"
declare -A VAR_INDEX=()
for ((i = 0; i < V_n; i++)); do
    name="${V_name[$i]}"
    where="variables[$i]${name:+ ($name)}"
    check_keys "$where" V "$i" "${VAR_REQUIRED[@]}" -- "${VAR_FIELDS[@]}" || continue

    if need_type "$where" V name "$i" '!!str'; then
        if [[ ! "$name" =~ $NAME_ERE ]]; then problem "$where" "name must match $NAME_ERE"
        elif [ -n "${VAR_INDEX[$name]+set}" ]; then problem "$where" "duplicate name (also variables[${VAR_INDEX[$name]}])"
        else VAR_INDEX[$name]=$i
        fi
    fi
    if need_type "$where" V tier "$i" '!!int'; then
        case "${V_tier[$i]}" in 1 | 2) ;; *) problem "$where" "tier must be 1 or 2" ;; esac
    fi
    need_type "$where" V required "$i" '!!bool' || true
    need_type "$where" V secret "$i" '!!bool' || true
    need_text "$where" V description "$i" || true
    need_list "$where" V consumers "$i" nonempty || true
    need_enum "$where" V status "$i" "${STATUSES[@]}" || true
    need_sources "$where" V "$i" || true
    [ "${V_setup_t[$i]}" = '!!null' ] || need_enum "$where" V setup "$i" "${SETUP_MODES[@]}" || true
    [ "${V_notes_t[$i]}" = '!!null' ] || need_text "$where" V notes "$i" || true

    pattern_ok=0
    if need_type "$where" V pattern "$i" '!!str'; then
        pattern="${V_pattern[$i]}"
        if [ -z "$pattern" ]; then problem "$where" "pattern is empty"
        elif [[ "$pattern" == *'`'* || "$pattern" == *$'\n'* ]]; then problem "$where" "pattern must not contain backticks or newlines"
        elif ! contract_ere_valid "$pattern"; then problem "$where" "pattern is not a valid ERE"
        else pattern_ok=1
        fi
    fi

    is_secret="${V_secret[$i]}"
    for f in default example; do
        t="$(ftype V "$f" "$i")"
        [ "$t" = '!!null' ] && continue
        if [ "$t" != '!!str' ]; then
            problem "$where" "$f must be a quoted string or null (is $t)"
            continue
        fi
        v="$(field V "$f" "$i")"
        case "$v" in *'`'* | *$'\n'*) problem "$where" "$f must not contain backticks or newlines"; continue ;; esac
        if [ "$f" = default ] && [ "$is_secret" = true ]; then
            problem "$where" "secrets have no default"
            continue
        fi
        if [ "$f" = example ] && [ "$is_secret" = true ] && [[ ! "$v" =~ ^fixture[a-z0-9]*notreal[0-9]*$ ]]; then
            problem "$where" "a secret's example must be null or a project fixture (fixture...notreal...)"
            continue
        fi
        if [ "$pattern_ok" -eq 1 ] && [ -n "$v" ] && ! contract_full_match "$v" "$pattern"; then
            if [ "$is_secret" = true ]; then problem "$where" "$f does not match the pattern"
            else problem "$where" "$f '$v' does not match the pattern"
            fi
        fi
    done
    if [ "${V_required[$i]}" = true ] && [ "${V_default_t[$i]}" != '!!null' ]; then
        problem "$where" "a required variable has no default (default must be null)"
    fi
    if [ "${V_tier[$i]}" = 1 ] && [ "${V_secret[$i]}" = true ] && [ "${V_setup[$i]}" != generate ]; then
        problem "$where" "Tier 1 secrets are generated by setup (setup: generate)"
    fi
done

# --- derived ---------------------------------------------------------------------------------
contract_load "$CONTRACT" derived D "${DERIVED_FIELDS[@]}"
declare -A DERIVED_NAMES=() DERIVED_ENV_FILE=()
for ((i = 0; i < D_n; i++)); do
    name="${D_name[$i]}"
    where="derived[$i]${name:+ ($name)}"
    check_keys "$where" D "$i" "${DERIVED_REQUIRED[@]}" -- "${DERIVED_FIELDS[@]}" || continue
    if need_type "$where" D name "$i" '!!str'; then
        if [[ ! "$name" =~ ^[a-z][a-z0-9_]*$ ]]; then problem "$where" "name must be a lower-case id"
        elif [ -n "${DERIVED_NAMES[$name]+set}" ]; then problem "$where" "duplicate name"
        else DERIVED_NAMES[$name]=$i
        fi
    fi
    need_text "$where" D formula "$i" || true
    need_text "$where" D description "$i" || true
    need_list "$where" D targets "$i" nonempty || true
    need_enum "$where" D status "$i" "${STATUSES[@]}" || true
    need_sources "$where" D "$i" || true
    if need_list "$where" D inputs "$i" nonempty; then
        while IFS= read -r input; do
            [ -z "$input" ] || [ -n "${VAR_INDEX[$input]+set}" ] ||
                problem "$where" "input '$input' is not a declared variable"
        done <<<"${D_inputs[$i]}"
    fi
    # every ${NAME} in the formula is a declared variable and listed in inputs
    rest="${D_formula[$i]}"
    while [[ "$rest" =~ \$\{([A-Za-z_][A-Za-z0-9_]*)\}(.*)$ ]]; do
        ref="${BASH_REMATCH[1]}"
        rest="${BASH_REMATCH[2]}"
        [ -n "${VAR_INDEX[$ref]+set}" ] || problem "$where" "formula references undeclared variable $ref"
        grep -qxF -- "$ref" <<<"${D_inputs[$i]}" || problem "$where" "formula references $ref, missing in inputs"
    done
    if [ "${D_env_t[$i]}" != '!!null' ]; then
        if need_type "$where" D env "$i" '!!str'; then
            env_name="${D_env[$i]}"
            [[ "$env_name" =~ $NAME_ERE ]] || problem "$where" "env must match $NAME_ERE"
            [ -z "${VAR_INDEX[$env_name]+set}" ] || problem "$where" "env $env_name is also a user variable"
        fi
    fi
    if [ "${D_env_file_t[$i]}" != '!!null' ]; then
        if need_type "$where" D env_file "$i" '!!bool' && [ "${D_env_file[$i]}" = true ]; then
            if [ -z "${D_env[$i]}" ]; then problem "$where" "env_file: true needs env"
            else DERIVED_ENV_FILE[${D_env[$i]}]="${D_formula[$i]}"
            fi
        fi
    fi
done

# --- internal --------------------------------------------------------------------------------
contract_load "$CONTRACT" internal I "${INTERNAL_FIELDS[@]}"
declare -A INTERNAL_SEEN=()
for ((i = 0; i < I_n; i++)); do
    name="${I_name[$i]}"
    where="internal[$i]${name:+ ($name)}"
    check_keys "$where" I "$i" "${INTERNAL_REQUIRED[@]}" -- "${INTERNAL_FIELDS[@]}" || continue
    need_text "$where" I name "$i" || continue
    need_text "$where" I consumer "$i" || true
    need_text "$where" I value "$i" || true
    need_text "$where" I description "$i" || true
    need_enum "$where" I status "$i" "${STATUSES[@]}" || true
    need_sources "$where" I "$i" || true
    key="$name@${I_consumer[$i]}"
    [ -z "${INTERNAL_SEEN[$key]+set}" ] || problem "$where" "duplicate name for consumer ${I_consumer[$i]}"
    INTERNAL_SEEN[$key]=1
    [ -z "${VAR_INDEX[$name]+set}" ] || problem "$where" "$name is also a user variable"
done

# --- overrides -------------------------------------------------------------------------------
contract_load "$CONTRACT" overrides O "${OVERRIDE_FIELDS[@]}"
declare -A OVERRIDE_PATHS=()
for ((i = 0; i < O_n; i++)); do
    where="overrides[$i]${O_path[$i]:+ (${O_path[$i]})}"
    check_keys "$where" O "$i" "${OVERRIDE_REQUIRED[@]}" -- "${OVERRIDE_FIELDS[@]}" || continue
    need_text "$where" O component "$i" || true
    if need_text "$where" O path "$i"; then
        case "${O_path[$i]}" in /*) ;; *) problem "$where" "path must be absolute" ;; esac
        [ -z "${OVERRIDE_PATHS[${O_path[$i]}]+set}" ] || problem "$where" "duplicate path"
        OVERRIDE_PATHS[${O_path[$i]}]=1
    fi
    need_enum "$where" O format "$i" "${OVERRIDE_FORMATS[@]}" || true
    need_text "$where" O merge "$i" || true
    [ "${O_env_precedence_t[$i]}" = '!!null' ] || need_text "$where" O env_precedence "$i" || true
    need_enum "$where" O support "$i" "${OVERRIDE_SUPPORT[@]}" || true
    need_enum "$where" O status "$i" "${STATUSES[@]}" || true
    need_sources "$where" O "$i" || true
done

# --- features --------------------------------------------------------------------------------
contract_load "$CONTRACT" features F "${FEATURE_FIELDS[@]}"
declare -A FEATURE_NAMES=()
features_pattern=""
[ -z "${VAR_INDEX[BBB_FEATURES]+set}" ] || features_pattern="${V_pattern[${VAR_INDEX[BBB_FEATURES]}]}"
for ((i = 0; i < F_n; i++)); do
    name="${F_name[$i]}"
    where="features[$i]${name:+ ($name)}"
    check_keys "$where" F "$i" "${FEATURE_REQUIRED[@]}" -- "${FEATURE_FIELDS[@]}" || continue
    if need_type "$where" F name "$i" '!!str'; then
        if [[ ! "$name" =~ ^[a-z][a-z0-9-]*$ ]]; then problem "$where" "name must be lower-case words joined by '-'"
        elif [ -n "${FEATURE_NAMES[$name]+set}" ]; then problem "$where" "duplicate name"
        else FEATURE_NAMES[$name]=$i
        fi
        if [ -n "$features_pattern" ] && contract_ere_valid "$features_pattern" &&
            ! contract_full_match "$name" "$features_pattern"; then
            problem "$where" "name is not accepted by the BBB_FEATURES pattern"
        fi
    fi
    need_list "$where" F services "$i" nonempty || true
    need_text "$where" F description "$i" || true
    need_enum "$where" F status "$i" "${STATUSES[@]}" || true
    if need_list "$where" F settings "$i"; then
        if [ -n "${F_settings[$i]}" ]; then
            need_sources "$where" F "$i" || true # settings must be backed by sources
        elif need_list "$where" F sources "$i"; then
            while IFS= read -r src; do
                [ -z "$src" ] || [[ "$src" =~ $CITATION_ERE ]] || [[ "$src" == UNVERIFIED* ]] ||
                    problem "$where" "source is neither 'path:lines @ sha' nor UNVERIFIED: $src"
            done <<<"${F_sources[$i]}"
        fi
    fi
done

# --- decided ---------------------------------------------------------------------------------
contract_load "$CONTRACT" decided C "${DECIDED_FIELDS[@]}"
declare -A DECISION_IDS=()
for ((i = 0; i < C_n; i++)); do
    id="${C_id[$i]}"
    where="decided[$i]${id:+ ($id)}"
    check_keys "$where" C "$i" "${DECIDED_REQUIRED[@]}" -- "${DECIDED_FIELDS[@]}" || continue
    if need_type "$where" C id "$i" '!!str'; then
        [[ "$id" =~ ^[a-z][a-z0-9-]*$ ]] || problem "$where" "id must be lower-case words joined by '-'"
        [ -z "${DECISION_IDS[$id]+set}" ] || problem "$where" "duplicate id"
        DECISION_IDS[$id]=1
    fi
    if need_type "$where" C date "$i" '!!str'; then
        [[ "${C_date[$i]}" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] || problem "$where" "date must be a quoted YYYY-MM-DD"
    fi
    need_text "$where" C choice "$i" || true
    need_text "$where" C decision "$i" || true
    [ "${C_related_t[$i]}" = '!!null' ] || need_list "$where" C related "$i" || true
    if need_list "$where" C affects "$i" nonempty; then
        while IFS= read -r a; do
            [ -z "$a" ] || [ -n "${VAR_INDEX[$a]+set}" ] || problem "$where" "affects undeclared variable $a"
        done <<<"${C_affects[$i]}"
    fi
done

# --- decisions_needed ------------------------------------------------------------------------
contract_load "$CONTRACT" decisions_needed Q "${DECISION_FIELDS[@]}"
for ((i = 0; i < Q_n; i++)); do
    id="${Q_id[$i]}"
    where="decisions_needed[$i]${id:+ ($id)}"
    check_keys "$where" Q "$i" "${DECISION_REQUIRED[@]}" -- "${DECISION_FIELDS[@]}" || continue
    if need_type "$where" Q id "$i" '!!str'; then
        [[ "$id" =~ ^[a-z][a-z0-9-]*$ ]] || problem "$where" "id must be lower-case words joined by '-'"
        [ -z "${DECISION_IDS[$id]+set}" ] || problem "$where" "duplicate id"
        DECISION_IDS[$id]=1
    fi
    need_text "$where" Q question "$i" || true
    need_text "$where" Q recommendation "$i" || true
    [ "${Q_related_t[$i]}" = '!!null' ] || need_list "$where" Q related "$i" || true
    if need_list "$where" Q affects "$i" nonempty; then
        while IFS= read -r a; do
            [ -z "$a" ] || [ -n "${VAR_INDEX[$a]+set}" ] || problem "$where" "affects undeclared variable $a"
        done <<<"${Q_affects[$i]}"
    fi
    if need_type "$where" Q options "$i" '!!seq'; then
        n_opts="$("$YQ" ".decisions_needed[$i].options | length" "$CONTRACT")"
        [ "$n_opts" -ge 2 ] || problem "$where" "needs at least two options"
        while IFS= read -r line; do
            [ -n "$line" ] && problem "$where" "$line"
        done < <("$YQ" -r ".decisions_needed[$i].options | to_entries | .[] |
            select((.value | type) != \"!!map\" or (.value.id | type) != \"!!str\" or (.value.text | type) != \"!!str\"
                   or (.value | keys | length) != 2) |
            \"options[\" + (.key | tostring) + \"] must have exactly the string fields id and text\"" "$CONTRACT")
    fi
done

# --- fixtures --------------------------------------------------------------------------------
if [ -n "$FIXTURES_FILE" ]; then
    contract_read_fixtures "$FIXTURES_FILE"
    [ "${#FIXTURE_ORDER[@]}" -gt 0 ] || problem "fixtures" "no KEY=value lines in $FIXTURES_FILE"
    for key in "${FIXTURE_ORDER[@]}"; do
        value="${FIXTURES[$key]}"
        where="fixture $key"
        if [ -n "${DERIVED_ENV_FILE[$key]+set}" ]; then
            [ "$value" = "${DERIVED_ENV_FILE[$key]}" ] ||
                problem "$where" "must equal the derived formula '${DERIVED_ENV_FILE[$key]}'"
            continue
        fi
        if [ -z "${VAR_INDEX[$key]+set}" ]; then
            problem "$where" "no such variable in the contract"
            continue
        fi
        i="${VAR_INDEX[$key]}"
        if ! contract_ere_valid "${V_pattern[$i]}"; then continue; fi
        if ! contract_full_match "$value" "${V_pattern[$i]}"; then
            if [ "${V_secret[$i]}" = true ]; then problem "$where" "does not match the pattern"
            else problem "$where" "'$value' does not match the pattern"
            fi
        fi
        if [ "${V_example_t[$i]}" != '!!null' ] && [ "${V_example[$i]}" != "$value" ]; then
            problem "$where" "the variable's example differs from the fixture"
        fi
    done
    # every Tier 1 variable has a fixture (the fixture list mirrors Tier 1)
    for ((i = 0; i < V_n; i++)); do
        if [ "${V_tier[$i]}" = 1 ] && [ -z "${FIXTURES[${V_name[$i]}]+set}" ]; then
            problem "fixtures" "Tier 1 variable ${V_name[$i]} has no fixture"
        fi
    done
fi

if [ "$PROBLEMS" -gt 0 ]; then
    echo "$PROBLEMS problem(s) in $CONTRACT" >&2
    exit 1
fi
echo "valid: $CONTRACT (${V_n} variables, ${D_n} derived, ${I_n} internal, ${O_n} overrides, ${F_n} features, ${C_n} decided, ${Q_n} open decisions)${FIXTURES_FILE:+; fixtures ok}" >&2
exit 0
