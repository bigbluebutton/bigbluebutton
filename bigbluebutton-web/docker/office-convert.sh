#!/bin/bash
set -e
set -u
PATH="/bin/:/usr/bin/"

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

timeout $(printf %03d $timeoutSecs)s curl -F "data=@${source}" -k https://collabora:9980/cool/convert-to/$convertTo > "${dest}"

exit 0