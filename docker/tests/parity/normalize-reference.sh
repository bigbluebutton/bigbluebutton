#!/usr/bin/env bash
# Build the normalized bare-metal parity reference from a collection archive of a bare-metal
# test server.
#
# Usage: normalize-reference.sh ARCHIVE OUTDIR
#   ARCHIVE  <name>-<timestamp>.tar.gz (one top directory with files/ and commands/)
#   OUTDIR   new or empty directory; receives <component>/<bare-metal path> for every file in
#            the SELECTION list below
#
# Normalization (README.md has the rules and the reasons):
#   __REDACTED_<NAME>__     -> the fixture value of the mapped variable (PLACEHOLDERS below);
#                              an unknown NAME is an error
#   real hostname           -> bbb.example.com    (read from bbb-web.properties serverURL)
#   real public IPv4        -> 203.0.113.10       (read from turnserver.conf relay-ip)
#   per-build/host values   -> __PARITY_<NAME>__  (TOKENS below)
# Nothing else is changed. Afterwards the output is checked: no placeholder, no hostname or its
# domain, no IPv4 literal outside loopback, unspecified, broadcast, private and documentation
# ranges.
# The script prints the archive checksum and replacement counts, never a real value.
# Same archive -> byte-identical tree.

set -euo pipefail

FIXTURE_DOMAIN=bbb.example.com
FIXTURE_IPV4=203.0.113.10

# Archive placeholder name -> fixture variable, and the fixture values (the project's test
# fixtures; these are the only secret-like values allowed in tests).
declare -A PLACEHOLDERS=(
    [BBB_SHARED_SECRET]=BBB_SHARED_SECRET
    [LIVEKIT_API_KEY]=LIVEKIT_API_KEY
    [LIVEKIT_API_SECRET]=LIVEKIT_API_SECRET
    [TURN_SECRET]=TURN_SECRET
    [HASURA_ADMIN_SECRET]=HASURA_ADMIN_SECRET
    # FreeSWITCH is not shipped: no fixture variable, a token instead.
    [ESL_PASSWORD]=__PARITY_ESL_PASSWORD__
)
declare -A FIXTURES=(
    [BBB_SHARED_SECRET]=fixturebbbsharedsecretnotreal0000000000000000000
    [LIVEKIT_API_KEY]=fixturelivekitapikey
    [LIVEKIT_API_SECRET]=fixturelivekitapisecretnotreal000000000000000000
    [TURN_SECRET]=fixtureturnsecretnotreal000000000000000000000000
    [HASURA_ADMIN_SECRET]=fixturehasuraadminsecretnotreal00000000000000000
)

# Per-build or per-host values without a placeholder: <reference path>|<ERE prefix>|<token>.
# The rest of a matching line after the prefix is replaced by the token.
TOKENS=(
    "html5/usr/share/bigbluebutton/html5-client/private/config/settings.yml|^ *html5ClientBuild: |__PARITY_HTML5_CLIENT_BUILD__"
)

# <component> <bare-metal path>: the files the images render (README.md: why each one).
SELECTION="
bbb-web /usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties
bbb-web /etc/bigbluebutton/bbb-web.properties
bbb-web /usr/share/bbb-web/WEB-INF/classes/spring/turn-stun-servers.xml
bbb-web /etc/default/bbb-web
akka-apps /usr/share/bbb-apps-akka/conf/application.conf
akka-apps /etc/bigbluebutton/bbb-apps-akka.conf
html5 /usr/share/bigbluebutton/html5-client/private/config/settings.yml
html5 /etc/bigbluebutton/bbb-html5.yml
graphql-server /etc/default/bbb-graphql-server
graphql-server /etc/default/bbb-graphql-server-admin-pass
graphql-server /usr/share/bbb-graphql-server/config.yaml
graphql-server /usr/share/bbb-graphql-server/metadata/databases/databases.yaml
graphql-middleware /usr/share/bbb-graphql-middleware/config.yml
export-annotations /usr/local/bigbluebutton/bbb-export-annotations/config/settings.json
shared-notes /usr/share/bbb-shared-notes-server/config/default.yml
livekit /usr/share/livekit-server/livekit.yaml
livekit /etc/bigbluebutton/livekit.yaml
coturn /etc/turnserver.conf
bbb-webrtc-sfu /usr/local/bigbluebutton/bbb-webrtc-sfu/config/default.yml
bbb-webrtc-sfu /etc/bigbluebutton/bbb-webrtc-sfu/production.yml
bbb-webrtc-recorder /etc/bbb-webrtc-recorder/bbb-webrtc-recorder.yml
bbb-webrtc-recorder /etc/default/bbb-webrtc-recorder
recording /usr/local/bigbluebutton/core/scripts/bigbluebutton.yml
recording /usr/local/bigbluebutton/core/scripts/presentation.yml
nginx /etc/nginx/nginx.conf
nginx /etc/nginx/sites-available/bigbluebutton
nginx /etc/nginx/sites-available/hasura-loadbalancer.conf
nginx /etc/nginx/conf.d/bbb-graphql-client-settings-cache.conf
nginx /usr/share/bigbluebutton/include_default.nginx
nginx /usr/share/bigbluebutton/nginx/bbb-html5.nginx
nginx /usr/share/bigbluebutton/nginx/bbb-shared-notes-server.nginx
nginx /usr/share/bigbluebutton/nginx/default-fe.nginx
nginx /usr/share/bigbluebutton/nginx/graphql.nginx
nginx /usr/share/bigbluebutton/nginx/learning-dashboard.nginx
nginx /usr/share/bigbluebutton/nginx/livekit.nginx
nginx /usr/share/bigbluebutton/nginx/loadbalancer.nginx
nginx /usr/share/bigbluebutton/nginx/playback.nginx
nginx /usr/share/bigbluebutton/nginx/plugins-assets-cors.nginx
nginx /usr/share/bigbluebutton/nginx/presentation-slides.nginx
nginx /usr/share/bigbluebutton/nginx/presentation.nginx
nginx /usr/share/bigbluebutton/nginx/web
nginx /usr/share/bigbluebutton/nginx/webrtc-sfu.nginx
haproxy /etc/haproxy/haproxy.cfg
haproxy /etc/haproxy/protocolmap
postgres /etc/postgresql/16/main/conf.d/bbb-pg.conf
"

usage() {
    sed -n '4,8p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//' >&2
    [ -n "${1:-}" ] && echo "error: $1" >&2
    exit 2
}
die() { echo "error: $1" >&2; exit 1; }

[ $# -eq 2 ] || usage "expected ARCHIVE and OUTDIR"
ARCHIVE="$1"
OUTDIR="$2"
[ -f "$ARCHIVE" ] || usage "archive not found: $ARCHIVE"
if [ -e "$OUTDIR" ]; then
    [ -d "$OUTDIR" ] || usage "OUTDIR exists and is not a directory: $OUTDIR"
    [ -z "$(find "$OUTDIR" -mindepth 1 -print -quit)" ] || usage "OUTDIR is not empty: $OUTDIR"
fi

export LC_ALL=C
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# --- unpack ------------------------------------------------------------------------------------
mkdir "$TMP/src"
tar -xzf "$ARCHIVE" -C "$TMP/src" --no-same-owner --no-same-permissions
mapfile -t tops < <(find "$TMP/src" -mindepth 1 -maxdepth 1)
[ "${#tops[@]}" -eq 1 ] && [ -d "${tops[0]}/files" ] && [ -d "${tops[0]}/commands" ] ||
    die "archive must hold exactly one top directory with files/ and commands/"
FILES="${tops[0]}/files"
COMMANDS="${tops[0]}/commands"

# --- host values (read, never printed) ---------------------------------------------------------
HOST="$(sed -n 's|^bigbluebutton\.web\.serverURL=https\{0,1\}://\([^/]*\)/*$|\1|p' \
    "$FILES/etc/bigbluebutton/bbb-web.properties" 2>/dev/null | tail -n 1)"
if ! [[ "$HOST" =~ ^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$ ]] || [[ "$HOST" =~ ^[0-9.]+$ ]]; then
    die "no hostname in serverURL of /etc/bigbluebutton/bbb-web.properties"
fi
DOMAIN="$(printf '%s' "$HOST" | awk -F. '{ print $(NF - 1) "." $NF }')"
IPV4="$(sed -n 's/^relay-ip=//p' "$FILES/etc/turnserver.conf" 2>/dev/null | tail -n 1)"
[[ "$IPV4" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]] || die "no relay-ip in /etc/turnserver.conf"
grep -qF " $IPV4/" "$COMMANDS/ip-br-addr.txt" ||
    die "relay-ip of /etc/turnserver.conf is not an interface address in commands/ip-br-addr.txt"

# --- select ------------------------------------------------------------------------------------
STAGE="$TMP/out"
mkdir "$STAGE"
REFS=()
while read -r component path; do
    [ -n "$component" ] || continue
    src="$FILES$path"
    [ -f "$src" ] && [ ! -L "$src" ] || die "not a regular file in the archive: $path"
    ref="$component$path"
    mkdir -p "$(dirname "$STAGE/$ref")"
    cp "$src" "$STAGE/$ref"
    REFS+=("$ref")
done <<<"$SELECTION"

# --- normalize ---------------------------------------------------------------------------------
count() { grep -oF -- "$1" "$2" | wc -l | tr -d ' ' || true; }
esc() { printf '%s' "$1" | sed 's/[.[\*^$|]/\\&/g'; }

declare -A TOTAL=() NFILES=()
RULES=()
note() { # rule ref n
    [ "$3" -gt 0 ] || return 0
    [ -n "${TOTAL[$1]+x}" ] || { RULES+=("$1"); TOTAL[$1]=0; NFILES[$1]=0; }
    TOTAL[$1]=$((TOTAL[$1] + $3))
    NFILES[$1]=$((NFILES[$1] + 1))
    PERFILE+=("  $2: $1: $3")
}
PERFILE=()

mapfile -t names < <(cd "$STAGE" && grep -rhoE '__REDACTED_[A-Za-z0-9_]+__' . | sed 's/^__REDACTED_//; s/__$//' | sort -u)
for name in ${names[@]+"${names[@]}"}; do
    [ -n "${PLACEHOLDERS[$name]+x}" ] || die "placeholder without a mapping: __REDACTED_${name}__"
done

ip_re="$(esc "$IPV4")"
host_re="$(esc "$HOST")"
for ref in "${REFS[@]}"; do
    f="$STAGE/$ref"
    for name in ${names[@]+"${names[@]}"}; do
        target="${PLACEHOLDERS[$name]}"
        value="${FIXTURES[$target]:-$target}"
        n="$(count "__REDACTED_${name}__" "$f")"
        [ "$n" -eq 0 ] && continue
        sed -i "s|__REDACTED_${name}__|$value|g" "$f"
        if [ "$value" = "$target" ]; then
            note "__REDACTED_${name}__ -> $target (token)" "$ref" "$n"
        else
            note "__REDACTED_${name}__ -> fixture $target ($value)" "$ref" "$n"
        fi
    done

    n="$(count "$HOST" "$f")"
    if [ "$n" -gt 0 ]; then
        sed -i "s|$host_re|$FIXTURE_DOMAIN|g" "$f"
        note "real hostname -> $FIXTURE_DOMAIN" "$ref" "$n"
    fi

    before="$(count "$IPV4" "$f")"
    if [ "$before" -gt 0 ]; then
        # Whole addresses only (not a prefix of a longer number); repeated for adjacent matches.
        for _ in 1 2; do
            sed -E -i "s/(^|[^0-9.])$ip_re([^0-9.]|\$)/\1$FIXTURE_IPV4\2/g" "$f"
        done
        note "real public IPv4 -> $FIXTURE_IPV4" "$ref" "$((before - $(count "$IPV4" "$f")))"
    fi

    for t in "${TOKENS[@]}"; do
        IFS='|' read -r tref tre token <<<"$t"
        [ "$tref" = "$ref" ] || continue
        n="$(grep -cE -- "$tre" "$f" || true)"
        [ "$n" -gt 0 ] || die "token rule matches nothing in $ref: $tre"
        sed -E -i "s/($tre).*\$/\1$token/" "$f"
        note "$token" "$ref" "$n"
    done
done

# --- checks ------------------------------------------------------------------------------------
problems=0
problem() { echo "check failed: $1" >&2; problems=$((problems + 1)); }
(cd "$STAGE" && grep -rlF '__REDACTED_' .) >"$TMP/hits" || true
while IFS= read -r p; do problem "${p#./}: placeholder left"; done <"$TMP/hits"
(cd "$STAGE" && grep -rliF -e "$HOST" -e "$DOMAIN" .) >"$TMP/hits" || true
while IFS= read -r p; do problem "${p#./}: real hostname or its domain"; done <"$TMP/hits"
# Every dotted quad, also inside longer dotted numbers (stricter than needed, never laxer).
(cd "$STAGE" && grep -rnoE '([0-9]{1,3}\.){3}[0-9]{1,3}' . || true) | sed 's|^\./||' >"$TMP/ips"
while IFS= read -r hit; do
    addr="${hit##*:}"
    case "$addr" in
        0.0.0.0 | 255.255.255.255 | 127.* | 10.* | 192.168.* | 192.0.2.* | 198.51.100.* | 203.0.113.*) ;;
        172.1[6-9].* | 172.2[0-9].* | 172.3[01].*) ;;
        *) problem "${hit%:*}: IPv4 literal outside the allowed ranges" ;;
    esac
done <"$TMP/ips"
[ "$problems" -eq 0 ] || die "$problems check(s) failed; nothing written"

mkdir -p "$OUTDIR"
cp -R "$STAGE/." "$OUTDIR/"
find "$OUTDIR" -type d -exec chmod 0755 {} +
find "$OUTDIR" -type f -exec chmod 0644 {} +

# --- report ------------------------------------------------------------------------------------
echo "source: $(basename "$ARCHIVE") sha256 $(sha256sum "$ARCHIVE" | cut -d' ' -f1)"
echo "files: ${#REFS[@]}"
echo "replacements (total in files):"
for r in "${RULES[@]}"; do echo "  $r: ${TOTAL[$r]} in ${NFILES[$r]}"; done
echo "replacements per file:"
printf '%s\n' "${PERFILE[@]}" | sort
echo "checks: no placeholder, hostname, domain or public IPv4 left"
