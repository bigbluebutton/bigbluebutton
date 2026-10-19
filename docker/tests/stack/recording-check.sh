#!/usr/bin/env bash
# Recording check for a running stack with the `recording` feature: a recorded meeting goes
# through the recording services as on bare metal, without media (no webcam, screen share or
# audio). It records a meeting with the join path's client (create with record=true and
# autoStartRecording=true, a moderator joins, the shared notes and two presentations are used,
# end), then follows the meeting through the steps of the workers (archive, sanity, process and
# publish of the presentation format) by the status files in the data volume, checks the archive
# (events.xml, and the shared notes fetched: no notes/export_failed marker, which archive.rb
# leaves when the notes server cannot be reached and then archives on without them) and the
# published metadata.xml, and asks the API for the published recording (getRecordings).
#
# Not covered: media (no webcam, screen share or audio, so recorder-raw stays empty and nothing
# is remuxed from it), other formats than presentation, the player and the recording's files
# served by nginx (playback-check.sh), captions (recording-caption-inbox), the daily cleanup,
# the Tier 3 files, the post-publish and analytics callbacks.
#
# Usage: BBB_SHARED_SECRET=... docker/tests/stack/recording-check.sh [OPTION...]
#   --domain NAME        BBB_DOMAIN of the stack (default bbb.example.com)
#   --connect-ip IP      connect to IP for NAME instead of resolving it (default 127.0.0.1;
#                        empty: use DNS)
#   --insecure           do not verify the server certificate (self-signed stacks)
#   --docker CMD         docker CLI to use (default `docker`)
#   --compose CMD        docker compose command of the stack (default `docker compose`, run in
#                        the directory of docker-compose.yml)
#   --client-image IMG   image with Node 24 for the client (default
#                        localhost/bbb-graphql-actions:4.0.1)
#   --wait SECONDS       how long the recording may take to be published (default 300)
#
# Prints `STEP <name>: OK|FAIL ...`, then `RECORDING PASS` or `RECORDING FAIL`. Exit 0 PASS,
# 1 FAIL, 2 usage error. The shared secret goes to the client on stdin, as in join-path.sh.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() { sed -n '2,/^$/{s/^# \{0,1\}//;p}' "$0" >&2; exit 2; }

domain=bbb.example.com
connect_ip=127.0.0.1
insecure=0
docker_cmd=docker
compose_cmd="docker compose"
client_image=localhost/bbb-graphql-actions:4.0.1
wait_s=300
while [ $# -gt 0 ]; do
    case "$1" in
        --domain) [ $# -ge 2 ] || usage; domain="$2"; shift 2 ;;
        --connect-ip) [ $# -ge 2 ] || usage; connect_ip="$2"; shift 2 ;;
        --insecure) insecure=1; shift ;;
        --docker) [ $# -ge 2 ] || usage; docker_cmd="$2"; shift 2 ;;
        --compose) [ $# -ge 2 ] || usage; compose_cmd="$2"; shift 2 ;;
        --client-image) [ $# -ge 2 ] || usage; client_image="$2"; shift 2 ;;
        --wait) [ $# -ge 2 ] || usage; wait_s="$2"; shift 2 ;;
        -h | --help) usage ;;
        *) echo "unknown option: $1" >&2; usage ;;
    esac
done
[[ "$wait_s" =~ ^[0-9]+$ ]] || usage
secret="${BBB_SHARED_SECRET:-}"
[ -n "$secret" ] || { echo "BBB_SHARED_SECRET is not set" >&2; exit 2; }
read -r -a DOCKER <<<"$docker_cmd"
read -r -a COMPOSE <<<"$compose_cmd"

failed=0
ok() { echo "STEP $1: OK${2:+ $2}"; }
fail() { echo "STEP $1: FAIL${2:+ $2}"; failed=1; }
finish() {
    if [ "$failed" -eq 0 ]; then echo "RECORDING PASS"; exit 0; fi
    echo "RECORDING FAIL"
    exit 1
}

# node_client SCRIPT ARG...: run a Node module in the client image on the Engine's host network.
node_client() {
    local script="$1" args=(run --rm -i --network host)
    shift
    [ -z "$connect_ip" ] || args+=(--add-host "$domain:$connect_ip")
    [ "$insecure" -eq 0 ] || args+=(-e NODE_TLS_REJECT_UNAUTHORIZED=0 -e NODE_NO_WARNINGS=1)
    args+=(-e 'JOIN_PATH_CREATE_PARAMS={"record":"true","autoStartRecording":"true"}')
    args+=(--entrypoint node "$client_image" --input-type=module -e "$script" -- "$@")
    printf '%s\n' "$secret" | "${DOCKER[@]}" "${args[@]}"
}

# 1. A recorded meeting: the join path's client steps, then end (the client ends the meeting).
out="$(node_client "$(cat "$HERE/join-path-client.mjs")" "https://$domain" 30 2>&1)" || true
printf '%s\n' "$out" | sed 's/^/  /'
record_id="$(printf '%s\n' "$out" | sed -n 's/^STEP meetingStaticData: OK .* meetingId=\([0-9a-f]\{40\}-[0-9]\{13\}\) .*/\1/p')"
if printf '%s\n' "$out" | grep -q '^STEP .*: FAIL' || [ -z "$record_id" ]; then
    fail recorded-meeting "the join path's client failed or printed no internal meeting id"
    finish
fi
ok recorded-meeting "record id $record_id"

# 2. The steps of the workers, by their status files (record-and-playback/core/lib/
# recordandplayback/workers): archived/<id>.done (.norecord: no recording marks), sanity/<id>.done,
# processed/<id>-presentation.done, published/<id>-presentation.done; a .fail stops.
status_files() {
    "${COMPOSE[@]}" exec -T recording sh -c 'cd /var/bigbluebutton/recording/status && ls -1 */ 2>/dev/null' \
        | awk -v id="$record_id" '/\/:$/ { dir = substr($0, 1, length($0) - 2); next } index($0, id) == 1 { print dir "/" $0 }'
}
start=$SECONDS
reported=" "
while :; do
    files="$(status_files || true)"
    for step in archived/"$record_id".done sanity/"$record_id".done \
        processed/"$record_id"-presentation.done published/"$record_id"-presentation.done; do
        if printf '%s\n' "$files" | grep -qxF "$step" && [[ "$reported" != *" $step "* ]]; then
            ok "${step%%/*}" "$step after $((SECONDS - start))s"
            reported+="$step "
        fi
    done
    if bad="$(printf '%s\n' "$files" | grep -E '\.(fail|norecord)$')"; then
        fail "${bad%%/*}" "$(printf '%s' "$bad" | tr '\n' ' ')(see: ${compose_cmd} logs recording)"
        finish
    fi
    [[ "$reported" == *" published/$record_id-presentation.done "* ]] && break
    if [ $((SECONDS - start)) -ge "$wait_s" ]; then
        fail published "not published after ${wait_s}s; status files: $(printf '%s' "$files" | tr '\n' ' ')"
        finish
    fi
    sleep 5
done

# 3. What the archive and publish steps wrote. archive.rb archives on without the shared notes when
# the notes server fails and only leaves notes/export_failed behind.
# shellcheck disable=SC2016 # expanded by the shell in the container
archive_check="$("${COMPOSE[@]}" exec -T recording sh -c '
    raw=/var/bigbluebutton/recording/raw/$1; out=""
    [ -s "$raw/events.xml" ] || out="$out no $raw/events.xml;"
    [ -d "$raw/notes" ] || out="$out no $raw/notes;"
    [ ! -e "$raw/notes/export_failed" ] || out="$out $raw/notes/export_failed (the shared notes were not fetched);"
    [ -s "/var/bigbluebutton/published/presentation/$1/metadata.xml" ] || out="$out no published/presentation/$1/metadata.xml;"
    echo "${out:-ok}"' sh "$record_id" 2>&1)" || archive_check="compose exec failed: $archive_check"
if [ "$archive_check" = ok ]; then
    ok archive-content "events.xml, notes fetched, metadata.xml published"
else
    fail archive-content "$archive_check"
fi

# 4. The API lists it as published, with the presentation format's playback URL.
# shellcheck disable=SC2016 # JavaScript, not shell expansions
api='
import { createHash } from "node:crypto";
const [base, recordID] = process.argv.slice(1);
let input = ""; for await (const c of process.stdin) input += c;
const secret = input.split("\n")[0].trim();
const query = new URLSearchParams({ recordID }).toString();
const checksum = createHash("sha1").update("getRecordings" + query + secret).digest("hex");
const res = await fetch(`${base}/bigbluebutton/api/getRecordings?${query}&checksum=${checksum}`);
const xml = await res.text();
const tag = (t) => (xml.match(new RegExp(`<${t}>([^<]*)</${t}>`)) || [])[1];
console.log(`${res.status} ${tag("returncode")} ${tag("recordID")} ${tag("state")} ${tag("type")} ${tag("url")}`);
'
read -r http rc rid state type url < <(node_client "$api" "https://$domain" "$record_id" 2>&1) || true
if [ "$http" = 200 ] && [ "$rc" = SUCCESS ] && [ "$rid" = "$record_id" ] && [ "$state" = published ] \
    && [ "$type" = presentation ] && [ "$url" = "https://$domain/playback/presentation/2.3/$record_id" ]; then
    ok getRecordings "state=$state type=$type url=$url"
else
    fail getRecordings "HTTP ${http:-?} returncode=${rc:-?} recordID=${rid:-?} state=${state:-?} type=${type:-?} url=${url:-?}"
fi
finish
