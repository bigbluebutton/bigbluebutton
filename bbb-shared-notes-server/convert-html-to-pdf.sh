#!/bin/bash
set -e
set -u
PATH="/bin/:/usr/bin/"

# Conversion of HTML to PDF using Docker Chrome headless
# Similar to BigBlueButton's office file conversion script

# This script receives three params
# Param 1: Input HTML file path (e.g. "/tmp/document.html")
# Param 2: Output PDF file path (e.g. "/tmp/document.pdf")
# Param 3: Timeout (secs) (optional, default: 30)

if (( $# == 0 )); then
	echo "Missing parameter 1 (Input HTML file path)";
	exit 1
elif (( $# == 1 )); then
	echo "Missing parameter 2 (Output PDF file path)";
	exit 1
fi;

# Create tmp dir for conversion
mkdir -p "/tmp/bbb-chrome-$(whoami)/"
tempDir="$(mktemp -d -p /tmp/bbb-chrome-$(whoami)/)"
trap 'rm -fr "$tempDir"' EXIT

source="$1"
dest="$2"

# If timeout is missing, define 30 seconds
timeoutSecs="${3:-30}"
# Truncate timeout to max 3 digits
timeoutSecs="${timeoutSecs:0:3}"

# Copy input HTML to temp directory
cp "${source}" "$tempDir/input.html"

# Run Chrome headless in Docker container
# - Ephemeral container (--rm)
# - Memory limited to 1GB
# - No network access for security
# - Volume mount for input/output
# - Chrome runs with headless mode and prints to PDF
# Note: zenika/alpine-chrome already has chromium-browser as entrypoint
timeout $(printf %03d $timeoutSecs)s sudo /usr/bin/docker run \
  --rm \
  --memory=1g \
  --memory-swap=1g \
  --network none \
  --user=$(printf %05d `id -u`) \
  -e HOME=/tmp \
  -e XDG_RUNTIME_DIR=/tmp/runtime \
  --tmpfs /tmp:rw,exec,nosuid,size=256m \
  --tmpfs /tmp/runtime:rw,exec,nosuid,size=64m \
  -v "$tempDir/":/workspace/ \
  --security-opt seccomp=unconfined \
  --entrypoint /usr/bin/chromium-browser \
  zenika/alpine-chrome \
    --headless=new \
    --user-data-dir=/tmp/chrome-data \
    --no-pdf-header-footer \
    --run-all-compositor-stages-before-draw \
    --disable-dev-shm-usage \
    --no-sandbox \
    --disable-setuid-sandbox \
    --no-first-run \
    --no-default-browser-check \
    --disable-breakpad \
    --disable-gpu \
    --disable-software-rasterizer \
    --disable-extensions \
    --print-to-pdf=/workspace/output.pdf \
    file:///workspace/input.html

# Copy result back to destination
cp "$tempDir/output.pdf" "${dest}"
