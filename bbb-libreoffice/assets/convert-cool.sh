#!/bin/bash
set -e
set -u
PATH="/bin/:/usr/bin/"

# This is a sample script - adjust it per your need, to use Collabora online.
# 1 - setup a server with Collabora Online (CODE)
#   You can run it with
#      docker run -t -d -p 127.0.0.1:9980:9980 -e "domain=<your-dot-escaped-domain>" \
#         -e "username=admin" -e "password=S3cRet" --restart always collabora/code
#   See https://sdk.collaboraonline.com/docs/installation/CODE_Docker_image.html
#   Or you can use an existing setup you have.
# 2 - replace the HOST information below with your server host, or set COOL_URL
#   (e.g. http://office-conversion:9980) in the environment

HOST=127.0.0.1
COOL_URL="${COOL_URL:-https://$HOST:9980}"

# Set this to "-k" to allow it to work in a test environment, ie with a self signed
# certificate
UNSECURE=

# This script receives three params
# Param 1: Input office file path (e.g. "/tmp/test.odt")
# Param 2: Output pdf file path (e.g. "/tmp/test.pdf")
# Param 3: Destination Format (pdf default)
# Param 4: Timeout (secs) (optional)

if (( $# == 0 )); then
	echo "Missing parameter 1 (Input office file path)";
	exit 1
elif (( $# == 1 )); then
	echo "Missing parameter 2 (Output pdf file path)";
	exit 1
fi;


source="$1"
dest="$2"

# If output format is missing, define PDF
convertTo="${3:-pdf}"

# If timeout is missing, define 60
timeoutSecs="${4:-60}"
# Truncate timeout to max 3 digits (as expected by sudoers)
timeoutSecs="${timeoutSecs:0:3}"

# The timeout is important.

# The PDF becomes the output file only when the conversion succeeded.
tmp="${dest}.part"
trap 'rm -f "${tmp}"' EXIT
timeout $(printf %03d $timeoutSecs)s curl -fsS $UNSECURE -F "data=@${source}" -o "${tmp}" "${COOL_URL}/cool/convert-to/$convertTo"
mv "${tmp}" "${dest}"

exit 0
