#!/usr/bin/env bash
# Effective configuration of bbb-webrtc-sfu and webhooks in a running stack: what node-config
# merged in each container (files, NODE_CONFIG, environment), printed and checked with `node -e`
# in the container itself. webhooks runs upstream's image unchanged, configured in
# docker-compose.yml only, so this check takes the place of a golden-file case for it; for
# bbb-webrtc-sfu it checks the merge of the image's file with upstream's configuration.
#
# Usage: docker/tests/stack/config-check.sh [OPTION...]
#
#   --compose CMD           docker compose command of the stack (default `docker compose`)
#   --domain NAME           BBB_DOMAIN of the stack (default bbb.example.com)
#   --bearer-auth true|false  WEBHOOKS_BEARER_AUTH of the stack (default true)
#   --skip-webhooks         do not check webhooks (profile off)
#
# Secrets are compared in the container with the environment variable they come from; no value
# of a secret is printed. Prints `STEP <name>: OK|FAIL ...`, then `CONFIG-CHECK PASS` or
# `CONFIG-CHECK FAIL`. Exit status: 0 every step passed, 1 otherwise, 2 on a usage error.

set -euo pipefail

usage() { sed -n '2,/^$/{s/^# \{0,1\}//;p}' "$0" >&2; exit 2; }

compose_cmd="docker compose"
domain=bbb.example.com
bearer=true
webhooks=1
while [ $# -gt 0 ]; do
    case "$1" in
        --compose) [ $# -ge 2 ] || usage; compose_cmd="$2"; shift 2 ;;
        --domain) [ $# -ge 2 ] || usage; domain="$2"; shift 2 ;;
        --bearer-auth) [ $# -ge 2 ] || usage; bearer="$2"; shift 2 ;;
        --skip-webhooks) webhooks=0; shift ;;
        -h | --help) usage ;;
        *) echo "unknown option: $1" >&2; usage ;;
    esac
done
case "$bearer" in true | false) ;; *) usage ;; esac
[[ "$domain" =~ ^[A-Za-z0-9.-]+$ ]] || usage
read -r -a COMPOSE <<<"$compose_cmd"

# Shared by both scripts: the environment of the service process (PID 1; `exec` does not run the
# entrypoint, which derives some variables), and check(name, ok, detail), one STEP line.
# shellcheck disable=SC2016 # JavaScript, expanded by node
CHECK_JS='
for (const k of Object.keys(process.env)) delete process.env[k];
for (const kv of require("fs").readFileSync("/proc/1/environ", "utf8").split("\0")) {
  const i = kv.indexOf("=");
  if (i > 0) process.env[kv.slice(0, i)] = kv.slice(i + 1);
}
let failed = 0;
const check = (name, ok, detail) => {
  console.log(`STEP ${name}: ${ok ? "OK" : "FAIL"} ${detail}`);
  if (!ok) failed = 1;
};
const show = (v) => JSON.stringify(v);
'

# Upstream's NODE_CONFIG_DIR, /app/config/ and the Tier 3 directory, with the image's file in
# between (docker/bbb-webrtc-sfu/Dockerfile).
# shellcheck disable=SC2016 # JavaScript, expanded by node
SFU_JS="$CHECK_JS"'
const c = require("/app/node_modules/config");
const g = (p) => (c.has(p) ? c.get(p) : undefined);
const env = process.env;
check("sfu-sources", c.util.getConfigSources().some((s) => s.name === "/usr/local/share/bbb/bbb-webrtc-sfu/production.yml"),
  c.util.getConfigSources().map((s) => s.name).join(" "));
const adapters = g("media-server-adapters").map((a) => a.name);
check("sfu-adapters", !adapters.includes("Freeswitch") && adapters.includes("mediasoup"), show(adapters));
check("sfu-audio-adapter", g("audioMediaServer") === "mediasoup", show(g("audioMediaServer")));
check("sfu-webhook", g("livekit.webhook.port") === 3040 && g("livekit.webhook.path") === "/livekit-webhook",
  `${g("livekit.webhook.port")} ${g("livekit.webhook.path")}`);
check("sfu-recording-adapter", g("livekit.recordingAdapter") === "bbb-webrtc-recorder" && g("recordingAdapter") === "bbb-webrtc-recorder",
  `${g("livekit.recordingAdapter")} ${g("recordingAdapter")}`);
check("sfu-postinst", g("recordWebcams") === true && g("kurento").length === 0 && g("mcs-address") === "127.0.0.1"
  && g("mediasoup.workerBalancing.strategy") === "least-loaded" && g("mediasoup.enableWorkerTransposing") === true
  && g("mediasoup.dedicatedMediaTypeWorkers.audio") === "auto",
  "recordWebcams, kurento, mcs-address, mediasoup worker settings as after-install.sh sets them");
check("sfu-livekit", g("livekit.enabled") === true && g("livekit.host") === "http://livekit:7880" && g("livekit.bbbDomain") === process.argv[1],
  `enabled=${g("livekit.enabled")} host=${g("livekit.host")} bbbDomain=${g("livekit.bbbDomain")}`);
check("sfu-credentials", !!env.LIVEKIT_KEY && g("livekit.key") === env.LIVEKIT_KEY && !!env.LIVEKIT_SECRET
  && g("livekit.secret") === env.LIVEKIT_SECRET && !["LIVEKIT_KEY", "LIVEKIT_SECRET"].includes(g("livekit.secret")),
  "key and secret from the environment (values not shown)");
check("sfu-wiring", g("redisHost") === "redis" && g("clientHost") === "0.0.0.0", `redisHost=${g("redisHost")} clientHost=${g("clientHost")}`);
check("sfu-log", g("log.file") === false && g("log.stdout") === true, `file=${g("log.file")} stdout=${g("log.stdout")}`);
process.exitCode = failed;
'

# bbb-webhooks sets NODE_CONFIG_DIR itself (src/common/env.js), relative to its working directory.
# shellcheck disable=SC2016 # JavaScript, expanded by node
WEBHOOKS_JS="$CHECK_JS"'
process.chdir("/app");
import("/app/src/common/env.js").then(async () => {
  const c = (await import("config")).default;
  const g = (p) => (c.has(p) ? c.get(p) : undefined);
  const mod = g("modules")["../out/webhooks/index.js"].config;
  const env = process.env;
  check("webhooks-sources", c.util.getConfigSources().some((s) => s.name === "$NODE_CONFIG"),
    c.util.getConfigSources().map((s) => s.name).join(" "));
  check("webhooks-bearer-auth", g("bbb.auth2_0") === (process.argv[2] === "true"), show(g("bbb.auth2_0")));
  check("webhooks-getraw", mod.getRaw === false, show(mod.getRaw));
  check("webhooks-domain", g("bbb.serverDomain") === process.argv[1], show(g("bbb.serverDomain")));
  check("webhooks-secret", !!env.SHARED_SECRET && g("bbb.sharedSecret") === env.SHARED_SECRET && g("bbb.sharedSecret") !== "mysharedsecret",
    "shared secret from the environment (value not shown)");
  check("webhooks-wiring", mod.api.bind === "0.0.0.0" && mod.api.port === 3005 && g("redis.host") === "redis",
    `bind=${mod.api.bind} port=${mod.api.port} redis=${g("redis.host")}`);
  check("webhooks-log", g("log.file") === false && g("log.stdout") === true, `file=${g("log.file")} stdout=${g("log.stdout")}`);
  process.exitCode = failed;
}).catch((e) => { console.log(`STEP webhooks-config: FAIL ${e.message}`); process.exitCode = 1; });
'

failed=0
# run SERVICE SCRIPT ARG...: the script in the running container, its STEP lines passed on.
run() {
    local service="$1" script="$2" out rc=0
    shift 2
    out="$("${COMPOSE[@]}" exec -T "$service" node -e "$script" "$@" 2>&1)" || rc=$?
    # node-config's warning about a missing production.yml goes to stderr; only STEP lines count.
    grep '^STEP ' <<<"$out" || echo "STEP $service-config: FAIL no output (exit $rc)"
    [ "$rc" -eq 0 ] && grep -q '^STEP ' <<<"$out" || failed=1
}

run bbb-webrtc-sfu "$SFU_JS" "$domain"
[ "$webhooks" -eq 0 ] || run webhooks "$WEBHOOKS_JS" "$domain" "$bearer"

if [ "$failed" -eq 0 ]; then echo "CONFIG-CHECK PASS"; else echo "CONFIG-CHECK FAIL"; exit 1; fi
