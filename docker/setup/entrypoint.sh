#!/usr/bin/env bash
# setup: writes .env for docker-compose.yml.
#
# Usage: docker compose run --rm setup [--non-interactive] [--dir DIR]
#
#   --non-interactive  ask nothing: values to ask for (and detected addresses) come from the
#                      environment variables of the same name (docker compose run -e NAME=...),
#                      optional ones fall back to their default; a missing required value is an
#                      error that names the variable
#   --dir DIR          directory of docker-compose.yml (default /project, where the compose
#                      service mounts it)
#
# What it does, for every variable of docker/config-contract.yaml with a `setup` mode (the
# list is compiled into the image at build time):
#   - starts from DIR/.env if it exists, else from the .env.sample generated from the same
#     contract (shipped in the image);
#   - keeps every value .env already has (required: non-empty; optional: any line, also an
#     empty one) and prints the names it kept; a kept value must match its pattern;
#   - generate: a random value from /dev/urandom (A-Za-z0-9), matching the pattern;
#   - ask: asks on the terminal (stdin), validated against the pattern;
#   - detect (public addresses): proposes the address of the default route's interface if it
#     is a public one (local information only: no network access, no external service) and
#     asks to confirm it; behind NAT (a floating IP) type the public address;
#   - writes DIR/.env atomically with mode 0600, owned by the owner of the old .env (else of
#     DIR); if nothing changed, the file is left alone, so a second run changes nothing.
# Variables that are missing from .env are appended at its end. Values are never printed,
# only variable names.
#
# Exit: 0 .env complete, 1 a value is missing or invalid (the message names the variable),
# 2 usage error.

set -euo pipefail
BBB_LOG_TAG=setup
# shellcheck source=docker/lib/entrypoint-lib.sh
source /usr/local/lib/bbb/entrypoint-lib.sh
SHARE=/usr/local/share/bbb/setup
# shellcheck source=/dev/null
source "$SHARE/spec.sh"

usage() { sed -n '2,/^$/{s/^# \{0,1\}//;p}' "$0" >&2; exit 2; }

interactive=1
dir=/project
while [ $# -gt 0 ]; do
    case "$1" in
        --non-interactive) interactive=0; shift ;;
        --dir) [ $# -ge 2 ] || usage; dir="$2"; shift 2 ;;
        -h | --help) usage ;;
        *) bbb_log "unknown argument: $1"; usage ;;
    esac
done
[ -d "$dir" ] || bbb_die "$dir is not a directory (mount the directory of docker-compose.yml there)"
env_file="$dir/.env"

# --- .env as lines -----------------------------------------------------------------------

lines=()
declare -A line_of=() value_of=()

# env_value LINE — the value of a KEY=VALUE line as Docker Compose reads it: quotes removed;
# for unquoted values, an inline comment (` #...`) and surrounding blanks removed.
env_value() {
    local v="${1#*=}"
    v="${v#"${v%%[![:space:]]*}"}"
    case "$v" in
        \"*\"*) v="${v#\"}"; v="${v%\"*}" ;;
        \'*\'*) v="${v#\'}"; v="${v%\'*}" ;;
        *) v="${v%%[[:space:]]#*}"; v="${v%"${v##*[![:space:]]}"}" ;;
    esac
    printf '%s' "$v"
}

# load FILE — read FILE into lines; line_of/value_of hold the last line of each key.
load() {
    local i line key re='^[[:space:]]*(export[[:space:]]+)?([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*='
    mapfile -t lines <"$1"
    for i in "${!lines[@]}"; do
        line="${lines[$i]}"
        [[ "$line" =~ $re ]] || continue
        key="${BASH_REMATCH[2]}"
        line_of[$key]="$i"
        value_of[$key]="$(env_value "$line")"
    done
}

if [ -e "$env_file" ]; then
    [ -f "$env_file" ] && [ -r "$env_file" ] || bbb_die "$env_file is not a readable file"
    load "$env_file"
    from_existing=1
    bbb_log "reading $env_file"
else
    load "$SHARE/env.sample"
    from_existing=0
    bbb_log "no $env_file yet: starting from .env.sample"
fi

# --- values ------------------------------------------------------------------------------

matches() { local re="^($2)\$"; [[ "$1" =~ $re ]]; }

is_placeholder() {
    local p
    for p in "${BBB_SECRET_PLACEHOLDERS[@]}"; do [ "${1,,}" = "${p,,}" ] && return 0; done
    return 1
}

# generate LENGTH — print LENGTH random characters from A-Za-z0-9 (rejection sampling of
# /dev/urandom bytes by tr, so every character is equally likely).
generate() {
    local v=""
    while [ "${#v}" -lt "$1" ]; do
        v+="$(head -c 4096 /dev/urandom | LC_ALL=C tr -dc 'A-Za-z0-9')"
    done
    printf '%s' "${v:0:$1}"
}

# Public unicast address, not a private, shared (CGNAT), loopback, link-local, documentation
# or reserved range: only such an address can be the server's public address.
public_ipv4() {
    local a b
    IFS=. read -r a b _ _ <<<"$1"
    case "$a" in
        0 | 10 | 127 | 22[4-9] | 23[0-9] | 24[0-9] | 25[0-5]) return 1 ;;
        100) [ "$b" -lt 64 ] || [ "$b" -gt 127 ] ;;
        169) [ "$b" != 254 ] ;;
        172) [ "$b" -lt 16 ] || [ "$b" -gt 31 ] ;;
        192) [ "$b" != 168 ] && [[ "$1" != 192.0.2.* ]] && [[ "$1" != 192.0.0.* ]] ;;
        198) [ "$b" != 18 ] && [ "$b" != 19 ] && [[ "$1" != 198.51.100.* ]] ;;
        203) [[ "$1" != 203.0.113.* ]] ;;
        *) return 0 ;;
    esac
}
public_ipv6() {
    case "${1,,}" in
        2001:db8:* | 2001:0db8:*) return 1 ;;
        [23]*) return 0 ;;
        *) return 1 ;;
    esac
}

# detect NAME — set DETECTED to a proposal for a public address from the local routing table
# and interface addresses (`ip`; no traffic is sent), or to empty if there is none.
# DETECT_PRIVATE=1: the default route's interface has only non-public addresses (NAT).
detect() {
    local family dev addr
    DETECTED="" DETECT_PRIVATE=0
    case "$1" in
        BBB_PUBLIC_IPV4) family=-4 ;;
        BBB_PUBLIC_IPV6) family=-6 ;;
        *) return 0 ;;
    esac
    dev="$(ip "$family" route show default 2>/dev/null | sed -n 's/.* dev \([^ ]*\).*/\1/p' | head -n 1)" || true
    [ -n "$dev" ] || return 0
    while read -r addr; do
        addr="${addr%/*}"
        if { [ "$family" = -4 ] && public_ipv4 "$addr"; } || { [ "$family" = -6 ] && public_ipv6 "$addr"; }; then
            DETECTED="$addr"
            return 0
        fi
        DETECT_PRIVATE=1
    done < <(ip "$family" -o addr show dev "$dev" scope global 2>/dev/null |
        sed -n 's/.* inet6\{0,1\} \([^ ]*\).*/\1/p')
    return 0
}

# ask NAME INDEX PROPOSAL — ask for a value on stdin until it is valid; sets ANSWER.
ask() {
    local name="$1" i="$2" proposal="$3" hint reply
    local required="${SETUP_REQUIRED[$i]}" pattern="${SETUP_PATTERN[$i]}"
    printf '\n%s\n' "$(printf '%s' "${SETUP_DESCRIPTION[$i]}" | fold -s -w 88)" >&2
    [ -n "${SETUP_EXAMPLE[$i]}" ] && printf 'Example: %s\n' "${SETUP_EXAMPLE[$i]}" >&2
    hint=""
    [ -n "$proposal" ] && hint=" [Enter: $proposal]"
    [ "$required" != true ] && [ -n "$proposal" ] && hint+=" ['-': none]"
    [ "$required" != true ] && [ -z "$proposal" ] && hint=" [Enter: none]"
    while :; do
        printf '%s%s: ' "$name" "$hint" >&2
        IFS= read -r reply || bbb_die "no answer for $name (end of input); use --non-interactive to read it from the environment"
        reply="${reply#"${reply%%[![:space:]]*}"}"
        reply="${reply%"${reply##*[![:space:]]}"}"
        if [ -z "$reply" ]; then
            reply="$proposal"
        elif [ "$reply" = - ] && [ "$required" != true ]; then
            reply=""
        fi
        if [ -z "$reply" ]; then
            [ "$required" != true ] && { ANSWER=""; return 0; }
            echo "$name is required." >&2
        elif matches "$reply" "$pattern"; then
            ANSWER="$reply"
            return 0
        else
            printf '%s must match: %s\n' "$name" "$pattern" >&2
        fi
    done
}

declare -A new_value=()
missing=() kept=() generated=() answered=()

for i in "${!SETUP_NAME[@]}"; do
    name="${SETUP_NAME[$i]}" mode="${SETUP_MODE[$i]}" pattern="${SETUP_PATTERN[$i]}"
    present=0
    [ -n "${line_of[$name]+x}" ] && present=1
    current="${value_of[$name]:-}"

    # Already set in .env: keep it.
    if [ "$from_existing" = 1 ] && [ "$present" = 1 ] &&
        { [ -n "$current" ] || [ "${SETUP_REQUIRED[$i]}" != true ]; }; then
        if [ -n "$current" ] && ! matches "$current" "$pattern"; then
            bbb_die "$name in $env_file does not match its format ($pattern); correct it, or empty it to have setup fill it"
        fi
        if [ "${SETUP_SECRET[$i]}" = true ] && is_placeholder "$current"; then
            bbb_die "$name in $env_file is a known placeholder; empty it to have setup generate it"
        fi
        kept+=("$name")
        continue
    fi

    case "$mode" in
        generate)
            value="$(generate "${SETUP_LENGTH[$i]}")"
            matches "$value" "$pattern" || bbb_die "generated $name does not match its pattern (image bug)"
            new_value[$name]="$value"
            generated+=("$name")
            continue
            ;;
        ask)
            proposal="$current"
            [ -z "$proposal" ] && [ "$present" = 0 ] && [ "${SETUP_HAS_DEFAULT[$i]}" = true ] &&
                proposal="${SETUP_DEFAULT[$i]}"
            ;;
        detect)
            detect "$name"
            proposal="$DETECTED"
            ;;
        *) bbb_die "unknown setup mode $mode for $name (image bug)" ;;
    esac

    if [ "$interactive" = 0 ]; then
        if [ -n "${!name+x}" ]; then
            value="${!name}"
        elif [ -n "$proposal" ] || [ "${SETUP_REQUIRED[$i]}" != true ]; then
            value="$proposal"
        else
            missing+=("$name")
            continue
        fi
        if [ -z "$value" ] && [ "${SETUP_REQUIRED[$i]}" = true ]; then
            missing+=("$name")
            continue
        fi
        if [ -n "$value" ] && ! matches "$value" "$pattern"; then
            bbb_die "$name does not match its format ($pattern)"
        fi
    else
        # A value from the environment is the proposal, if it is valid.
        if [ -n "${!name:-}" ] && matches "${!name}" "$pattern"; then proposal="${!name}"; fi
        if [ "$mode" = detect ]; then
            if [ -n "$proposal" ]; then
                printf '\n%s: proposed from the address of the default route (check it; behind NAT type the public address).\n' "$name" >&2
            elif [ "$DETECT_PRIVATE" = 1 ]; then
                printf '\n%s: the default route has only a private address (NAT?): type the public address.\n' "$name" >&2
            else
                printf '\n%s: no address found locally (setup has no network access): type it.\n' "$name" >&2
            fi
        fi
        ask "$name" "$i" "$proposal"
        value="$ANSWER"
    fi
    new_value[$name]="$value"
    answered+=("$name")
done

if [ "${#missing[@]}" -gt 0 ]; then
    bbb_die "missing required value(s): ${missing[*]} (pass them with docker compose run -e NAME=... setup --non-interactive)"
fi

# --- write .env --------------------------------------------------------------------------

appended=()
for i in "${!SETUP_NAME[@]}"; do
    name="${SETUP_NAME[$i]}"
    [ -n "${new_value[$name]+x}" ] || continue
    if [ -n "${line_of[$name]+x}" ]; then
        lines[${line_of[$name]}]="$name=${new_value[$name]}"
    else
        [ "${#appended[@]}" -eq 0 ] && lines+=("" "# Added by docker compose run --rm setup.")
        lines+=("")
        while IFS= read -r c; do lines+=("# $c"); done < <(printf '%s\n' "${SETUP_DESCRIPTION[$i]}" | fold -s -w 88 | sed 's/[[:space:]]*$//')
        lines+=("$name=${new_value[$name]}")
        appended+=("$name")
    fi
done

[ "${#kept[@]}" -eq 0 ] || bbb_log "kept (already set): ${kept[*]}"
[ "${#generated[@]}" -eq 0 ] || bbb_log "generated: ${generated[*]}"
[ "${#answered[@]}" -eq 0 ] || bbb_log "set: ${answered[*]}"
[ "${#appended[@]}" -eq 0 ] || bbb_log "appended to .env: ${appended[*]}"

umask 077
tmp="$(mktemp "$dir/.env.setup.XXXXXX")" || bbb_die "cannot create a file in $dir"
trap 'rm -f "$tmp"' EXIT
printf '%s\n' "${lines[@]}" >"$tmp"
chmod 0600 "$tmp"

if [ "$from_existing" = 1 ] && cmp -s "$tmp" "$env_file" &&
    [ "$(stat -c %a "$env_file")" = 600 ]; then
    bbb_log "$env_file is complete; nothing changed"
    exit 0
fi

# Owned by whoever owns the old .env, else the directory (as root: the invoking user's files
# stay theirs; as any other user the file is that user's own).
if [ "$(id -u)" = 0 ]; then
    owner="$(stat -c %u:%g "$([ "$from_existing" = 1 ] && echo "$env_file" || echo "$dir")")"
    chown "$owner" "$tmp" || bbb_die "cannot give $env_file the owner $owner"
fi
mv -f "$tmp" "$env_file" || bbb_die "cannot replace $env_file"
trap - EXIT
bbb_log "wrote $env_file (mode 0600)"
