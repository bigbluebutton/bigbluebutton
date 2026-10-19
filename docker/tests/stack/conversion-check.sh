#!/usr/bin/env bash
# Check of the office conversion service: Collabora Online (collabora/code, the server
# bbb-libreoffice/assets/convert-cool.sh names), as docker-compose.yml runs it for bbb-web.
# Documents of each office format converted to PDF with the right page count through bbb-web's
# own conversion script; resources that documents link to not fetched; the service attached to
# its internal network only.
#
# Usage: docker/tests/stack/conversion-check.sh [OPTION...]
#
#   --docker CMD           docker CLI to use (default: docker if installed, else podman)
#   --stack CMD            check the conversion service of a running stack, with CMD as its
#                          docker compose command (dind.sh: `dind.sh conversion`); the client
#                          is the stack's bbb-web container, with its own BBB_WEB_CONVERSION_URL
#   --client-image IMG     bbb-web image (default localhost/bbb-web:4.0.1): the client of the
#                          standalone check and of the control instance (curl, pdfinfo and
#                          bbb-web's convert-remote.sh)
#   --listener-image IMG   image with Node 24 for the link listener (default
#                          localhost/bbb-graphql-actions:4.0.1)
#   --compose-json FILE    standalone: the output of `docker compose config --format json` for
#                          docker-compose.yml, for an engine without Docker Compose (podman)
#
# The service's settings (image, environment, tmpfs, capabilities, read-only root) are read
# from docker-compose.yml with `docker compose config` (the stack's own compose command with
# --stack). Standalone (no --stack), the check starts the service with them on a throwaway
# internal network; with --stack it checks the running service. Both remove what they start.
#
# The sample documents are made by the service itself from the flat ODF files in
# conversion-samples/ (docx and odt from sample.fodt, 3 pages; pptx from sample.fodp, 2 slides;
# xlsx from sample.fods, 2 sheets); nothing is downloaded.
#
# Links: a listener (Node) runs on the service's network. Documents link to it by name and by
# address: HTML with a stylesheet, an image and an iframe; ODF text with an image and a linked
# section; a .docx with an external image. Two positive controls keep the check from passing
# by accident: the client's own request must reach the listener, and a control instance of the
# same image, with Collabora's default net.lok_allow/net.post_allow (extra_params without the
# net.* settings of docker-compose.yml), must fetch at least one of the links. The service
# itself must cause no request.
#
# Prints `STEP <name>: OK|FAIL ...`, then `CONVERSION PASS` or `CONVERSION FAIL`.
# Exit 0 PASS, 1 FAIL, 2 usage or engine error.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../../.." && pwd)"

usage() { sed -n '2,/^$/{s/^# \{0,1\}//;p}' "$0" >&2; exit 2; }

docker_cmd=""
client_image=localhost/bbb-web:4.0.1
listener_image=localhost/bbb-graphql-actions:4.0.1
stack_cmd=""
compose_json_file=""
while [ $# -gt 0 ]; do
    case "$1" in
        --docker) [ $# -ge 2 ] || usage; docker_cmd="$2"; shift 2 ;;
        --client-image) [ $# -ge 2 ] || usage; client_image="$2"; shift 2 ;;
        --listener-image) [ $# -ge 2 ] || usage; listener_image="$2"; shift 2 ;;
        --stack) [ $# -ge 2 ] || usage; stack_cmd="$2"; shift 2 ;;
        --compose-json) [ $# -ge 2 ] || usage; compose_json_file="$2"; shift 2 ;;
        -h | --help) usage ;;
        *) echo "unknown option: $1" >&2; usage ;;
    esac
done
if [ -z "$docker_cmd" ]; then
    if command -v docker >/dev/null 2>&1; then docker_cmd=docker; else docker_cmd=podman; fi
fi
read -r -a DOCKER <<<"$docker_cmd"
"${DOCKER[@]}" version >/dev/null 2>&1 || { echo "conversion-check.sh: $docker_cmd does not work" >&2; exit 2; }

failed=0
step() { echo "STEP $1: $2${3:+ $3}"; [ "$2" = OK ] || failed=1; }
record() { # print the client's STEP lines and remember a failure
    local line
    while IFS= read -r line; do
        echo "$line"
        case "$line" in "STEP "*": OK"*) ;; "STEP "*) failed=1 ;; esac
    done
}
finish() {
    if [ "$failed" -eq 0 ]; then echo "CONVERSION PASS"; exit 0; fi
    echo "CONVERSION FAIL"; exit 1
}

PEER=conversion-check-peer
SVC=conversion-check-service
CTL=conversion-check-control
own_net=""
# shellcheck disable=SC2329 # invoked by the EXIT trap
cleanup() {
    "${DOCKER[@]}" rm -f "$PEER" "$SVC" "$CTL" >/dev/null 2>&1 || true
    if [ -n "$own_net" ]; then "${DOCKER[@]}" network rm "$own_net" >/dev/null 2>&1 || true; fi
    return 0
}
trap cleanup EXIT

# CLIENT: samples and conversions. Runs in the bbb-web container (stack) or image; the input
# tar comes on stdin. Argument: the convert-to URL.
# shellcheck disable=SC2016 # expanded in the container
CLIENT='
set -u
url="$1"
w="$(mktemp -d)"; trap "rm -rf \"$w\"" EXIT; cd "$w"; tar -x
step() { echo "STEP $1: $2${3:+ $3}"; }
for spec in sample.fodt:docx sample.fodt:odt sample.fodp:pptx sample.fods:xlsx; do
    src="${spec%:*}"; fmt="${spec#*:}"
    c="$(curl -sS --max-time 60 -o "sample.$fmt" -w "%{http_code}" -F "data=@$src" "$url/$fmt" 2>&1 || true)"
    if [ "$c" = 200 ] && head -c 2 "sample.$fmt" 2>/dev/null | grep -q "^PK"; then
        step "sample-$fmt" OK "$(stat -c %s "sample.$fmt") bytes from $src"
    else
        step "sample-$fmt" FAIL "HTTP $c from $url/$fmt"
    fi
done
# Each format to PDF, through bbb-web'"'"'s conversion script with the arguments bbb-web passes
# (Office2PdfPageConverter: source, destination, pdf, timeout).
for spec in docx:3 odt:3 pptx:2 xlsx:2; do
    ext="${spec%:*}"; want="${spec#*:}"; rm -f out.pdf
    start=$(date +%s%N)
    if BBB_WEB_CONVERSION_URL="$url" /usr/local/share/bbb/bbb-web/convert-remote.sh "sample.$ext" out.pdf pdf 60 >log 2>&1; then
        pages="$(pdfinfo out.pdf 2>/dev/null | sed -n "s/^Pages: *//p")"
        ms=$(( ($(date +%s%N) - start) / 1000000 ))
        if [ "$pages" = "$want" ]; then step "convert-$ext" OK "$pages pages, $(stat -c %s out.pdf) bytes, ${ms} ms"
        else step "convert-$ext" FAIL "${pages:-no} pages, expected $want"; fi
    else
        step "convert-$ext" FAIL "convert-remote.sh failed: $(tail -n 1 log)"
    fi
done
c="$(curl -sS -o body -w "%{http_code}" "${url%/cool/convert-to}/" || true)"
if [ "$c" = 200 ]; then step health OK "GET / -> HTTP 200 $(head -c 20 body)"; else step health FAIL "GET / -> HTTP $c"; fi
'

# LINKS: the link documents to a convert-to URL; each must still convert. Arguments: the
# convert-to URL and a step prefix.
# shellcheck disable=SC2016 # expanded in the container
LINKS='
set -u
url="$1"; prefix="$2"
w="$(mktemp -d)"; trap "rm -rf \"$w\"" EXIT; cd "$w"; tar -x
for f in link-*; do
    c="$(curl -sS --max-time 60 -o out.pdf -w "%{http_code}" -F "data=@$f" "$url/pdf" || true)"
    if [ "$c" = 200 ] && head -c 5 out.pdf | grep -q "^%PDF-"; then echo "STEP $prefix-$f: OK converted (HTTP 200)"
    else echo "STEP $prefix-$f: FAIL HTTP $c"; fi
done
'

# The listener: logs every request it gets, one `REQUEST` line each.
start_listener() { # NETWORK
    "${DOCKER[@]}" rm -f "$PEER" >/dev/null 2>&1 || true
    "${DOCKER[@]}" run -d --name "$PEER" --network "$1" --entrypoint node "$listener_image" -e \
        'require("http").createServer((q, r) => { console.log("REQUEST", q.method, q.url, q.headers["user-agent"] || ""); r.end("x"); }).listen(8090)' >/dev/null
    for _ in $(seq 20); do
        "${DOCKER[@]}" logs "$PEER" >/dev/null 2>&1 && "${DOCKER[@]}" inspect -f '{{.State.Running}}' "$PEER" 2>/dev/null | grep -q true && break
        sleep 1
    done
    sleep 2
}
requests() { "${DOCKER[@]}" logs "$PEER" 2>&1 | grep '^REQUEST' || true; }
count() { requests | grep -c . || true; }

# The docx with an external image (relationship TargetMode="External"), built by Node in the
# listener image (stored ZIP).
make_docx() { # URL OUTFILE
    # shellcheck disable=SC2016 # JavaScript
    "${DOCKER[@]}" run --rm --network none --entrypoint node "$listener_image" -e '
const { crc32 } = require("node:zlib");
const url = process.argv[1], ns = "http://schemas.openxmlformats.org";
const files = [
  ["[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="${ns}/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`],
  ["_rels/.rels", `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="${ns}/package/2006/relationships"><Relationship Id="rId1" Type="${ns}/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`],
  ["word/_rels/document.xml.rels", `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="${ns}/package/2006/relationships"><Relationship Id="rId9" Type="${ns}/officeDocument/2006/relationships/image" Target="${url}" TargetMode="External"/></Relationships>`],
  ["word/document.xml", `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="${ns}/wordprocessingml/2006/main" xmlns:r="${ns}/officeDocument/2006/relationships" xmlns:wp="${ns}/drawingml/2006/wordprocessingDrawing" xmlns:a="${ns}/drawingml/2006/main" xmlns:pic="${ns}/drawingml/2006/picture"><w:body><w:p><w:r><w:t>linked image</w:t></w:r><w:r><w:drawing><wp:inline><wp:extent cx="914400" cy="914400"/><wp:docPr id="1" name="i"/><a:graphic><a:graphicData uri="${ns}/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="1" name="i"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:link="rId9"/></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="914400" cy="914400"/></a:xfrm><a:prstGeom prst="rect"/></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p></w:body></w:document>`],
];
const parts = [], central = []; let off = 0;
for (const [n, t] of files) {
  const nb = Buffer.from(n), d = Buffer.from(t), c = crc32(d);
  const l = Buffer.alloc(30); l.writeUInt32LE(0x04034b50, 0); l.writeUInt16LE(20, 4); l.writeUInt32LE(c, 14);
  l.writeUInt32LE(d.length, 18); l.writeUInt32LE(d.length, 22); l.writeUInt16LE(nb.length, 26);
  const h = Buffer.alloc(46); h.writeUInt32LE(0x02014b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(20, 6);
  h.writeUInt32LE(c, 16); h.writeUInt32LE(d.length, 20); h.writeUInt32LE(d.length, 24); h.writeUInt16LE(nb.length, 28); h.writeUInt32LE(off, 42);
  parts.push(l, nb, d); central.push(h, nb); off += 30 + nb.length + d.length;
}
const cd = Buffer.concat(central), e = Buffer.alloc(22);
e.writeUInt32LE(0x06054b50, 0); e.writeUInt16LE(files.length, 8); e.writeUInt16LE(files.length, 10);
e.writeUInt32LE(cd.length, 12); e.writeUInt32LE(off, 16);
process.stdout.write(Buffer.concat([...parts, cd, e]));' "$1" >"$2"
}

# The input tar: the flat ODF samples and the link documents, which point at the listener by
# name and by ADDRESS; each URL path names the document type and the target.
client_input() { # ADDRESS
    local d host tag
    d="$(mktemp -d)"
    cp "$HERE"/conversion-samples/sample.fodt "$HERE"/conversion-samples/sample.fodp "$HERE"/conversion-samples/sample.fods "$d/"
    for host in "$PEER" "$1"; do
        if [ "$host" = "$PEER" ]; then tag=name; else tag=addr; fi
        local u="http://$host:8090"
        printf '<html><head><link rel="stylesheet" href="%s/html-css-%s"></head><body><p>linked</p><img src="%s/html-img-%s"><iframe src="%s/html-iframe-%s"></iframe></body></html>\n' \
            "$u" "$tag" "$u" "$tag" "$u" "$tag" >"$d/link-$tag.html"
        sed -e "s#LINK_IMAGE#$u/fodt-img-$tag#" -e "s#LINK_SECTION#$u/fodt-section-$tag#" \
            "$HERE/conversion-samples/link.fodt" >"$d/link-$tag.fodt"
        make_docx "$u/docx-img-$tag" "$d/link-$tag.docx"
    done
    tar -C "$d" -c .
    rm -rf "$d"
}

# network_verdict CONTAINER: attached to one internal network only, no published port.
network_verdict() {
    local nets internal ports
    # shellcheck disable=SC2016 # a Go template
    nets="$("${DOCKER[@]}" inspect -f '{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}' "$1")"
    ports="$("${DOCKER[@]}" port "$1" 2>/dev/null | wc -l)"
    # shellcheck disable=SC2086 # one word per network
    set -- $nets
    if [ "$#" -ne 1 ]; then step network FAIL "attached to: $nets"; return 0; fi
    internal="$("${DOCKER[@]}" network inspect -f '{{.Internal}}' "$1")"
    if [ "$internal" = true ] && [ "$ports" -eq 0 ]; then
        step network OK "attached to $1 only (internal), no published port"
    else
        step network FAIL "network $1 internal=$internal, published ports: $ports"
    fi
}

# wait_ready CONTAINER NETWORK: the service answers GET / within 180 s.
wait_ready() {
    for _ in $(seq 90); do
        if "${DOCKER[@]}" run --rm --network "$2" --entrypoint curl "$client_image" -fsS -o /dev/null --max-time 3 "http://$1:9980/" 2>/dev/null; then
            step "ready-$1" OK "GET http://$1:9980/ answers"
            return 0
        fi
        sleep 2
    done
    step "ready-$1" FAIL "no answer within 180 s"
    "${DOCKER[@]}" logs "$1" 2>&1 | tail -n 20
    finish
}

# The service's run options from the compose file: image, environment, tmpfs, capabilities,
# read-only root (one option per line).
if [ -n "$stack_cmd" ]; then
    read -r -a COMPOSE <<<"$stack_cmd"
    compose_json="$("${COMPOSE[@]}" config --format json 2>/dev/null)" \
        || { echo "conversion-check.sh: '$stack_cmd config' failed" >&2; exit 2; }
elif [ -n "$compose_json_file" ]; then
    compose_json="$(cat "$compose_json_file")"
else
    # The file goes in on stdin, so that an engine CLI in another container (dind.sh) reads it.
    compose_json="$("${DOCKER[@]}" compose -p conversion-check --project-directory /tmp -f - \
        config --format json <"$REPO/docker-compose.yml" 2>/dev/null)" \
        || { echo "conversion-check.sh: '$docker_cmd compose config' failed (needs Docker Compose)" >&2; exit 2; }
fi
# shellcheck disable=SC2016 # JavaScript
mapfile -t svc_opts < <(printf '%s' "$compose_json" | "${DOCKER[@]}" run --rm -i --network none --entrypoint node "$listener_image" -e '
let s = ""; process.stdin.on("data", (c) => { s += c; }).on("end", () => {
  const c = JSON.parse(s).services.conversion;
  const o = [];
  if (c.read_only) o.push("--read-only");
  for (const t of c.tmpfs || []) o.push("--tmpfs", t);
  for (const x of c.cap_drop || []) o.push("--cap-drop", x);
  for (const x of c.cap_add || []) o.push("--cap-add", x);
  for (const [k, v] of Object.entries(c.environment || {})) o.push("-e", `${k}=${v}`);
  o.push(c.image);
  console.log(o.join("\n"));
});')
[ "${#svc_opts[@]}" -ge 2 ] || { echo "conversion-check.sh: no conversion service in docker-compose.yml" >&2; exit 2; }
# The control instance: the same options, extra_params without the net.* settings.
ctl_opts=()
for o in "${svc_opts[@]}"; do
    case "$o" in
        extra_params=*) o="$(printf '%s' "$o" | tr ' ' '\n' | grep -v -- '^--o:net\.' | paste -sd ' ')" ;;
    esac
    ctl_opts+=("$o")
done
step compose-service OK "$(printf '%s ' "${svc_opts[@]}")"

if [ -n "$stack_cmd" ]; then
    # shellcheck disable=SC2016 # expanded in the container
    url="$("${COMPOSE[@]}" exec -T bbb-web bash -c 'printf %s "$BBB_WEB_CONVERSION_URL"')"
    if [ -z "$url" ]; then step stack-url FAIL "BBB_WEB_CONVERSION_URL is empty in bbb-web"; finish; fi
    step stack-url OK "bbb-web: BBB_WEB_CONVERSION_URL=$url"
    svc_id="$("${COMPOSE[@]}" ps -q conversion)"
    # shellcheck disable=SC2016 # a Go template
    net="$("${DOCKER[@]}" inspect -f '{{range $k, $v := .NetworkSettings.Networks}}{{$k}}{{end}}' "$svc_id")"
    client() { "${COMPOSE[@]}" exec -T bbb-web bash -c "$1" bash "${@:2}"; }
else
    own_net="conversion-check-$$"
    net="$own_net"
    "${DOCKER[@]}" network create --internal "$net" >/dev/null
    "${DOCKER[@]}" run -d --name "$SVC" --network "$net" "${svc_opts[@]}" >/dev/null
    svc_id="$SVC"
    url="http://$SVC:9980/cool/convert-to"
    wait_ready "$SVC" "$net"
    client() { "${DOCKER[@]}" run --rm -i --network "$net" --entrypoint bash "$client_image" -c "$1" bash "${@:2}"; }
fi
start_listener "$net"
addr="$("${DOCKER[@]}" inspect -f "{{(index .NetworkSettings.Networks \"$net\").IPAddress}}" "$PEER")"
input="$(mktemp)"
trap 'cleanup; rm -f "$input"' EXIT
client_input "$addr" >"$input"

record < <(client "$CLIENT" "$url" <"$input")

# Positive control 1: the listener counts a request (the client's own).
before="$(count)"
# shellcheck disable=SC2016 # expanded in the container
client 'curl -sS -o /dev/null --max-time 10 "http://$1:8090/positive-control"' "$PEER" </dev/null >/dev/null 2>&1 || true
sleep 1
if [ "$(count)" -gt "$before" ]; then step control-listener OK "the client's request reached the listener ($PEER, $addr)"
else step control-listener FAIL "the listener counted no request"; fi

# The service: the link documents convert and cause no request.
before="$(count)"
record < <(client "$LINKS" "$url" linked <"$input")
sleep 3
after="$(count)"
if [ "$after" -eq "$before" ]; then step no-link-fetch OK "0 requests from the service for $(tar -tf "$input" | grep -c link-) link documents"
else step no-link-fetch FAIL "$((after - before)) requests: $(requests | tail -n "$((after - before))" | tr '\n' ';')"; fi

# Positive control 2: an instance with Collabora's default net settings fetches.
"${DOCKER[@]}" run -d --name "$CTL" --network "$net" "${ctl_opts[@]}" >/dev/null
wait_ready "$CTL" "$net"
before="$(count)"
record < <(client "$LINKS" "http://$CTL:9980/cool/convert-to" control <"$input")
sleep 3
after="$(count)"
if [ "$after" -gt "$before" ]; then
    step control-fetch OK "$((after - before)) requests from the default-settings instance: $(requests | tail -n "$((after - before))" | awk '{print $2, $3}' | sort -u | tr '\n' ';')"
else
    step control-fetch FAIL "the default-settings instance fetched nothing either: the link documents test nothing"
fi
"${DOCKER[@]}" rm -f "$CTL" >/dev/null 2>&1 || true

network_verdict "$svc_id"
finish
