#!/usr/bin/env bash
# API smoke test for a running BigBlueButton stack.
#
# Usage: BBB_SHARED_SECRET=... docker/tests/smoke/api-smoke.sh --api-url URL [--insecure] [--timeout SECONDS]
#   --api-url URL      base of the API, e.g. https://bbb.example.com/bigbluebutton/api
#   --insecure         do not verify the server certificate (self-signed test stacks)
#   --timeout SECONDS  per-request timeout and how long to wait for the meeting to stop
#                      running after end (default 30)
#
# Steps, in order: create (random meetingID) -> join (redirect=false, expects a <url>) ->
# getMeetings (lists the meetingID) -> end -> isMeetingRunning (expects false, retried until
# --timeout). Prints `STEP <name>: OK` or `STEP <name>: FAIL <reason>` per step, then
# `SMOKE PASS` or `SMOKE FAIL`, and stops at the first failing step.
# Exit 0 on PASS, 1 on FAIL, 2 on usage or environment errors.
#
# Secret handling: the secret is read from BBB_SHARED_SECRET only, copied into an unexported
# shell variable and removed from the environment, so no child process inherits it. Checksums
# are computed by piping the data from the printf builtin into sha1sum, so the secret is never
# an argument of any process. Nothing prints it; the request URLs carry only the checksum.
#
# XML handling is plain bash string matching, enough for the flat responses of bbb-web: it finds
# <tag>value</tag> (first occurrence, or every occurrence for <meetingID>), strips a CDATA
# wrapper and decodes the five predefined entities. It does not handle attributes on the tags
# it reads, namespaces, comments, numeric character references or nested elements of the same
# name. Values the script compares (returncode, running, its own meetingID) are plain ASCII.
#
# Dependencies: bash, curl, coreutils (sha1sum, od, tr, mktemp, cat, rm, sleep).

set -euo pipefail

usage() {
    cat <<'EOF'
Usage: BBB_SHARED_SECRET=... api-smoke.sh --api-url URL [--insecure] [--timeout SECONDS]
  --api-url URL      base of the API, e.g. https://bbb.example.com/bigbluebutton/api
  --insecure         do not verify the server certificate (self-signed test stacks)
  --timeout SECONDS  per-request timeout and how long to wait for the meeting to stop
                     running after end (default 30)
EOF
}
usage_error() {
    echo "api-smoke.sh: $1" >&2
    usage >&2
    exit 2
}

API_URL=""
INSECURE=0
TIMEOUT=30
while [ $# -gt 0 ]; do
    case "$1" in
        --api-url)
            [ $# -ge 2 ] || usage_error "--api-url needs a value"
            API_URL="$2"; shift 2 ;;
        --api-url=*) API_URL="${1#*=}"; shift ;;
        --insecure) INSECURE=1; shift ;;
        --timeout)
            [ $# -ge 2 ] || usage_error "--timeout needs a value"
            TIMEOUT="$2"; shift 2 ;;
        --timeout=*) TIMEOUT="${1#*=}"; shift ;;
        -h | --help) usage; exit 0 ;;
        *) usage_error "unknown argument: $1" ;;
    esac
done

[ -n "${BBB_SHARED_SECRET:-}" ] || usage_error "BBB_SHARED_SECRET is not set"
[ -n "$API_URL" ] || usage_error "--api-url is required"
case "$API_URL" in
    http://* | https://*) ;;
    *) usage_error "--api-url must start with http:// or https://" ;;
esac
[[ "$TIMEOUT" =~ ^[1-9][0-9]*$ ]] || usage_error "--timeout must be a positive integer"
for tool in curl sha1sum od tr mktemp sleep; do
    command -v "$tool" >/dev/null 2>&1 || { echo "api-smoke.sh: $tool not found" >&2; exit 2; }
done

SECRET="$BBB_SHARED_SECRET"
unset BBB_SHARED_SECRET
while [ "${API_URL%/}" != "$API_URL" ]; do API_URL="${API_URL%/}"; done

CURL_OPTS=(--silent --show-error --proto '=http,https' --max-time "$TIMEOUT"
    --connect-timeout "$((TIMEOUT < 10 ? TIMEOUT : 10))")
if [ "$INSECURE" -eq 1 ]; then CURL_OPTS+=(--insecure); fi

WORK="$(mktemp -d)"
MEETING_ID="smoke-$(od -An -N8 -tx1 /dev/urandom | tr -d ' \n')"
CREATED=0
ENDED=0

# Percent-encode one parameter value (RFC 3986 unreserved characters stay as they are).
urlencode() {
    local LC_ALL=C s="$1" out="" c hex i
    for ((i = 0; i < ${#s}; i++)); do
        c="${s:i:1}"
        case "$c" in
            [A-Za-z0-9._~-]) out+="$c" ;;
            *) printf -v hex '%%%02X' "'$c"; out+="$hex" ;;
        esac
    done
    printf '%s' "$out"
}

# sha1(call + query + secret), as bbb-web verifies it. The data reaches sha1sum on stdin.
checksum() {
    local sum
    sum="$(printf '%s%s%s' "$1" "$2" "$SECRET" | sha1sum)"
    printf '%s' "${sum%% *}"
}

# GET <api-url>/<call>?<query>&checksum=... into BODY. On transport or HTTP errors sets
# REASON and returns 1.
api_get() {
    local call="$1" query="$2" url code rc=0
    url="$API_URL/$call?${query:+$query&}checksum=$(checksum "$call" "$query")"
    code="$(curl "${CURL_OPTS[@]}" --output "$WORK/body" --write-out '%{http_code}' \
        -- "$url" 2>"$WORK/err")" || rc=$?
    BODY="$(cat "$WORK/body" 2>/dev/null || true)"
    rm -f "$WORK/body"
    if [ "$rc" -ne 0 ]; then
        REASON="request failed: $(tr '\n' ' ' <"$WORK/err")(curl exit $rc)"
        return 1
    fi
    if [ "$code" != 200 ]; then
        REASON="HTTP $code"
        return 1
    fi
}

# Value of the first <tag>...</tag> in BODY into VALUE; returns 1 if there is none.
xml_value() {
    local tag="$1" rest
    rest="${BODY#*<"$tag">}"
    [ "$rest" != "$BODY" ] || return 1
    [[ "$rest" == *"</$tag>"* ]] || return 1
    VALUE="$(xml_text "${rest%%</"$tag">*}")"
}

xml_text() {
    local v="$1"
    v="${v#"${v%%[![:space:]]*}"}"
    v="${v%"${v##*[![:space:]]}"}"
    if [[ "$v" == '<![CDATA['*']]>' ]]; then
        v="${v#'<![CDATA['}"
        v="${v%']]>'}"
    else
        v="${v//&lt;/<}"; v="${v//&gt;/>}"; v="${v//&quot;/\"}"; v="${v//&apos;/\'}"
        v="${v//&amp;/&}"
    fi
    printf '%s' "$v"
}

# Requires <returncode>SUCCESS</returncode>; otherwise sets REASON from messageKey/message.
expect_success() {
    local code key="" msg=""
    if ! xml_value returncode; then
        REASON="no <returncode> in response"
        return 1
    fi
    code="$VALUE"
    [ "$code" = SUCCESS ] && return 0
    xml_value messageKey && key="$VALUE"
    xml_value message && msg="$VALUE"
    REASON="returncode $code${key:+, messageKey $key}${msg:+: $msg}"
    return 1
}

step_ok() { echo "STEP $1: OK"; }
step_fail() {
    echo "STEP $1: FAIL $2"
    echo "SMOKE FAIL"
    exit 1
}

# Best effort: do not leave a meeting behind when a step after create failed.
cleanup() {
    if [ "$CREATED" -eq 1 ] && [ "$ENDED" -eq 0 ]; then
        api_get end "meetingID=$(urlencode "$MEETING_ID")" >/dev/null 2>&1 || true
    fi
    rm -rf "$WORK"
}
trap cleanup EXIT

MID_PARAM="meetingID=$(urlencode "$MEETING_ID")"

# create: the API accepts the checksum and creates a meeting with our ID.
api_get create "$MID_PARAM&name=$(urlencode "API smoke test")" || step_fail create "$REASON"
expect_success || step_fail create "$REASON"
CREATED=1
xml_value meetingID || step_fail create "no <meetingID> in response"
[ "$VALUE" = "$MEETING_ID" ] || step_fail create "response has meetingID '$VALUE', expected '$MEETING_ID'"
step_ok create

# join: a moderator join URL is issued for the meeting (the URL is not opened).
api_get join "fullName=$(urlencode "Smoke Test")&$MID_PARAM&role=MODERATOR&redirect=false" \
    || step_fail join "$REASON"
expect_success || step_fail join "$REASON"
xml_value url || step_fail join "no <url> in response"
case "$VALUE" in
    http://?* | https://?*) ;;
    *) step_fail join "<url> is not an http(s) URL" ;;
esac
step_ok join

# getMeetings: the meeting is listed.
api_get getMeetings "" || step_fail getMeetings "$REASON"
expect_success || step_fail getMeetings "$REASON"
listed=0
rest="$BODY"
while [[ "$rest" == *"<meetingID>"*"</meetingID>"* ]]; do
    rest="${rest#*<meetingID>}"
    [ "$(xml_text "${rest%%</meetingID>*}")" = "$MEETING_ID" ] && { listed=1; break; }
done
[ "$listed" -eq 1 ] || step_fail getMeetings "meeting $MEETING_ID not listed"
step_ok getMeetings

# end: the end request is accepted.
api_get end "$MID_PARAM" || step_fail end "$REASON"
expect_success || step_fail end "$REASON"
ENDED=1
step_ok end

# isMeetingRunning: reports false within --timeout seconds.
deadline=$((SECONDS + TIMEOUT))
while :; do
    if api_get isMeetingRunning "$MID_PARAM" && expect_success; then
        if xml_value running; then
            [ "$VALUE" = false ] && break
            REASON="meeting still running after ${TIMEOUT}s"
        else
            REASON="no <running> in response"
        fi
    fi
    [ "$SECONDS" -lt "$deadline" ] || step_fail isMeetingRunning "$REASON"
    sleep 1
done
step_ok isMeetingRunning

echo "SMOKE PASS"
