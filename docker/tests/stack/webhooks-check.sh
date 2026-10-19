#!/usr/bin/env bash
# Webhooks check for a running stack with the `webhooks` profile: a hook registered through the
# public API (hooks/create through haproxy and nginx) delivers the meeting events to a receiver
# container, authenticated as WEBHOOKS_BEARER_AUTH selects.
#
# Usage: BBB_SHARED_SECRET=... docker/tests/stack/webhooks-check.sh COMMAND [OPTION...]
#
#   start    start the receiver and register a global hook pointing at it
#   events   create a meeting, join it through the API and end it (meeting events)
#   verify   check what the receiver got: every callback authenticated as --auth says, and the
#            events named with --expect (default meeting-created,meeting-ended)
#   stop     destroy the hook, remove the receiver
#   run      start, events, verify, stop
#
#   --auth bearer|checksum   expected callback authentication (WEBHOOKS_BEARER_AUTH true|false)
#   --expect LIST            comma-separated event ids that must have arrived
#   --domain NAME            BBB_DOMAIN of the stack (default bbb.example.com)
#   --docker CMD             docker CLI to use (default `docker`)
#   --network NAME           the stack's `bbb` network (default bigbluebutton_bbb)
#   --image IMG              image with Node 24 for receiver and client (default
#                            localhost/bbb-graphql-actions:4.0.1)
#
# The receiver and the client run on the `bbb` network, where BBB_DOMAIN resolves to haproxy;
# the client does not verify the certificate (test CA). The shared secret goes to the client on
# stdin, never as an argument or in the environment. The receiver records the SHA-256 of a
# Bearer token, never the token; checksums are not printed. Prints `STEP <name>: OK|FAIL ...`
# and exits 0 if every step passed, 1 otherwise, 2 on a usage error.

set -euo pipefail

usage() { sed -n '2,/^$/{s/^# \{0,1\}//;p}' "$0" >&2; exit 2; }

[ $# -ge 1 ] || usage
cmd="$1"; shift
auth=""
expect="meeting-created,meeting-ended"
domain=bbb.example.com
docker_cmd=docker
network=bigbluebutton_bbb
image=localhost/bbb-graphql-actions:4.0.1
while [ $# -gt 0 ]; do
    case "$1" in
        --auth) [ $# -ge 2 ] || usage; auth="$2"; shift 2 ;;
        --expect) [ $# -ge 2 ] || usage; expect="$2"; shift 2 ;;
        --domain) [ $# -ge 2 ] || usage; domain="$2"; shift 2 ;;
        --docker) [ $# -ge 2 ] || usage; docker_cmd="$2"; shift 2 ;;
        --network) [ $# -ge 2 ] || usage; network="$2"; shift 2 ;;
        --image) [ $# -ge 2 ] || usage; image="$2"; shift 2 ;;
        -h | --help) usage ;;
        *) echo "unknown option: $1" >&2; usage ;;
    esac
done
case "$cmd" in start | events | verify | stop | run) ;; *) usage ;; esac
case "$auth" in bearer | checksum | "") ;; *) usage ;; esac
if [ "$cmd" = verify ] || [ "$cmd" = run ]; then [ -n "$auth" ] || usage; fi
[[ "$expect" =~ ^[a-z-]+(,[a-z-]+)*$ ]] || usage
[ -n "${BBB_SHARED_SECRET:-}" ] || { echo "webhooks-check.sh: BBB_SHARED_SECRET is not set" >&2; exit 2; }
secret="$BBB_SHARED_SECRET"
unset BBB_SHARED_SECRET

read -r -a DOCKER <<<"$docker_cmd"
RECEIVER=bbb-test-hook-receiver
CALLBACK="http://$RECEIVER:8080/hook"
MEETING=webhooks-check
failed=0
step() { echo "STEP $1: $2"; [ "$2" != FAIL ] || failed=1; }

# Receiver: one JSON line per POST on stdout (docker logs): URL, body, SHA-256 of a Bearer token.
# shellcheck disable=SC2016 # JavaScript
RECEIVER_JS='
const http = require("http"), crypto = require("crypto");
http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => { body += c; });
  req.on("end", () => {
    const m = /^Bearer (.*)$/.exec(req.headers.authorization || "");
    const bearer = m ? crypto.createHash("sha256").update(m[1]).digest("hex") : null;
    console.log(JSON.stringify({ method: req.method, url: req.url, body, bearer,
      authorization: req.headers.authorization != null }));
    res.end("ok");
  });
}).listen(8080, "0.0.0.0");'

# Client: secret on the first stdin line; ACTION = create-hook | destroy-hook | events | verify
# (verify reads the receiver's records from the remaining stdin lines).
# shellcheck disable=SC2016 # JavaScript
CLIENT_JS='
const crypto = require("crypto");
const [action, domain, callback, meeting, auth, expect] = process.argv.slice(1);
const lines = require("fs").readFileSync(0, "utf8").split("\n");
const secret = lines.shift();
const sha = (alg, s) => crypto.createHash(alg).update(s).digest("hex");
const base = `https://${domain}/bigbluebutton/api`;
const call = async (method, params) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${base}/${method}?${query}&checksum=${sha("sha1", method + query + secret)}`,
    { redirect: "manual" });
  return { status: res.status, text: await res.text() };
};
const tag = (xml, name) => ((new RegExp(`<${name}>(?:<!\\[CDATA\\[)?([^<\\]]*)`)).exec(xml) || [])[1];
const out = (step, ok, detail) => { console.log(`STEP ${step}: ${ok ? "OK" : "FAIL"} ${detail}`); if (!ok) process.exitCode = 1; };
(async () => {
  if (action === "create-hook") {
    const r = await call("hooks/create", { callbackURL: callback });
    out("hooks-create", tag(r.text, "returncode") === "SUCCESS", `HTTP ${r.status} returncode=${tag(r.text, "returncode")} hookID=${tag(r.text, "hookID")}`);
    const l = await call("hooks/list", {});
    out("hooks-list", l.text.includes(callback), `HTTP ${l.status} callback listed=${l.text.includes(callback)}`);
  } else if (action === "destroy-hook") {
    const l = await call("hooks/list", {});
    const ids = [...l.text.matchAll(/<hook><hookID>([^<]+)<\/hookID><callbackURL><!\[CDATA\[([^\]]*)/g)]
      .filter((m) => m[2] === callback).map((m) => m[1]);
    for (const id of ids) {
      const r = await call("hooks/destroy", { hookID: id });
      out("hooks-destroy", tag(r.text, "returncode") === "SUCCESS", `hookID=${id} returncode=${tag(r.text, "returncode")}`);
    }
    const after = await call("hooks/list", {});
    out("hooks-gone", !after.text.includes(callback), `${ids.length} hook(s) destroyed, callback listed=${after.text.includes(callback)}`);
  } else if (action === "events") {
    const c = await call("create", { meetingID: meeting, name: meeting, record: "false" });
    out("create", tag(c.text, "returncode") === "SUCCESS", `HTTP ${c.status} returncode=${tag(c.text, "returncode")}`);
    const j = await call("join", { meetingID: meeting, fullName: "webhooks-check", role: "MODERATOR", redirect: "false" });
    out("join", tag(j.text, "returncode") === "SUCCESS", `HTTP ${j.status} returncode=${tag(j.text, "returncode")}`);
    await new Promise((r) => setTimeout(r, 5000));
    const e = await call("end", { meetingID: meeting });
    out("end", tag(e.text, "returncode") === "SUCCESS", `HTTP ${e.status} returncode=${tag(e.text, "returncode")}`);
  } else if (action === "verify") {
    const recs = lines.filter((l) => l.startsWith("{")).map((l) => JSON.parse(l));
    const ids = new Set();
    let bad = 0;
    for (const r of recs) {
      const u = new URL(r.url, "http://receiver");
      const checksum = u.searchParams.get("checksum");
      let ok;
      if (auth === "bearer") {
        ok = r.bearer === sha("sha256", secret) && checksum == null;
      } else {
        // callback-emitter.js: sha1(callbackURL + body + secret), appended as ?checksum=
        ok = !r.authorization && checksum === sha("sha1", callback + r.body + secret);
      }
      if (!ok) bad += 1;
      for (const ev of JSON.parse(new URLSearchParams(r.body).get("event") || "[]")) {
        const id = ev && ev.data && ev.data.id;
        if (id) ids.add(id);
      }
    }
    out("callbacks", recs.length > 0 && bad === 0, `${recs.length} callback(s), ${bad} not authenticated as ${auth}`);
    const missing = expect.split(",").filter((id) => !ids.has(id));
    out("events", missing.length === 0, `received: ${[...ids].sort().join(",") || "none"}${missing.length ? `; missing: ${missing.join(",")}` : ""}`);
  }
})().catch((e) => { console.log(`STEP ${action}: FAIL ${e.message}`); process.exitCode = 1; });'

client() { # ACTION [STDIN-EXTRA]
    { printf '%s\n' "$secret"; cat; } | "${DOCKER[@]}" run --rm -i --network "$network" \
        -e NODE_TLS_REJECT_UNAUTHORIZED=0 -e NODE_NO_WARNINGS=1 --entrypoint node "$image" \
        -e "$CLIENT_JS" "$1" "$domain" "$CALLBACK" "$MEETING" "${auth:-none}" "$expect"
}

do_start() {
    "${DOCKER[@]}" rm -f "$RECEIVER" >/dev/null 2>&1 || true
    if "${DOCKER[@]}" run -d --name "$RECEIVER" --network "$network" --entrypoint node "$image" \
        -e "$RECEIVER_JS" >/dev/null; then step receiver OK; else step receiver FAIL; return; fi
    client create-hook </dev/null || failed=1
}
do_events() { client events </dev/null || failed=1; }
do_verify() {
    local i
    # Callbacks are asynchronous: wait up to 60 s for the expected events.
    for i in $(seq 12); do
        if "${DOCKER[@]}" logs "$RECEIVER" 2>/dev/null | client verify >/dev/null; then break; fi
        [ "$i" -lt 12 ] && sleep 5
    done
    "${DOCKER[@]}" logs "$RECEIVER" 2>/dev/null | client verify || failed=1
}
do_stop() {
    client destroy-hook </dev/null || failed=1
    "${DOCKER[@]}" rm -f "$RECEIVER" >/dev/null 2>&1 || true
    step receiver-removed OK
}

case "$cmd" in
    start) do_start ;;
    events) do_events ;;
    verify) do_verify ;;
    stop) do_stop ;;
    run) do_start; do_events; do_verify; do_stop ;;
esac
if [ "$failed" -eq 0 ]; then echo "WEBHOOKS-CHECK PASS"; else echo "WEBHOOKS-CHECK FAIL"; exit 1; fi
