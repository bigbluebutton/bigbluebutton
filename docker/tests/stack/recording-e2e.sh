#!/usr/bin/env bash
# Recording end-to-end test with media, for a running stack with the `recording` feature: a
# moderator joins a recorded meeting (create with record=true and autoStartRecording=true) in
# headless Chromium with fake microphone and webcam, driven by upstream's Playwright helpers
# (bigbluebutton-tests/playwright: Page.init, joinMicrophone, shareWebcam) in the official
# Playwright image, on the stack's network; the meeting is ended after --media-seconds. Then the
# recording goes through archive, sanity, process and publish of the presentation format (status
# files in the data volume), the archive must hold the recorder's webcam and audio files, the
# published webcams video must have a video and an audio stream (ffprobe in the recording
# image), getRecordings must list the recording as published, and nginx must serve its player
# page, metadata.xml and the webcams video (HTTP 200, not empty).
#
# The browser reaches the stack as a client on the stack's network: BBB_DOMAIN resolves to
# haproxy (its network alias), the media goes to LiveKit's internal candidate. The Node side
# (API calls, the HTTP checks) trusts the test CA of dind.sh (volume --pki-volume, ca.pem);
# Chromium runs with upstream's flags, which include --ignore-certificate-errors.
#
# Not covered: screen sharing, other formats than presentation, captions, the cleanup, the
# callbacks; the browser is on the stack's network, so the public address path of the media
# (BBB_PUBLIC_IPV4, TURN) is not used.
#
# Usage: BBB_SHARED_SECRET=... docker/tests/stack/recording-e2e.sh --src DIR [OPTION...]
#   --src DIR            the repository as the Docker Engine sees it (bind-mounted read-only)
#   --domain NAME        BBB_DOMAIN of the stack (default bbb.example.com)
#   --docker CMD         docker CLI to use (default `docker`)
#   --compose CMD        docker compose command of the stack (default `docker compose`, run in
#                        the directory of docker-compose.yml)
#   --network NAME       the stack's network `bbb` (default bigbluebutton_bbb)
#   --pki-volume NAME    volume with the test CA's certificate ca.pem (default bbb-test-pki)
#   --media-seconds N    how long the moderator stays with microphone and webcam (default 20)
#   --wait SECONDS       how long the recording may take to be published (default 600)
#   --artifacts DIR      on a failed Playwright test, copy its screenshots and traces
#                        (test-results) into DIR on this host (created)
#
# Prints `STEP <name>: OK|FAIL ...`, then `RECORDING-E2E PASS` or `RECORDING-E2E FAIL`. Exit 0
# PASS, 1 FAIL, 2 usage error. The shared secret goes to the containers on stdin.

set -euo pipefail

# Playwright 1.56.0 (multi-arch index), the version of bigbluebutton-tests/playwright/
# package-lock.json, with its browsers.
PLAYWRIGHT_IMAGE="mcr.microsoft.com/playwright:v1.56.0-noble@sha256:35246d87a7c88ea9b771c65d33171b2611b02a8253b4b12ce6f94376c55f99f2"
# Engine-local cache of npm downloads (package-lock.json pins the packages).
NPM_CACHE_VOLUME=bbb-test-playwright-npm

usage() { sed -n '2,/^$/{s/^# \{0,1\}//;p}' "$0" >&2; exit 2; }

src=""
domain=bbb.example.com
docker_cmd=docker
compose_cmd="docker compose"
network=bigbluebutton_bbb
pki_volume=bbb-test-pki
media_s=20
wait_s=600
artifacts=""
while [ $# -gt 0 ]; do
    case "$1" in
        --src) [ $# -ge 2 ] || usage; src="$2"; shift 2 ;;
        --domain) [ $# -ge 2 ] || usage; domain="$2"; shift 2 ;;
        --docker) [ $# -ge 2 ] || usage; docker_cmd="$2"; shift 2 ;;
        --compose) [ $# -ge 2 ] || usage; compose_cmd="$2"; shift 2 ;;
        --network) [ $# -ge 2 ] || usage; network="$2"; shift 2 ;;
        --pki-volume) [ $# -ge 2 ] || usage; pki_volume="$2"; shift 2 ;;
        --media-seconds) [ $# -ge 2 ] || usage; media_s="$2"; shift 2 ;;
        --wait) [ $# -ge 2 ] || usage; wait_s="$2"; shift 2 ;;
        --artifacts) [ $# -ge 2 ] || usage; artifacts="$2"; shift 2 ;;
        -h | --help) usage ;;
        *) echo "unknown option: $1" >&2; usage ;;
    esac
done
[ -n "$src" ] || usage
[[ "$media_s" =~ ^[0-9]+$ && "$wait_s" =~ ^[0-9]+$ ]] || usage
secret="${BBB_SHARED_SECRET:-}"
[ -n "$secret" ] || { echo "BBB_SHARED_SECRET is not set" >&2; exit 2; }
read -r -a DOCKER <<<"$docker_cmd"
read -r -a COMPOSE <<<"$compose_cmd"

failed=0
t0=$SECONDS
ok() { echo "STEP $1: OK${2:+ $2}"; }
fail() { echo "STEP $1: FAIL${2:+ $2}"; failed=1; }
finish() {
    if [ "$failed" -eq 0 ]; then echo "RECORDING-E2E PASS ($((SECONDS - t0))s)"; exit 0; fi
    echo "RECORDING-E2E FAIL ($((SECONDS - t0))s)"
    exit 1
}

# playwright_run ARG...: a container of the Playwright image on the stack's network, trusting
# the test CA in Node, with the URL of the API in its environment; the shared secret is the
# first line on its stdin (as in join-path.sh), never on a command line.
playwright_run() {
    printf '%s\n' "$secret" | "${DOCKER[@]}" run -i --network "$network" \
        -v "$pki_volume:/pki:ro" -e NODE_EXTRA_CA_CERTS=/pki/ca.pem \
        -e "BBB_URL=https://$domain/bigbluebutton" "$@"
}

# The test's container is kept until its results are copied out (removed on exit).
test_container="bbb-recording-e2e-$$"
trap '"${DOCKER[@]}" rm -f "$test_container" >/dev/null 2>&1 || true' EXIT

# 1. The recorded meeting with media. The upstream test tree is copied into the container (the
# repository stays read-only) and its locked dependencies installed (runtime ones only).
# shellcheck disable=SC2016 # expanded by the shell in the container
pw_rc=0
out="$(playwright_run --name "$test_container" -v "$src/bigbluebutton-tests/playwright:/upstream:ro" \
    -v "$src/docker/tests/stack/recording-e2e:/e2e:ro" -v "$NPM_CACHE_VOLUME:/root/.npm" \
    -e "RECORDING_E2E_MEDIA_SECONDS=$media_s" -e TIMEOUT_MULTIPLIER=2 \
    "$PLAYWRIGHT_IMAGE" bash -ec '
        IFS= read -r BBB_SECRET; export BBB_SECRET
        mkdir /work
        tar -C /upstream --exclude=./node_modules --exclude=./logs -cf - . | tar -C /work -xf -
        cp -r /e2e /work/docker-recording-e2e
        cd /work
        npm ci --omit=dev --no-audit --no-fund --loglevel=error >/dev/null
        exec npx playwright test -c docker-recording-e2e/playwright.config.ts
    ' 2>&1)" || pw_rc=$?
printf '%s\n' "$out" | sed 's/^/  /'
record_id="$(printf '%s\n' "$out" | sed -n 's/^RECORD-ID \([0-9a-f]\{40\}-[0-9]\{13\}\)$/\1/p' | head -n 1)"
if [ "$pw_rc" -ne 0 ] || [ -z "$record_id" ] || ! printf '%s\n' "$out" | grep -q '^ENDED after '; then
    fail recorded-meeting "the Playwright test failed (exit $pw_rc)${record_id:+, record id $record_id}"
    if [ -n "$artifacts" ]; then
        mkdir -p "$artifacts"
        # docker cp CONTAINER:PATH - writes a tar stream, also through `podman exec` (dind.sh)
        if "${DOCKER[@]}" cp "$test_container:/work/docker-recording-e2e/test-results" - 2>/dev/null \
            | tar -C "$artifacts" -xf - 2>/dev/null; then
            echo "  Playwright results copied to $artifacts/test-results"
        else
            echo "  no Playwright results to copy"
        fi
    fi
    finish
fi
ok recorded-meeting "record id $record_id, microphone and webcam for ${media_s}s, $((SECONDS - t0))s"

# 2. The steps of the workers, by their status files (record-and-playback/core/lib/
# recordandplayback/workers); a .fail or .norecord stops.
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

# 3. The media: the recorder's files archived (archive.rb moves video/<id>/ and audio/ from
# recorder-raw into the raw archive), a VP8 camera file and an Opus microphone file, each with
# media for at least half of --media-seconds; and the published webcams video with a video and
# an audio stream whose audio is not silent (processing also writes that file, padded to the
# meeting's length and with a silent track, for a meeting without media).
#
# PROBE_SH FILE: prints "codec|seconds" of the first stream of FILE. The seconds are the span of
# the packets read (last minus first timestamp), not the container's duration: archive.rb remuxes
# the files with ffmpeg (-c copy), which writes the duration into the header, so a file cut short
# after the header still states the full duration.
# shellcheck disable=SC2016 # expanded by the shell in the container
PROBE_SH='
    f=$1
    codec=$(ffprobe -v error -select_streams 0 -show_entries stream=codec_name -of csv=p=0 "$f" 2>/dev/null | head -n 1)
    span=$(ffprobe -v error -select_streams 0 -show_entries packet=pts_time -of csv=p=0 "$f" 2>/dev/null |
        awk -F, '"'"'$1 != "" && $1 != "N/A" { if (n++ == 0) first = $1; last = $1 } END { if (n) printf "%.1f", last - first; else print 0 }'"'"')
    echo "${codec:-none}|${span:-0}"'
# raw_media_ok CODEC MIN_SECONDS PROBE_OUTPUT: true if the probe found CODEC with at least
# MIN_SECONDS of packets.
raw_media_ok() {
    local codec span
    IFS='|' read -r codec span <<<"$3"
    [ "$codec" = "$1" ] && [[ "$span" =~ ^[0-9]+(\.[0-9]+)?$ ]] && awk -v s="$span" -v m="$2" 'BEGIN { exit !(s >= m) }'
}
min_media_s=$((media_s / 2))
# shellcheck disable=SC2016 # expanded by the shell in the container
media="$("${COMPOSE[@]}" exec -T recording bash -c '
    probe_sh=$2
    probe() { bash -c "$probe_sh" sh "$1"; }
    raw=/var/bigbluebutton/recording/raw/$1; pub=/var/bigbluebutton/published/presentation/$1
    cam=$(find "$raw/video/$1" -type f -size +0 2>/dev/null | head -n 1)
    mic=$(find "$raw/audio" -type f -size +0 2>/dev/null | head -n 1)
    webcams=$pub/video/webcams.webm
    types=$(ffprobe -v error -show_entries stream=codec_type -of csv=p=0 "$webcams" 2>/dev/null | sort -u | paste -sd, -)
    max=$(ffmpeg -nostats -i "$webcams" -vn -af volumedetect -f null - 2>&1 | sed -n "s/.*max_volume: \(-*[0-9.]*\) dB.*/\1/p")
    echo "$(if [ -n "$cam" ]; then probe "$cam"; else echo "none|0"; fi)|$(
        if [ -n "$mic" ]; then probe "$mic"; else echo "none|0"; fi)|${types:-none}|${max:-none}"
    ' sh "$record_id" "$PROBE_SH" 2>&1)" || media="compose exec failed: $media"
IFS="|" read -r cam_codec cam_s mic_codec mic_s streams max_volume <<<"$media" || true
if raw_media_ok vp8 "$min_media_s" "${cam_codec:-}|${cam_s:-}" && raw_media_ok opus "$min_media_s" "${mic_codec:-}|${mic_s:-}"; then
    ok archived-media "raw/$record_id: camera vp8 ${cam_s}s, microphone opus ${mic_s}s (at least ${min_media_s}s each)"
else
    fail archived-media "raw/$record_id: camera ${cam_codec:-?} ${cam_s:-?}s, microphone ${mic_codec:-?} ${mic_s:-?}s; want vp8 and opus, at least ${min_media_s}s each"
fi
if [ "${streams:-}" = audio,video ] && [[ "${max_volume:-}" =~ ^-?[0-9]+(\.[0-9]+)?$ ]] \
    && awk -v m="$max_volume" 'BEGIN { exit !(m > -50) }'; then
    ok published-media "video/webcams.webm: streams $streams, audio max ${max_volume} dB"
else
    fail published-media "video/webcams.webm: streams ${streams:-?}, audio max ${max_volume:-?} dB (silent below -50 dB)"
fi

# 4. getRecordings lists it as published, and nginx serves its player and files.
# shellcheck disable=SC2016 # JavaScript, not shell expansions
check='
import { createHash } from "node:crypto";
const [base, recordID] = process.argv.slice(1);
let input = ""; for await (const c of process.stdin) input += c;
const secret = input.split("\n")[0].trim();
const query = new URLSearchParams({ recordID }).toString();
const checksum = createHash("sha1").update("getRecordings" + query + secret).digest("hex");
const res = await fetch(`${base}/bigbluebutton/api/getRecordings?${query}&checksum=${checksum}`);
const xml = await res.text();
const tag = (t) => (xml.match(new RegExp(`<${t}>([^<]*)</${t}>`)) || [])[1];
console.log(`getRecordings ${res.status} ${tag("returncode")} ${tag("recordID")} ${tag("state")} ${tag("type")} ${tag("url")}`);
for (const path of [`/playback/presentation/2.3/${recordID}`, `/presentation/${recordID}/metadata.xml`,
    `/presentation/${recordID}/video/webcams.webm`]) {
  const r = await fetch(base + path);
  const body = Buffer.from(await r.arrayBuffer());
  console.log(`fetch ${path} ${r.status} ${body.length} ${r.headers.get("content-type")}`);
}
'
out="$(playwright_run --entrypoint node "$PLAYWRIGHT_IMAGE" --input-type=module -e "$check" -- \
    "https://$domain" "$record_id" 2>&1)" || true
read -r _ http rc rid state type url < <(printf '%s\n' "$out" | grep '^getRecordings ') || true
if [ "${http:-}" = 200 ] && [ "${rc:-}" = SUCCESS ] && [ "${rid:-}" = "$record_id" ] && [ "${state:-}" = published ] \
    && [ "${type:-}" = presentation ] && [ "${url:-}" = "https://$domain/playback/presentation/2.3/$record_id" ]; then
    ok getRecordings "state=$state type=$type url=$url"
else
    fail getRecordings "HTTP ${http:-?} returncode=${rc:-?} recordID=${rid:-?} state=${state:-?} type=${type:-?} url=${url:-?}"
    printf '%s\n' "$out" | sed 's/^/  /'
fi
for path in "/playback/presentation/2.3/$record_id" "/presentation/$record_id/metadata.xml" \
    "/presentation/$record_id/video/webcams.webm"; do
    read -r _ _ code size ctype < <(printf '%s\n' "$out" | grep -F "fetch $path ") || true
    if [ "${code:-}" = 200 ] && [[ "${size:-0}" =~ ^[1-9][0-9]*$ ]]; then
        ok served "$path: HTTP 200, $size bytes, $ctype"
    else
        fail served "$path: HTTP ${code:-?}, ${size:-?} bytes"
    fi
done
finish
