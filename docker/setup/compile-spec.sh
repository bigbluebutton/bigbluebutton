#!/usr/bin/env bash
# Build step of the setup image: compile what setup needs from the configuration contract
# (docker/config-contract.yaml) into a bash file that the entrypoint sources at run time, so the
# image needs no YAML tool and the contract stays the only source of the variable lists,
# patterns and defaults.
#
# Usage: compile-spec.sh CONTRACT OUT
#
# Reads the contract with the contract tools (docker/contract/common.sh, sourced from the
# directory next to CONTRACT). Writes OUT with one array per field, in contract order, for
# every variable that has a `setup` mode (generate, detect, ask):
#   SETUP_NAME SETUP_MODE SETUP_TIER SETUP_REQUIRED SETUP_SECRET SETUP_PATTERN
#   SETUP_HAS_DEFAULT SETUP_DEFAULT SETUP_EXAMPLE SETUP_DESCRIPTION SETUP_LENGTH
# SETUP_LENGTH is the length of a generated value (generate only): at least 32 characters,
# within the bounds of the pattern. Exits non-zero, and so fails the build, when the contract
# is invalid or a `generate` pattern is not a character class with a length bound that
# contains A-Za-z0-9 (setup generates from that alphabet only).

# V_* arrays are created by contract_load (common.sh) with eval.
# shellcheck disable=SC2154
set -euo pipefail
CONTRACT_TOOL=setup-compile

[ $# -eq 2 ] || { sed -n '2,/^$/{s/^# \{0,1\}//;p}' "$0" >&2; exit 2; }
CONTRACT="$1"
OUT="$2"

tools="$(dirname "$CONTRACT")/contract"
# shellcheck source=docker/contract/common.sh
source "$tools/common.sh"
"$tools/validate.sh" "$CONTRACT" >&2 || contract_die "the contract is invalid"
contract_find_yq
contract_load "$CONTRACT" variables V name tier required secret default pattern setup description example

SETUP_NAME=() SETUP_MODE=() SETUP_TIER=() SETUP_REQUIRED=() SETUP_SECRET=() SETUP_PATTERN=()
SETUP_HAS_DEFAULT=() SETUP_DEFAULT=() SETUP_EXAMPLE=() SETUP_DESCRIPTION=() SETUP_LENGTH=()

# A generated value: characters from A-Za-z0-9, length from the pattern's bound.
GENERATE_ERE='^\[A-Za-z0-9[^]]*\]\{([0-9]+),([0-9]*)\}$'
MIN_LENGTH=32

for ((i = 0; i < V_n; i++)); do
    mode="${V_setup[$i]}"
    [ -n "$mode" ] || continue
    length=""
    if [ "$mode" = generate ]; then
        [[ "${V_pattern[$i]}" =~ $GENERATE_ERE ]] ||
            contract_die "${V_name[$i]}: setup cannot generate a value for pattern ${V_pattern[$i]}"
        min="${BASH_REMATCH[1]}" max="${BASH_REMATCH[2]}"
        length=$((min > MIN_LENGTH ? min : MIN_LENGTH))
        if [ -n "$max" ] && [ "$length" -gt "$max" ]; then length="$max"; fi
    fi
    SETUP_NAME+=("${V_name[$i]}")
    SETUP_MODE+=("$mode")
    SETUP_TIER+=("${V_tier[$i]}")
    SETUP_REQUIRED+=("${V_required[$i]}")
    SETUP_SECRET+=("${V_secret[$i]}")
    SETUP_PATTERN+=("${V_pattern[$i]}")
    if [ "${V_default_t[$i]}" = '!!null' ]; then SETUP_HAS_DEFAULT+=(false); else SETUP_HAS_DEFAULT+=(true); fi
    SETUP_DEFAULT+=("${V_default[$i]}")
    SETUP_EXAMPLE+=("${V_example[$i]}")
    SETUP_DESCRIPTION+=("${V_description[$i]}")
    SETUP_LENGTH+=("$length")
done
[ "${#SETUP_NAME[@]}" -gt 0 ] || contract_die "no variable has a setup mode"

{
    echo "# Generated at build time by compile-spec.sh from docker/config-contract.yaml. Do not edit."
    declare -p SETUP_NAME SETUP_MODE SETUP_TIER SETUP_REQUIRED SETUP_SECRET SETUP_PATTERN \
        SETUP_HAS_DEFAULT SETUP_DEFAULT SETUP_EXAMPLE SETUP_DESCRIPTION SETUP_LENGTH
} >"$OUT"
echo "setup-compile: ${#SETUP_NAME[@]} variables: ${SETUP_NAME[*]}" >&2
