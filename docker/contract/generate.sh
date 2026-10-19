#!/usr/bin/env bash
# Generate the files derived from the configuration contract.
#
# Usage: docker/contract/generate.sh [--check] [--root DIR] [--contract FILE]
#   --check           write nothing; exit 1 if a committed output differs from what would be
#                     generated (or is missing), and show the difference
#   --root DIR        repository root the outputs are relative to (default: this repository)
#   --contract FILE   contract to read (default: DIR/docker/config-contract.yaml)
#
# Outputs (relative to the root):
#   .env.sample                                         Tier 1 variables, for `.env`
#   docs/docs/administration/docker-configuration.md    reference of all variables and files
# The output depends only on the contract: same contract, byte-identical files.
# Exit: 0 ok, 1 --check found a difference or the contract is invalid, 2 usage error.

# V_*, D_*, I_*, O_*, F_*, C_*, Q_* arrays are created by contract_load (common.sh) with eval.
# shellcheck disable=SC2154
set -euo pipefail
CONTRACT_TOOL=generate
# shellcheck source=docker/contract/common.sh
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

OUT_ENV=.env.sample
OUT_DOC=docs/docs/administration/docker-configuration.md

usage() {
    sed -n '4,9p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//' >&2
    [ -n "${1:-}" ] && echo "error: $1" >&2
    exit 2
}

CHECK=0
ROOT="$CONTRACT_REPO_ROOT"
CONTRACT=""
while [ $# -gt 0 ]; do
    case "$1" in
        --check) CHECK=1; shift ;;
        --root) [ $# -ge 2 ] || usage "--root needs a value"; ROOT="$2"; shift 2 ;;
        --contract) [ $# -ge 2 ] || usage "--contract needs a value"; CONTRACT="$2"; shift 2 ;;
        -h | --help) usage ;;
        *) usage "unknown argument: $1" ;;
    esac
done
[ -d "$ROOT" ] || usage "root is not a directory: $ROOT"
CONTRACT="${CONTRACT:-$ROOT/docker/config-contract.yaml}"
[ -r "$CONTRACT" ] || usage "contract not readable: $CONTRACT"

# schema problems (stdout of validate.sh) go to stderr; its "valid" summary is dropped
if ! "$CONTRACT_TOOLS_DIR/validate.sh" "$CONTRACT" >&2 2>/dev/null; then
    echo "generate: the contract is invalid; run docker/contract/validate.sh" >&2
    exit 1
fi

contract_find_yq
contract_load "$CONTRACT" variables V "${VAR_FIELDS[@]}"
contract_load "$CONTRACT" derived D "${DERIVED_FIELDS[@]}"
contract_load "$CONTRACT" internal I "${INTERNAL_FIELDS[@]}"
contract_load "$CONTRACT" overrides O "${OVERRIDE_FIELDS[@]}"
contract_load "$CONTRACT" features F "${FEATURE_FIELDS[@]}"
contract_load "$CONTRACT" decided C "${DECIDED_FIELDS[@]}"
contract_load "$CONTRACT" decisions_needed Q "${DECISION_FIELDS[@]}"

# --- text helpers ------------------------------------------------------------------------------

# comment_wrap TEXT — TEXT as `# ` comment lines of at most 90 columns.
comment_wrap() {
    printf '%s\n' "$1" | fold -s -w 88 | sed -e 's/[[:space:]]*$//' -e 's/^/# /'
}

# md_escape_plain TEXT [table] — escape characters that MDX or a table cell would interpret.
md_escape_plain() {
    local s="$1"
    s="${s//\\/\\\\}"
    s="${s//\{/\\\{}"
    s="${s//\}/\\\}}"
    s="${s//</\\<}"
    s="${s//>/\\>}"
    [ "${2:-}" = table ] && s="${s//|/\\|}"
    printf '%s' "$s"
}

# md_text TEXT [table] — Markdown text: escape outside code spans, keep code spans (backticks
# are balanced, validate.sh checks that); in tables, `|` is escaped inside code spans too.
md_text() {
    local s="$1" mode="${2:-}" out="" part in_code=0
    while [[ "$s" == *'`'* ]]; do
        part="${s%%\`*}"
        s="${s#*\`}"
        if [ "$in_code" -eq 0 ]; then
            out+="$(md_escape_plain "$part" "$mode")\`"
            in_code=1
        else
            [ "$mode" = table ] && part="${part//|/\\|}"
            out+="$part\`"
            in_code=0
        fi
    done
    out+="$(md_escape_plain "$s" "$mode")"
    printf '%s' "$out"
}

# md_code VALUE [table] — VALUE as a code span.
md_code() {
    local s="$1"
    [ "${2:-}" = table ] && s="${s//|/\\|}"
    # shellcheck disable=SC2016 # literal backticks of a Markdown code span
    printf '`%s`' "$s"
}

# md_source SOURCE — `path:lines @ sha` as code, an optional "— note" as text.
md_source() {
    local s="$1" cite note
    if [[ "$s" == *' — '* ]]; then
        cite="${s%% — *}"
        note="${s#* — }"
        printf '%s — %s' "$(md_code "$cite")" "$(md_text "$note")"
    else
        md_code "$s"
    fi
}

# join_lines SEP TEXT — newline-separated list joined with SEP.
join_lines() {
    local sep="$1" out="" line
    while IFS= read -r line; do
        [ -n "$line" ] || continue
        out+="${out:+$sep}$line"
    done <<<"$2"
    printf '%s' "$out"
}

# show_example INDEX — examples are shown except for secrets and values setup generates.
show_example() {
    [ "${V_secret[$1]}" != true ] && [ "${V_setup[$1]}" != generate ] && [ "${V_example_t[$1]}" != '!!null' ]
}

yes_no() { if [ "$1" = true ]; then printf yes; else printf no; fi; }

setup_text() {
    case "$1" in
        generate) printf 'generated by setup' ;;
        detect) printf 'detected by setup when empty' ;;
        ask) printf 'asked by setup' ;;
        *) printf '—' ;;
    esac
}

status_text() {
    case "$1" in
        draft) printf 'draft' ;;
        pending-g2 | pending-g3) printf 'pending' ;;
    esac
}

# --- .env.sample -------------------------------------------------------------------------------

# env_value INDEX — the value .env.sample shows: the default, else empty (secrets, values that
# setup generates, detects or asks for, and required values without default stay empty).
env_value() {
    if [ "${V_default_t[$1]}" != '!!null' ]; then printf '%s' "${V_default[$1]}"; fi
}

gen_env() {
    local i d line setup
    cat <<'EOF'
# BigBlueButton container stack: essential settings (Tier 1).
#
# Generated from docker/config-contract.yaml by docker/contract/generate.sh. Do not edit:
# change the contract and run the generator.
#
# `docker compose run --rm setup` writes .env from this file: it generates the secrets,
# detects the public addresses and asks for the rest. To write .env by hand, copy this file
# and fill in every required value. Optional settings (Tier 2) and override files (Tier 3)
# are described in docs/docs/administration/docker-configuration.md.
EOF
    for ((i = 0; i < V_n; i++)); do
        [ "${V_tier[$i]}" = 1 ] || continue
        echo
        comment_wrap "${V_description[$i]}"
        line="$( [ "${V_required[$i]}" = true ] && printf 'Required.' || printf 'Optional.')"
        [ "${V_secret[$i]}" = true ] && line+=" Secret."
        if [ -n "${V_setup[$i]}" ]; then
            setup="$(setup_text "${V_setup[$i]}")"
            line+=" ${setup^}."
        fi
        if show_example "$i"; then
            line+=" Example: ${V_example[$i]}"
        fi
        comment_wrap "$line"
        printf '# Format: %s\n' "${V_pattern[$i]}"
        printf '%s=%s\n' "${V_name[$i]}" "$(env_value "$i")"
    done
    for ((d = 0; d < D_n; d++)); do
        [ "${D_env_file[$d]}" = true ] || continue
        echo
        comment_wrap "${D_description[$d]}"
        printf '%s=%s\n' "${D_env[$d]}" "${D_formula[$d]}"
    done
}

# --- documentation page --------------------------------------------------------------------------

doc_variable_table() { # TIER
    local i
    echo '| Variable | Required | Default | Description |'
    echo '|---|---|---|---|'
    for ((i = 0; i < V_n; i++)); do
        [ "${V_tier[$i]}" = "$1" ] || continue
        local def='—'
        if [ "${V_default_t[$i]}" != '!!null' ]; then def="$(md_code "${V_default[$i]}" table)"
        elif [ -n "${V_setup[$i]}" ]; then def="($(setup_text "${V_setup[$i]}"))"
        fi
        printf '| [%s](#%s) | %s | %s | %s |\n' "$(md_code "${V_name[$i]}" table)" "${V_name[$i],,}" \
            "$(yes_no "${V_required[$i]}")" "$def" "$(md_text "${V_description[$i]}" table)"
    done
}

doc_variable_details() { # TIER
    local i s
    for ((i = 0; i < V_n; i++)); do
        [ "${V_tier[$i]}" = "$1" ] || continue
        echo
        printf '### %s\n\n' "${V_name[$i]}"
        printf '%s\n\n' "$(md_text "${V_description[$i]}")"
        printf -- '- **Required:** %s. **Secret:** %s.\n' "$(yes_no "${V_required[$i]}")" "$(yes_no "${V_secret[$i]}")"
        if [ "${V_default_t[$i]}" != '!!null' ]; then
            printf -- '- **Default:** %s\n' "$(md_code "${V_default[$i]}")"
        else
            printf -- '- **Default:** none\n'
        fi
        [ -n "${V_setup[$i]}" ] && printf -- '- **Setup:** %s\n' "$(setup_text "${V_setup[$i]}")"
        printf -- '- **Format:** %s (extended regular expression, whole value)\n' "$(md_code "${V_pattern[$i]}")"
        if show_example "$i"; then
            printf -- '- **Example:** %s\n' "$(md_code "${V_example[$i]}")"
        fi
        printf -- '- **Used by:** %s\n' "$(join_lines ', ' "${V_consumers[$i]}")"
        printf -- '- **Status:** %s\n' "$(status_text "${V_status[$i]}")"
        [ -n "${V_notes[$i]}" ] && printf -- '- **Note:** %s\n' "$(md_text "${V_notes[$i]}")"
        printf -- '- **Sources:**\n'
        while IFS= read -r s; do
            [ -n "$s" ] && printf '  - %s\n' "$(md_source "$s")"
        done <<<"${V_sources[$i]}"
    done
}

gen_doc() {
    local i d o q f c settings applied
    cat <<'EOF'
---
id: docker-configuration
slug: /administration/docker-configuration
title: Container Configuration Reference
sidebar_position: 12
description: Environment variables and override files of the BigBlueButton container images
keywords:
- docker
- configuration
---

:::note

Generated from `docker/config-contract.yaml` by `docker/contract/generate.sh`; do not edit this
page by hand. The contract is a **draft**: names, defaults and formats may still change.

:::

The BigBlueButton container images configure themselves at start from environment variables.
Compose only passes the variables on; the same images and variables work with other
orchestrators.

## How configuration works

| Tier | What | Where | Who sets it |
|---|---|---|---|
| 1 | Essential values | `.env` (template: `.env.sample`) | the setup container or the admin |
| 2 | Advanced values with defaults | `.env`, optional | admins with special needs |
| 3 | Override files | mounted at the same paths as on a bare-metal server | admins following the existing BigBlueButton documentation |

- Every value has a format (an extended regular expression the whole value must match). Every
  image entrypoint enforces it: an image refuses to start when a required value is missing or
  a value does not have its format, and names the variable (never the value) in its log. The
  setup and preflight containers check the same formats.
- Derived values (URLs, TURN URIs, per-service settings) are computed by the images. Do not set
  them.
- Set `BBB_FEATURES` in `.env`; Compose derives the profiles from it, and the images derive
  their settings from it (see [Features](#features)).
- bbb-webhooks and bbb-webrtc-sfu (node-config) give environment variables precedence over
  their Tier 3 file: settings the image passes as variables cannot be changed in the file.
  The Tier 3 table lists them.
- Booleans are `true` or `false`; lists are comma-separated without spaces.

Status of an entry: **draft** (agreed, not yet released), **pending** (depends on an open
question; see [Decisions](#decisions)).

## Tier 1: essential settings

EOF
    doc_variable_table 1
    doc_variable_details 1
    cat <<'EOF'

## Tier 2: advanced settings

Optional. Unset variables take the default shown.

EOF
    doc_variable_table 2
    doc_variable_details 2
    cat <<'EOF'

## Features

Entries of `BBB_FEATURES`. Each one starts the services of the Compose profile of the same
name, and the images derive the settings listed.

| Feature | Starts | Settings the images derive | Description |
|---|---|---|---|
EOF
    for ((f = 0; f < F_n; f++)); do
        settings="$(join_lines '; ' "${F_settings[$f]}")"
        printf '| %s | %s | %s | %s |\n' "$(md_code "${F_name[$f]}" table)" \
            "$(md_text "$(join_lines ', ' "${F_services[$f]}")" table)" "$(md_text "${settings:-—}" table)" \
            "$(md_text "${F_description[$f]}" table)"
    done
    cat <<'EOF'

## Derived values

Computed by the images from the variables above. They are listed so that the mapping to the
upstream configuration keys is visible; they are not settings.

| Value | Formula | Used for | Status |
|---|---|---|---|
EOF
    for ((d = 0; d < D_n; d++)); do
        printf '| %s | %s | %s | %s |\n' "$(md_code "${D_name[$d]}" table)" "$(md_code "${D_formula[$d]}" table)" \
            "$(md_text "$(join_lines '; ' "${D_targets[$d]}")" table)" "$(status_text "${D_status[$d]}")"
    done
    cat <<'EOF'

## Container wiring

Fixed values the images or the compose file set so that the services find each other. They
are not settings; changing them breaks the stack.

| Name | Service | Value | Purpose |
|---|---|---|---|
EOF
    for ((i = 0; i < I_n; i++)); do
        printf '| %s | %s | %s | %s |\n' "$(md_code "${I_name[$i]}" table)" "$(md_text "${I_consumer[$i]}" table)" \
            "$(md_code "${I_value[$i]}" table)" "$(md_text "${I_description[$i]}" table)"
    done
    cat <<'EOF'

## Tier 3: override files

Mount a file at the path shown to change settings that have no variable. The path is the
same as on a bare-metal server, so the existing documentation applies.

| Service | Path | Format | How it is applied | In containers |
|---|---|---|---|---|
EOF
    for ((o = 0; o < O_n; o++)); do
        applied="${O_merge[$o]}"
        [ -z "${O_env_precedence[$o]}" ] || applied+=" **Environment first:** ${O_env_precedence[$o]}"
        printf '| %s | %s | %s | %s | %s |\n' "$(md_text "${O_component[$o]}" table)" "$(md_code "${O_path[$o]}" table)" \
            "${O_format[$o]}" "$(md_text "$applied" table)" "${O_support[$o]}"
    done
    cat <<'EOF'

## Decisions

Decisions taken on this configuration contract.

| Decision | Date | Choice |
|---|---|---|
EOF
    for ((c = 0; c < C_n; c++)); do
        printf '| %s | %s | (%s) %s |\n' "$(md_code "${C_id[$c]}" table)" "${C_date[$c]}" \
            "$(md_text "${C_choice[$c]}" table)" "$(md_text "${C_decision[$c]}" table)"
    done
    echo
    if [ "$Q_n" -eq 0 ]; then
        echo 'No questions are open.'
    else
        echo 'Open questions; variables they affect have the status "pending".'
    fi
    for ((q = 0; q < Q_n; q++)); do
        echo
        printf '### %s\n\n' "${Q_id[$q]}"
        printf '%s\n\n' "$(md_text "${Q_question[$q]}")"
        while IFS=$'\t' read -r oid otext; do
            [ -n "$oid" ] && printf -- '- **(%s)** %s\n' "$oid" "$(md_text "$otext")"
        done < <("$YQ" -r ".decisions_needed[$q].options[] | .id + \"\t\" + .text" "$CONTRACT")
        printf '\n**Recommendation:** %s\n\n' "$(md_text "${Q_recommendation[$q]}")"
        # shellcheck disable=SC2016 # literal backticks of a Markdown code span
        printf '**Affects:** %s\n' "$(join_lines ', ' "${Q_affects[$q]}" | sed 's/[^, ][^, ]*/`&`/g')"
    done
}

# --- write or check ------------------------------------------------------------------------------

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
gen_env >"$TMP/env"
gen_doc >"$TMP/doc"

rc=0
for pair in "env:$OUT_ENV" "doc:$OUT_DOC"; do
    src="$TMP/${pair%%:*}"
    dest="$ROOT/${pair#*:}"
    if [ "$CHECK" -eq 1 ]; then
        if [ ! -f "$dest" ]; then
            echo "generate --check: ${pair#*:} is missing" >&2
            rc=1
        elif ! diff -u --label "${pair#*:} (committed)" --label "${pair#*:} (generated)" "$dest" "$src"; then
            echo "generate --check: ${pair#*:} differs from the contract; run docker/contract/generate.sh" >&2
            rc=1
        fi
    elif [ ! -f "$dest" ] || ! cmp -s "$src" "$dest"; then
        mkdir -p "$(dirname "$dest")"
        cat "$src" >"$dest"
        echo "generate: wrote ${pair#*:}" >&2
    else
        echo "generate: ${pair#*:} is up to date" >&2
    fi
done
[ "$CHECK" -eq 0 ] || [ "$rc" -ne 0 ] || echo "generate --check: outputs match the contract" >&2
exit "$rc"
