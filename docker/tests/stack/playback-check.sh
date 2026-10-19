#!/usr/bin/env bash
# Playback check for a running stack with the `recording` profile, through haproxy and nginx as
# a browser reaches it:
#   player       /playback/presentation/2.3/<recordId> is the player's index.html (served by the
#                playback service; its routes fall back to index.html), and its script bundle
#                loads
#   redirect     the presentation format's 2.0 URL redirects to the 2.3 player
#   recording    a file placed in bbb-data below published/presentation/<recordId>/ is served
#                at /presentation/<recordId>/ (nginx reads the volume read-only); other paths
#                there give 404
# The record id is a fake one; its directory is removed again afterwards.
#
# Usage: docker/tests/stack/playback-check.sh [OPTION...]
#
#   --domain NAME     BBB_DOMAIN of the stack (default bbb.example.com)
#   --docker CMD      docker CLI to use (default `docker`)
#   --network NAME    the stack's `bbb` network (default bigbluebutton_bbb)
#   --volume NAME     the stack's bbb-data volume (default bigbluebutton_bbb-data)
#   --image IMG       image with bash, curl and coreutils for the client and the volume writer
#                     (default localhost/bbb-nginx:4.0.1)
#
# The client runs on the `bbb` network, where BBB_DOMAIN resolves to haproxy; it does not verify
# the certificate (test CA). The test file is written with the owner of the volume's top
# directory, as the recording processing would write it. Prints `STEP <name>: OK|FAIL ...` and
# exits 0 if every step passed, 1 otherwise, 2 on a usage error.

set -euo pipefail

usage() { sed -n '2,/^$/{s/^# \{0,1\}//;p}' "$0" >&2; exit 2; }

domain=bbb.example.com
docker_cmd=docker
network=bigbluebutton_bbb
volume=bigbluebutton_bbb-data
image=localhost/bbb-nginx:4.0.1
while [ $# -gt 0 ]; do
    case "$1" in
        --domain) [ $# -ge 2 ] || usage; domain="$2"; shift 2 ;;
        --docker) [ $# -ge 2 ] || usage; docker_cmd="$2"; shift 2 ;;
        --network) [ $# -ge 2 ] || usage; network="$2"; shift 2 ;;
        --volume) [ $# -ge 2 ] || usage; volume="$2"; shift 2 ;;
        --image) [ $# -ge 2 ] || usage; image="$2"; shift 2 ;;
        -h | --help) usage ;;
        *) echo "unknown option: $1" >&2; usage ;;
    esac
done
[[ "$domain" =~ ^[A-Za-z0-9.-]+$ ]] || usage

read -r -a DOCKER <<<"$docker_cmd"
# A record id as bbb-web forms it: <sha1 of the meeting id>-<creation time in ms>.
RECORD_ID="$(printf 'playback-check-%s' "$$" | sha1sum | cut -c1-40)-1700000000000"
MARKER="playback-check $RECORD_ID"
failed=0
step() { echo "STEP $1: $2 $3"; [ "$2" != FAIL ] || failed=1; }

# client CURL-ARG...: curl on the bbb network.
client() {
    "${DOCKER[@]}" run --rm --network "$network" --entrypoint curl "$image" \
        -ksS --max-time 20 "$@"
}
# status URL: sets code, type and location (the HTTP status, content type and redirect target).
status() {
    local out
    out="$(client -o /dev/null -w '%{http_code} %{content_type} %{redirect_url}' "$1" 2>/dev/null || true)"
    read -r code type location <<<"$out"
}
# body URL: the response body, empty unless the status is 2xx.
body() { client -f "$1" 2>/dev/null || true; }

# writer SCRIPT: a shell script with the volume at /v, as root, which only creates and removes
# the test directory, with the owner of the volume's top directory.
writer() {
    "${DOCKER[@]}" run --rm --network none --user 0 --entrypoint bash -v "$volume:/v" "$image" \
        -ec "$1" bash "$RECORD_ID" "$MARKER"
}

base="https://$domain"

# player
url="$base/playback/presentation/2.3/$RECORD_ID"
status "$url"
index="$(body "$url")"
if [ "${code:-}" = 200 ] && [[ "${type:-}" == text/html* ]] && [[ "$index" == *"<title>Playback</title>"* ]]; then
    step player OK "$url: HTTP 200 $type, the player's index.html"
else
    step player FAIL "$url: HTTP ${code:-none} ${type:-}"
fi
bundle="$(grep -oE '/playback/presentation/2\.3/static/js/main\.[0-9a-f]+\.js' <<<"$index" | head -n1 || true)"
if [ -n "$bundle" ]; then
    status "$base$bundle"
    if [ "${code:-}" = 200 ] && [[ "${type:-}" == *javascript* ]]; then
        step player-bundle OK "$bundle: HTTP 200 $type"
    else
        step player-bundle FAIL "$bundle: HTTP ${code:-none} ${type:-}"
    fi
else
    step player-bundle FAIL "index.html names no main.<hash>.js"
fi

# redirect (presentation.nginx)
url="$base/playback/presentation/2.0/playback.html?meetingId=$RECORD_ID"
status "$url"
if [ "${code:-}" = 301 ] && [ "${location:-}" = "$base/playback/presentation/2.3/$RECORD_ID?meetingId=$RECORD_ID" ]; then
    step redirect OK "2.0 playback.html: 301 to /playback/presentation/2.3/$RECORD_ID?meetingId=..."
else
    step redirect FAIL "2.0 playback.html: HTTP ${code:-none} ${location:-no location}"
fi

# recording (presentation.nginx, from the bbb-data volume)
# shellcheck disable=SC2016 # expanded by the shell in the container
if writer '
    owner="$(stat -c %u:%g /v)"
    for d in /v/published /v/published/presentation; do
        [ -d "$d" ] || install -d -o "${owner%:*}" -g "${owner#*:}" -m 0755 "$d"
    done
    install -d -o "${owner%:*}" -g "${owner#*:}" -m 0755 "/v/published/presentation/$1"
    printf "<recording><id>%s</id></recording>\n" "$2" >"/v/published/presentation/$1/metadata.xml"
    chown "$owner" "/v/published/presentation/$1/metadata.xml"
    chmod 0644 "/v/published/presentation/$1/metadata.xml"'; then
    step recording-file OK "published/presentation/$RECORD_ID/metadata.xml written to bbb-data"
else
    step recording-file FAIL "could not write to the volume $volume"
fi
url="$base/presentation/$RECORD_ID/metadata.xml"
status "$url"
got="$(body "$url")"
if [ "${code:-}" = 200 ] && [[ "$got" == *"$MARKER"* ]]; then
    step recording OK "/presentation/$RECORD_ID/metadata.xml: HTTP 200 ${type:-}, the file's content"
else
    step recording FAIL "/presentation/$RECORD_ID/metadata.xml: HTTP ${code:-none} ${type:-}"
fi
bad=""
for path in "/presentation/$RECORD_ID/missing.xml" "/presentation/no-such-recording/metadata.xml" \
    "/presentation/$RECORD_ID/..%2F..%2F..%2Fpublished/presentation/$RECORD_ID/metadata.xml"; do
    status "$base$path"
    case "${code:-}" in 404 | 400) ;; *) bad+=" $path=${code:-none}" ;; esac
done
if [ -z "$bad" ]; then
    step recording-404 OK "3 other paths below /presentation: 404/400"
else
    step recording-404 FAIL "expected 404/400:$bad"
fi

# shellcheck disable=SC2016 # expanded by the shell in the container
if writer 'rm -rf -- "/v/published/presentation/$1"'; then
    step cleanup OK "published/presentation/$RECORD_ID removed"
else
    step cleanup FAIL "could not remove published/presentation/$RECORD_ID"
fi

if [ "$failed" -eq 0 ]; then echo "PLAYBACK-CHECK PASS"; else echo "PLAYBACK-CHECK FAIL"; exit 1; fi
