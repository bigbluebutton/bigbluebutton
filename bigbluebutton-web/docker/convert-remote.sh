#!/bin/bash
set -e
set -u
PATH="/bin/:/usr/bin/"

# Office conversion through the HTTP conversion service (no Docker socket needed), for
# presOfficeConversionExec.
# Container variant of bbb-libreoffice/assets/convert-remote.sh: the endpoint comes from
# BBB_WEB_CONVERSION_URL (validated by the entrypoint) instead of a hard-coded host; the
# target format is appended as the last path segment, as in upstream's sample.
# The entrypoint selects this script only when BBB_WEB_CONVERSION_URL is set.

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

#If output format is missing, define PDF
convertTo="${3:-pdf}"

# If timeout is missing, define 60
timeoutSecs="${4:-60}"

if ! curl --silent --show-error --fail --max-time "$timeoutSecs" -X POST \
	-H "accept: application/octet-stream" -F "data=@${source}" \
	-o "${dest}" "${BBB_WEB_CONVERSION_URL%/}/${convertTo}"; then
	# bbb-web treats an existing output file as success
	rm -f "${dest}"
	exit 1
fi

exit 0
