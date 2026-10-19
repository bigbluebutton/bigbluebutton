#!/usr/bin/env bash
# Development loops of compose.dev.yml against a stack started with it (docker/README.md,
# "Development"). Each loop changes a visible string in the bind-mounted source, shows that the
# change takes effect, and restores the source file:
#   html5      a string in the client's entry (client/main.tsx) appears in the bundle that
#              index.html loads through haproxy and nginx, without a restart of html5 or
#              html5-dev; the hot reload WebSocket (/html5client/ws) is upgraded through nginx
#   bbb-web    a field added to the JSON answer of /bigbluebutton/api appears there after
#              `run --rm bbb-web-build` and a restart of bbb-web
#   akka-apps  a line printed at start (Boot.scala) appears in the log of akka-apps after
#              `run --rm akka-apps-build` and a restart of akka-apps
# Prints `STEP <name>: OK|FAIL ...` and `TIME <name>: <seconds>`; exits 0 if every step passed,
# 1 otherwise, 2 on a usage error. The source files are restored after each loop; what
# bbb-web-build and akka-apps-build deployed stays until their next run.
#
# Usage: docker/tests/stack/dev-check.sh [OPTION...] [LOOP...]   (default: all three loops)
#
#   --compose CMD     docker compose command of the stack, with docker-compose.yml and
#                     compose.dev.yml (split on blanks); default
#                     `docker compose -f docker-compose.yml -f compose.dev.yml`
#   --docker CMD      docker CLI (default `docker`)
#   --domain NAME     BBB_DOMAIN of the stack (default bbb.example.com)
#   --network NAME    the stack's `bbb` network (default bigbluebutton_bbb)
#   --image IMG       image with curl and bash for the client (default localhost/bbb-web:4.0.1)
#   --timeout SEC     how long to wait for a change to take effect (default 600)
#
# The client runs on the `bbb` network, where BBB_DOMAIN resolves to haproxy; it does not verify
# the certificate (test CA). The source is changed in this repository: the stack's bind mounts
# must point at it (dind.sh mounts it at /src).

set -euo pipefail

usage() { sed -n '2,/^$/{s/^# \{0,1\}//;p}' "$0" >&2; exit 2; }

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../../.." && pwd)"
compose_cmd="docker compose -f docker-compose.yml -f compose.dev.yml"
docker_cmd=docker
domain=bbb.example.com
network=bigbluebutton_bbb
image=localhost/bbb-web:4.0.1
timeout=600
loops=()
while [ $# -gt 0 ]; do
    case "$1" in
        --compose) [ $# -ge 2 ] || usage; compose_cmd="$2"; shift 2 ;;
        --docker) [ $# -ge 2 ] || usage; docker_cmd="$2"; shift 2 ;;
        --domain) [ $# -ge 2 ] || usage; domain="$2"; shift 2 ;;
        --network) [ $# -ge 2 ] || usage; network="$2"; shift 2 ;;
        --image) [ $# -ge 2 ] || usage; image="$2"; shift 2 ;;
        --timeout) [ $# -ge 2 ] || usage; timeout="$2"; shift 2 ;;
        -h | --help) usage ;;
        html5 | bbb-web | akka-apps) loops+=("$1"); shift ;;
        *) echo "unknown argument: $1" >&2; usage ;;
    esac
done
[[ "$domain" =~ ^[A-Za-z0-9.-]+$ ]] || usage
[[ "$timeout" =~ ^[0-9]+$ ]] || usage
[ "${#loops[@]}" -gt 0 ] || loops=(html5 bbb-web akka-apps)

read -r -a COMPOSE <<<"$compose_cmd"
read -r -a DOCKER <<<"$docker_cmd"
MARKER="bbb-dev-check-$(date +%s)-$$"
failed=0
step() { echo "STEP $1: $2 ${3:-}"; [ "$2" != FAIL ] || failed=1; }
timing() { echo "TIME $1: $2"; }
now() { date +%s; }

# Source files are changed in place and restored from a copy on exit.
BACKUP="$(mktemp -d)"
changed=()
restore() {
    local f
    for f in "${changed[@]}"; do cp -- "$BACKUP/$(printf '%s' "$f" | tr / _)" "$REPO/$f"; done
    changed=()
}
trap 'restore; rm -rf -- "$BACKUP"' EXIT
# change FILE SED-EXPRESSION: edit a file of the repository (sed -i), after saving a copy.
change() {
    local f="$1"
    cp -- "$REPO/$f" "$BACKUP/$(printf '%s' "$f" | tr / _)"
    changed+=("$f")
    sed -i -e "$2" "$REPO/$f"
    grep -qF "$MARKER" "$REPO/$f" || { echo "dev-check.sh: the edit of $f did not apply" >&2; exit 2; }
}

client() {
    "${DOCKER[@]}" run --rm --network "$network" --entrypoint curl "$image" -ksS --max-time 20 "$@" </dev/null
}
# container_state SERVICE: container id, start time and restart count.
container_state() {
    local id
    id="$("${COMPOSE[@]}" ps -q "$1")"
    [ -n "$id" ] || { echo none; return; }
    "${DOCKER[@]}" inspect -f '{{.Id}} {{.State.StartedAt}} {{.RestartCount}}' "$id"
}
# wait_healthy SERVICE: until its container is healthy (or the timeout).
wait_healthy() {
    local id deadline=$(($(now) + timeout)) status
    while :; do
        id="$("${COMPOSE[@]}" ps -q "$1")"
        status="$([ -n "$id" ] && "${DOCKER[@]}" inspect -f '{{.State.Health.Status}}' "$id" 2>/dev/null || true)"
        [ "$status" = healthy ] && return 0
        [ "$(now)" -lt "$deadline" ] || return 1
        sleep 3
    done
}

# html5: the bundle that index.html names.
# index.html loads bundle.<bundleHash>.js (client/main.html), the hash changes with each build.
html5_bundle() {
    local index hash
    index="$(client "https://$domain/html5client/" 2>/dev/null)" || return 1
    hash="$(printf '%s' "$index" | sed -n "s/^ *var bundleHash = '\([0-9a-f]*\)';.*/\1/p" | head -n 1)"
    [ -n "$hash" ] || return 1
    client "https://$domain/html5client/bundle.$hash.js" 2>/dev/null
}

loop_html5() {
    local before after start t=0 code
    before="$(container_state html5) $(container_state html5-dev)"
    html5_bundle >"$BACKUP/bundle.js" || true
    if [ ! -s "$BACKUP/bundle.js" ]; then
        step html5-before FAIL "no bundle through haproxy and nginx"
        return
    elif grep -qF "$MARKER" "$BACKUP/bundle.js"; then
        step html5-before FAIL "the bundle already has the marker"
        return
    fi
    step html5-before OK "the bundle loads through haproxy and nginx ($(wc -c <"$BACKUP/bundle.js") bytes)"
    code="$(client -o /dev/null -w '%{http_code}' --http1.1 -H 'Connection: Upgrade' -H 'Upgrade: websocket' \
        -H 'Sec-WebSocket-Version: 13' -H 'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==' \
        --max-time 5 "https://$domain/html5client/ws" 2>/dev/null || true)"
    if [ "$code" = 101 ]; then
        step html5-websocket OK "/html5client/ws: HTTP 101"
    else
        step html5-websocket FAIL "/html5client/ws: HTTP ${code:-none}, expected 101"
    fi
    start="$(now)"
    change bigbluebutton-html5/client/main.tsx "\$a console.debug('$MARKER');"
    # The bundle into a file: with pipefail, `grep -q` ending the pipe early would fail it.
    until { html5_bundle >"$BACKUP/bundle.js" || true; grep -qF "$MARKER" "$BACKUP/bundle.js"; }; do
        t=$(($(now) - start))
        if [ "$t" -ge "$timeout" ]; then
            step html5-reload FAIL "the bundle has no marker after ${timeout}s"
            return
        fi
        sleep 2
    done
    t=$(($(now) - start))
    timing html5-reload "$t"
    after="$(container_state html5) $(container_state html5-dev)"
    if [ "$before" = "$after" ]; then
        step html5-reload OK "the bundle has the change after ${t}s, html5 and html5-dev not restarted"
    else
        step html5-reload FAIL "a container was restarted: $before -> $after"
    fi
}

# rebuild NAME BUILDER SERVICE: run the builder, restart the service, wait until it is healthy.
rebuild() {
    local name="$1" builder="$2" service="$3" start t
    start="$(now)"
    if ! "${COMPOSE[@]}" run --rm "$builder" >"$BACKUP/$builder.log" 2>&1; then
        tail -n 40 "$BACKUP/$builder.log" >&2
        step "$name-build" FAIL "run --rm $builder failed"
        return 1
    fi
    t=$(($(now) - start))
    timing "$name-build" "$t"
    step "$name-build" OK "run --rm $builder: ${t}s"
    start="$(now)"
    "${COMPOSE[@]}" restart "$service" >/dev/null 2>&1
    if ! wait_healthy "$service"; then
        step "$name-restart" FAIL "$service not healthy ${timeout}s after the restart"
        return 1
    fi
    t=$(($(now) - start))
    timing "$name-restart" "$t"
    step "$name-restart" OK "restart $service, healthy after ${t}s"
}

loop_bbb_web() {
    local f=bigbluebutton-web/grails-app/controllers/org/bigbluebutton/web/controllers/ApiController.groovy
    local re='^ *html5PluginSdkVersion paramsProcessorUtil\.getHtml5PluginSdkVersion()'
    [ "$(grep -c "$re" "$REPO/$f")" -eq 1 ] || { step bbb-web-edit FAIL "the line to change is not in $f once"; return; }
    client -H 'Content-Type: application/json' "https://$domain/bigbluebutton/api" >"$BACKUP/api.json" || true
    if grep -qF "$MARKER" "$BACKUP/api.json"; then
        step bbb-web-before FAIL "the API already has the marker"
        return
    fi
    change "$f" "/$re/a\\            devCheck '$MARKER'"
    rebuild bbb-web bbb-web-build bbb-web || return 0
    client -H 'Content-Type: application/json' "https://$domain/bigbluebutton/api" >"$BACKUP/api.json" || true
    if grep -qF "\"devCheck\": \"$MARKER\"" "$BACKUP/api.json"; then
        step bbb-web-change OK "/bigbluebutton/api answers with the new field"
    else
        step bbb-web-change FAIL "/bigbluebutton/api has no devCheck field with the marker"
    fi
}

loop_akka_apps() {
    local f=akka-bbb-apps/src/main/scala/org/bigbluebutton/Boot.scala
    local re='^ *val apiService = new ApiService(healthzService, meetingInfoService, userInfoService)'
    [ "$(grep -c "$re" "$REPO/$f")" -eq 1 ] || { step akka-apps-edit FAIL "the line to change is not in $f once"; return; }
    change "$f" "/$re/a\\  println(\"$MARKER\")"
    rebuild akka-apps akka-apps-build akka-apps || return 0
    "${COMPOSE[@]}" logs --no-color akka-apps >"$BACKUP/akka-apps.log" 2>&1 || true
    if grep -qF "$MARKER" "$BACKUP/akka-apps.log"; then
        step akka-apps-change OK "the log of akka-apps has the new line"
    else
        step akka-apps-change FAIL "the log of akka-apps has no line with the marker"
    fi
}

for loop in "${loops[@]}"; do
    case "$loop" in
        html5) loop_html5 ;;
        bbb-web) loop_bbb_web ;;
        akka-apps) loop_akka_apps ;;
    esac
    restore
done
exit "$failed"
