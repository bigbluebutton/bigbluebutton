#!/usr/bin/env bash
# Check a compose file against the compose rules (docker/tests/compose/README.md), for every feature
# combination. Only `config` is run; nothing is started.
#
# Usage: assert-compose.sh [--compose FILE] [--features LIST|--all-feature-combinations]
#   --compose FILE              compose file (default: docker-compose.yml at the repository root)
#   --features LIST             check one comma-separated BBB_FEATURES value ("" = no feature)
#   --all-feature-combinations  check every subset of the profiles named in FILE (default)
#   COMPOSE_CMD                 compose CLI (default: `docker compose`), split on spaces
#
# Output: one line per finding, `VIOLATION <rule>: <service or network>: <detail>`, rule one of
#   config-invalid, image-tag, healthcheck, restart, published-port, depends-on, notes-network,
#   resource-limits, recorder-raw (see README.md). A summary goes to stderr.
# Exit: 0 no finding, 1 at least one finding, 2 usage error or missing tool.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FILE="$HERE/../../../docker-compose.yml"
FEATURES_GIVEN=0
FEATURES_ARG=""
MAX_FEATURES=10

usage() {
    sed -n '5,9p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//' >&2
    [ -n "${1:-}" ] && echo "error: $1" >&2
    exit 2
}

while [ $# -gt 0 ]; do
    case "$1" in
        --compose) [ $# -ge 2 ] || usage "--compose needs a value"; FILE="$2"; shift 2 ;;
        --features) [ $# -ge 2 ] || usage "--features needs a value"; FEATURES_GIVEN=1; FEATURES_ARG="$2"; shift 2 ;;
        --all-feature-combinations) FEATURES_GIVEN=0; shift ;;
        -h | --help) usage ;;
        *) usage "unknown argument: $1" ;;
    esac
done

[ -f "$FILE" ] || usage "compose file not found: $FILE"
read -r -a COMPOSE <<<"${COMPOSE_CMD:-docker compose}"
[ "${#COMPOSE[@]}" -gt 0 ] || usage "COMPOSE_CMD is empty"
command -v "${COMPOSE[0]}" >/dev/null 2>&1 || usage "compose CLI not found: ${COMPOSE[0]} (set COMPOSE_CMD)"
command -v yq >/dev/null 2>&1 || usage "yq (mikefarah/yq v4) not found"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# Normalise a comma-separated list: no spaces, no empty or duplicate elements.
normalise() {
    local item out=() seen=","
    local -a items
    IFS=',' read -r -a items <<<"${1// /}"
    for item in "${items[@]}"; do
        [ -n "$item" ] || continue
        [[ "$item" =~ ^[A-Za-z0-9][A-Za-z0-9_.-]*$ ]] || usage "invalid feature name: $item"
        case "$seen" in *",$item,"*) continue ;; esac
        seen+="$item,"
        out+=("$item")
    done
    local IFS=','
    printf '%s' "${out[*]}"
}

# Features = the profiles named in the file (as written, before interpolation).
mapfile -t FEATURES < <(yq '[(.services // {}) | .[] | (.profiles // []) | .[]] | unique | .[]' "$FILE")

COMBOS=()
if [ "$FEATURES_GIVEN" -eq 1 ]; then
    COMBOS=("$(normalise "$FEATURES_ARG")")
    IFS=',' read -r -a wanted <<<"${COMBOS[0]}"
    for f in "${wanted[@]}"; do
        case " ${FEATURES[*]} " in *" $f "*) ;; *) echo "note: no service has profile '$f'" >&2 ;; esac
    done
else
    n="${#FEATURES[@]}"
    [ "$n" -le "$MAX_FEATURES" ] || usage "$n profiles give 2^$n combinations; check selected ones with --features"
    for ((mask = 0; mask < (1 << n); mask++)); do
        combo=()
        for ((i = 0; i < n; i++)); do
            if (((mask >> i) & 1)); then combo+=("${FEATURES[i]}"); fi
        done
        COMBOS+=("$(IFS=','; printf '%s' "${combo[*]}")")
    done
fi

# One tab-separated fact line per service, port, dependency and network of a resolved config:
#   S name run-only image has-healthcheck healthcheck-disable healthcheck-test0 restart
#     network_mode networks cpus memory user
#   P name published target protocol
#   D name dependency condition
#   N name internal
#   V name target read-only user        (mounts of the volume recorder-raw)
# shellcheck disable=SC2016 # yq variables, not shell expansions
FACTS='
((.services // {}) | to_entries | .[] | .key as $n | .value as $s | [
    "S", $n,
    ((($s.labels // {})["org.bigbluebutton.run-only"] // "") | tostring),
    (($s.image // "") | tostring),
    ($s | has("healthcheck") | tostring),
    (($s.healthcheck.disable // false) | tostring),
    (((($s.healthcheck.test // [])[0]) // "") | tostring),
    (($s.restart // "") | tostring),
    (($s.network_mode // "") | tostring),
    (($s.networks // {}) | keys | join(",")),
    (($s.deploy.resources.limits.cpus // "") | tostring),
    (($s.deploy.resources.limits.memory // "") | tostring),
    (($s.user // "") | tostring)
  ] | @tsv),
((.services // {}) | to_entries | .[] | .key as $n | .value as $s | (($s.volumes // []) | .[])
    | select(.type == "volume" and .source == "recorder-raw") | [
    "V", $n, ((.target // "") | tostring), ((.read_only // false) | tostring), (($s.user // "") | tostring)
  ] | @tsv),
((.services // {}) | to_entries | .[] | .key as $n | ((.value.ports // []) | .[]) | [
    "P", $n, ((.published // "") | tostring), ((.target // "") | tostring), ((.protocol // "tcp") | tostring)
  ] | @tsv),
((.services // {}) | to_entries | .[] | .key as $n | ((.value.depends_on // {}) | to_entries | .[]) | [
    "D", $n, .key, ((.value.condition // "") | tostring)
  ] | @tsv),
((.networks // {}) | to_entries | .[] | [
    "N", .key, ((.value.internal // false) | tostring)
  ] | @tsv)
'

# Rules on the fact lines. Prints finding lines.
# shellcheck disable=SC2016 # awk program
RULES='
BEGIN {
    FS = "\t"
    # published ports: no ICE-TCP 7881, no UDP range, the TURN relay range internal only
    allow["nginx"] = " 80/tcp "
    allow["haproxy"] = " 443/tcp "
    allow["livekit"] = " 7882/udp "
    allow["coturn"] = " 3478/udp 3478/tcp "
    # notes network: shared-notes and only the services it talks to
    notes_member["nginx"] = 1; notes_member["recording"] = 1; notes_member["redis"] = 1
    notes_member["postgres"] = 1; notes_member["bbb-web"] = 1; notes_member["shared-notes"] = 1
}
function v(rule, subject, detail) { print "VIOLATION " rule ": " subject ": " detail }
function allowed_for(s,   a) { a = allow[s]; gsub(/^ +| +$/, "", a); gsub(/ +/, ", ", a); return a == "" ? "none" : a }
function addport(s, port, proto) {
    # Collapse consecutive ports (compose expands ranges) into "first-last/proto".
    if (s in bad && bad_proto[s] == proto && port == bad_last[s] + 1 && bad_last[s] != "") {
        bad_last[s] = port; return
    }
    flush(s)
    bad_first[s] = port; bad_last[s] = port; bad_proto[s] = proto; bad[s] = 1
}
function flush(s,   r) {
    if (!(s in bad) || bad_first[s] == "") return
    r = bad_first[s] (bad_last[s] != bad_first[s] ? "-" bad_last[s] : "") "/" bad_proto[s]
    badlist[s] = (badlist[s] == "" ? r : badlist[s] ", " r)
    bad_first[s] = ""; bad_last[s] = ""
}
$1 == "S" {
    s = $2; runonly = ($3 == "true")
    img = $4; tag = img; sub(/^.*\//, "", tag)
    if (img == "") v("image-tag", s, "no image")
    else if (img !~ /@sha256:[0-9a-f]+$/) {
        if (tag !~ /:/) v("image-tag", s, "image " img " has no explicit tag")
        else { sub(/^[^:]*:/, "", tag); if (tag == "" || tag == "latest") v("image-tag", s, "image " img " uses tag \"" tag "\"") }
    }
    if (!runonly) {
        if ($5 != "true") v("healthcheck", s, "no healthcheck")
        else if ($6 == "true" || $7 == "NONE") v("healthcheck", s, "healthcheck disabled")
        if ($8 != "unless-stopped") v("restart", s, ($8 == "" ? "no restart policy" : "restart is \"" $8 "\"") ", expected \"unless-stopped\"")
    }
    if ($9 == "host") v("published-port", s, "network_mode host publishes every port")
    if (s == "shared-notes") {
        if ($9 != "") v("notes-network", s, "network_mode " $9 ", expected only network notes")
        n = split($10, nets, ",")
        other = ""
        for (i = 1; i <= n; i++) if (nets[i] != "notes") other = (other == "" ? nets[i] : other ", " nets[i])
        if (other != "") v("notes-network", s, "attached to other network(s): " other)
        if ($9 == "" && $10 !~ /(^|,)notes(,|$)/) v("notes-network", s, "not attached to notes")
    } else {
        if ($10 ~ /(^|,)notes(,|$)/ && !(s in notes_member)) v("notes-network", s, "attached to notes, not an allowed member")
        if ($9 == "service:shared-notes") v("notes-network", s, "shares the network namespace of shared-notes")
    }
    if (s == "bbb-webrtc-recorder") { recorder_seen = 1; recorder_user = $13 }
    if (s == "recording") {
        miss = ""
        if ($11 == "" || $11 == "0") miss = "cpus"
        if ($12 == "" || $12 == "0") miss = (miss == "" ? "memory" : miss " and memory")
        if (miss != "") v("resource-limits", s, "no deploy.resources.limits " miss)
    }
}
$1 == "P" {
    s = $2; pp = $3 "/" $5
    if ($3 == "") { flush(s); badlist[s] = (badlist[s] == "" ? "" : badlist[s] ", ") $4 "/" $5 " on an ephemeral host port"; bad[s] = 1 }
    else if (index(allow[s], " " pp " ") == 0) addport(s, $3 + 0, $5)
    if (!(s in order)) { order[s] = ++norder; byorder[norder] = s }
}
$1 == "D" {
    if ($4 != "service_healthy" && $4 != "service_completed_successfully")
        v("depends-on", $2, "depends on " $3 " with condition " ($4 == "" ? "(none)" : $4) ", expected service_healthy or service_completed_successfully")
}
$1 == "V" {
    # recorder-raw: written by bbb-webrtc-recorder only, at the path the SFU and the recording
    # processing use; every service that mounts it runs as the user of the recorder.
    if ($3 != "/var/lib/bbb-webrtc-recorder") v("recorder-raw", $2, "mounts recorder-raw at " $3 ", expected /var/lib/bbb-webrtc-recorder")
    if ($2 == "bbb-webrtc-recorder") {
        if ($4 == "true") v("recorder-raw", $2, "mounts recorder-raw read-only")
        else recorder_rw = 1
    } else {
        if ($4 != "true") v("recorder-raw", $2, "mounts recorder-raw writable, only bbb-webrtc-recorder writes it")
        nmount++; mount_svc[nmount] = $2; mount_user[nmount] = $5
    }
}
$1 == "N" && $2 == "notes" {
    notes_seen = 1
    if ($3 != "true") v("notes-network", "notes", "network is not internal")
}
END {
    if (!notes_seen) v("notes-network", "notes", "network not defined")
    if (recorder_seen && !recorder_rw) v("recorder-raw", "bbb-webrtc-recorder", "does not mount recorder-raw writable at /var/lib/bbb-webrtc-recorder")
    if (recorder_seen) for (i = 1; i <= nmount; i++) if (mount_user[i] != recorder_user)
        v("recorder-raw", mount_svc[i], "runs as user \"" mount_user[i] "\", bbb-webrtc-recorder as \"" recorder_user "\"")
    for (i = 1; i <= norder; i++) {
        s = byorder[i]; flush(s)
        if (badlist[s] != "") v("published-port", s, "publishes " badlist[s] ", not in the allowlist (allowed for " s ": " allowed_for(s) ")")
    }
}
'

: >"$WORK/findings"
invalid_keys=()
declare -A invalid_combos=()
for combo in "${COMBOS[@]}"; do
    if COMPOSE_PROFILES="$combo" BBB_FEATURES="$combo" \
        "${COMPOSE[@]}" -f "$FILE" config --format json >"$WORK/config.json" 2>"$WORK/err"; then
        yq -p json -o yaml "$FACTS" "$WORK/config.json" >"$WORK/facts"
        awk "$RULES" "$WORK/facts" >>"$WORK/findings"
    else
        msg="$(grep -v '^[[:space:]]*$' "$WORK/err" | grep -vi 'level=warn\|^WARN' | head -n 1 || true)"
        [ -n "$msg" ] || msg="$(head -n 1 "$WORK/err")"
        msg="${msg%: invalid compose project}"
        subject="compose"
        if [[ "$msg" =~ service\ \"([^\"]+)\" ]]; then subject="${BASH_REMATCH[1]}"
        elif [[ "$msg" =~ services\.([A-Za-z0-9_.-]+) ]]; then subject="${BASH_REMATCH[1]%%.*}"
        fi
        key="$subject"$'\t'"$msg"
        if [ -z "${invalid_combos[$key]+x}" ]; then invalid_keys+=("$key"); invalid_combos[$key]=""; fi
        invalid_combos[$key]+=";$combo" # leading ';' keeps an empty combination
    fi
done

for key in "${invalid_keys[@]}"; do
    combos="${invalid_combos[$key]#;}"
    list=()
    while IFS= read -r -d ';' c; do list+=("$c"); done <<<"$combos;"
    shown=""
    if [ "${#list[@]}" -eq "${#COMBOS[@]}" ] && [ "${#COMBOS[@]}" -gt 1 ]; then
        shown="all ${#COMBOS[@]} feature combinations"
    else
        for c in "${list[@]:0:3}"; do shown+="${shown:+, }BBB_FEATURES=\"$c\""; done
        [ "${#list[@]}" -le 3 ] || shown+=" and $((${#list[@]} - 3)) more"
    fi
    printf 'VIOLATION config-invalid: %s: %s (%s)\n' "${key%%$'\t'*}" "${key#*$'\t'}" "$shown" >>"$WORK/findings"
done

awk '!seen[$0]++' "$WORK/findings" >"$WORK/unique"
cat "$WORK/unique"
count="$(grep -c '^VIOLATION ' "$WORK/unique" || true)"
echo "assert-compose: $FILE: ${#COMBOS[@]} feature combination(s) checked, $count finding(s)" >&2
[ "$count" -eq 0 ]
