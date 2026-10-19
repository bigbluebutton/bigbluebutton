#!/usr/bin/env bash
# Check of the shared-notes PDF converter: commandExecution.runnerScript of the image
# (bbb-shared-notes-server/docker/run-in-systemd.sh) runs wkhtmltopdf without network access, as
# the bare-metal unit does (PrivateNetwork=true, IPAddressDeny=any in
# bbb-shared-notes-server/run-in-systemd.sh), and the export still produces a PDF.
#
# Usage: docker/tests/stack/notes-pdf-check.sh [--docker CMD] IMAGE
#
#   --docker CMD   container CLI (default `docker`; for example `podman`, or
#                  `podman exec -i bbb-dind docker` for the Engine of dind.sh)
#   IMAGE          the shared-notes image (localhost/bbb-shared-notes:TAG)
#
# One container of IMAGE runs the steps, as an arbitrary UID with a read-only root file system,
# no capabilities and no-new-privileges, under the engine's default seccomp profile. Listeners
# on 127.0.0.1:8787 (the server's port), [::1]:8787 and 0.0.0.0:18080 record every request.
#
#   control      wkhtmltopdf alone on a page that loads images, a stylesheet, a script request
#                and a frame from those listeners (by 127.0.0.1, localhost, ::1, the container's
#                address and its hostname): requests arrive, so the page does reach them
#   blocked      the same page through the runner, with the arguments of the server
#                (src/express/handlers/exportDocumentToPdf.ts): no request arrives
#   socket       a TCP connection to 127.0.0.1:8787 through the runner fails with EACCES; the
#                process runs with NoNewPrivs and a seccomp filter
#   fds          a parent holding a listening socket and an established connection (as node
#                does) passes no socket to the command it starts through the runner, other than
#                its stdio pipes
#   isolation    a command started through the runner by a parent (as node starts it) cannot
#                open the parent's /proc/<pid>/mem for writing, whatever the host's ptrace policy,
#                and cannot write outside BBB_BLOCKNOTE_DIR, but can write inside it (Landlock;
#                fails on a kernel without Landlock where the ptrace policy allows the access).
#                Also shown, not checked: whether it can signal the parent (Landlock ABI 6)
#   export       a page without external references through the runner: exit 0 and a PDF of
#                one A4 page
#
# Prints `STEP <name>: OK|FAIL ...`, then `NOTES-PDF PASS` or `NOTES-PDF FAIL`. Exit 0 PASS,
# 1 FAIL, 2 usage error.

set -euo pipefail

usage() { sed -n '2,/^$/{s/^# \{0,1\}//;p}' "$0" >&2; exit 2; }

docker_cmd=docker
while [ $# -gt 0 ]; do
    case "$1" in
        --docker) [ $# -ge 2 ] || usage; docker_cmd="$2"; shift 2 ;;
        -h | --help) usage ;;
        -*) echo "unknown option: $1" >&2; usage ;;
        *) break ;;
    esac
done
[ $# -eq 1 ] || usage
image="$1"
read -r -a DOCKER <<<"$docker_cmd"

# shellcheck disable=SC2016 # the script runs in the container
"${DOCKER[@]}" run --rm -i --user 23456:34567 --read-only --tmpfs /tmp:rw,exec,mode=1777 \
    --cap-drop ALL --security-opt no-new-privileges --entrypoint bash "$image" -s <<'SCRIPT'
set -uo pipefail
runner=/usr/share/bbb-shared-notes-server/run-in-systemd.sh
dir=/tmp/shared-notes-dropbox
log=/tmp/requests.log
mkdir -p "$dir"
: >"$log"
rc=0
step() { echo "STEP $1: $2"; [ "${2%% *}" = OK ] || rc=1; }

# The arguments of the server's command (exportDocumentToPdf.ts).
wk_args=(--encoding utf-8 --dpi 96 --page-size A4 --margin-top 0mm --margin-bottom 0mm
    --margin-left 0mm --margin-right 0mm --print-media-type --background --no-header-line)

node -e '
  const http = require("node:http"); const fs = require("node:fs");
  const rec = (req, res) => { fs.appendFileSync(process.argv[1], `${req.headers.host} ${req.url}\n`); res.end("x"); };
  for (const [port, host] of [[8787, "127.0.0.1"], [8787, "::1"], [18080, "0.0.0.0"]]) {
    http.createServer(rec).listen(port, host).on("error", (e) => console.error(`listen ${host}:${port}: ${e.message}`));
  }' "$log" &
listener=$!
sleep 1

addr="$(node -e 'const n = require("node:os").networkInterfaces();
  for (const l of Object.values(n)) for (const a of l) if (a.family === "IPv4" && !a.internal) { console.log(a.address); process.exit(0); }')"
host="$(hostname)"
targets=(127.0.0.1:8787 localhost:8787 '[::1]:8787')
[ -z "$addr" ] || targets+=("$addr:18080")
[ -z "$host" ] || targets+=("$host:18080")

{
    echo '<html><head><meta charset="utf-8">'
    for t in "${targets[@]}"; do echo "<link rel=\"stylesheet\" href=\"http://$t/probe/stylesheet\">"; done
    echo '</head><body><p>notes-pdf probe</p>'
    for t in "${targets[@]}"; do
        echo "<img src=\"http://$t/probe/image\">"
        echo "<iframe src=\"http://$t/probe/frame\"></iframe>"
        echo "<script>var x = new XMLHttpRequest(); x.open('GET', 'http://$t/probe/script', false); try { x.send(); } catch (e) {}</script>"
    done
    echo '</body></html>'
} >"$dir/probe.html"

hits() { grep -c . "$log" || true; }

# control
cd "$dir"
timeout 60 wkhtmltopdf "${wk_args[@]}" probe.html control.pdf >/dev/null 2>&1
n="$(hits)"
if [ "$n" -gt 0 ]; then step control "OK $n request(s) without the runner, e.g. $(head -n 1 "$log")"
else step control "FAIL no request arrived without the runner: the page reaches nothing, the check proves nothing"; fi

# blocked
: >"$log"
"$runner" 30 wkhtmltopdf "${wk_args[@]}" "$dir/probe.html" "$dir/blocked.pdf" >/tmp/blocked.out 2>&1
st=$?
sleep 2
n="$(hits)"
if [ "$n" -eq 0 ]; then step blocked "OK 0 requests through the runner (${#targets[@]} addresses: ${targets[*]}; wkhtmltopdf exit $st)"
else step blocked "FAIL $n request(s) through the runner: $(tr '\n' ' ' <"$log")"; fi

# socket
out="$("$runner" 10 node -e '
  const fs = require("node:fs");
  const s = fs.readFileSync("/proc/self/status", "utf8");
  const nnp = /NoNewPrivs:\s*(\d)/.exec(s)[1], sc = /Seccomp:\s*(\d)/.exec(s)[1];
  require("node:net").connect(8787, "127.0.0.1")
    .on("connect", () => { console.log(`connected NoNewPrivs=${nnp} Seccomp=${sc}`); process.exit(0); })
    .on("error", (e) => { console.log(`${e.code} NoNewPrivs=${nnp} Seccomp=${sc}`); process.exit(0); });' 2>&1)"
if [ "$out" = "EACCES NoNewPrivs=1 Seccomp=2" ]; then step socket "OK connect 127.0.0.1:8787: $out"
else step socket "FAIL connect 127.0.0.1:8787: $out"; fi

# fds
out="$(node -e '
  const net = require("node:net");
  const srv = net.createServer().listen(18081, "127.0.0.1", () => {
    const conn = net.connect(18081, "127.0.0.1", () => {
      require("node:child_process").exec(`${process.argv[1]} 10 sh -c "ls -l /proc/self/fd/"`, (e, so) => {
        // 0-2 are the stdio pipes node creates for the command (socket pairs to node itself).
        console.log(e ? `error ${e.message}` : so.split("\n").filter((l) => / ([3-9]|[1-9][0-9]+) -> socket:/.test(l)).length + " socket(s)");
        conn.destroy(); srv.close();
      });
    });
  });' "$runner" 2>&1)"
if [ "$out" = "0 socket(s)" ]; then step fds "OK the command inherits $out besides stdio (parent: listener + connection)"
else step fds "FAIL the command inherits $out"; fi

# isolation
scope="$(cat /proc/sys/kernel/yama/ptrace_scope 2>/dev/null || echo none)"
# shellcheck disable=SC2016 # expanded by the inner sh
probe='(exec 3<>"/proc/$1/mem") 2>/dev/null && echo mem=opened || echo mem=denied
(echo x >/tmp/outside.txt) 2>/dev/null && echo outside=written || echo outside=denied
(echo x >"$2/inside.txt") 2>/dev/null && echo inside=written || echo inside=denied
kill -0 "$1" 2>/dev/null && echo signal=allowed || echo signal=denied'
out="$(node -e '
  const { execFile } = require("node:child_process");
  execFile(process.argv[1], ["10", "sh", "-c", process.argv[2], "sh", String(process.pid), process.argv[3]],
    (e, so, se) => console.log(e ? `error ${e.message} ${se}` : so.trim().split("\n").join(" ")));' \
    "$runner" "$probe" "$dir" 2>&1)"
case "$out" in
    "mem=denied outside=denied inside=written signal="*) step isolation "OK $out (Yama ptrace_scope $scope)" ;;
    *) step isolation "FAIL $out (Yama ptrace_scope $scope)" ;;
esac
rm -f /tmp/outside.txt

# export
printf '<html><head><meta charset="utf-8"></head><body><h1>Shared notes</h1><p>%s</p></body></html>\n' \
    'notes-pdf export check' >"$dir/export.html"
"$runner" 30 wkhtmltopdf "${wk_args[@]}" "$dir/export.html" "$dir/export.pdf" >/tmp/export.out 2>&1
st=$?
if [ "$st" -ne 0 ] || [ ! -s "$dir/export.pdf" ]; then
    step export "FAIL wkhtmltopdf exit $st: $(tail -n 3 /tmp/export.out | tr '\n' ' ')"
else
    head5="$(head -c 5 "$dir/export.pdf")"
    pages="$(grep -ac '/Type /Page$\|/Type /Page[^s]' "$dir/export.pdf" || true)"
    a4="$(grep -ac 'MediaBox \[0 0 595[.0]* 842[.0]*\]' "$dir/export.pdf" || true)"
    size="$(stat -c %s "$dir/export.pdf")"
    if [ "$head5" = "%PDF-" ] && tail -c 32 "$dir/export.pdf" | grep -aq '%%EOF' && [ "$pages" -eq 1 ] && [ "$a4" -ge 1 ]; then
        step export "OK exit 0, $size bytes, $head5 … %%EOF, $pages page(s), A4 MediaBox"
    else
        step export "FAIL exit 0, $size bytes, header '$head5', $pages page(s), A4 MediaBox $a4"
    fi
fi

kill "$listener" 2>/dev/null
if [ "$rc" -eq 0 ]; then echo "NOTES-PDF PASS"; else echo "NOTES-PDF FAIL"; fi
exit "$rc"
SCRIPT
