#!/bin/bash
set -e
set -u
PATH="/bin/:/usr/bin/"

# Conversion of office files to Pdf using local docker bbb-soffice

# This script receives three params
# Param 1: Input office file path (e.g. "/tmp/test.odt")
# Param 2: Output pdf file path (e.g. "/tmp/test.pdf")
# Param 3: Output format (pdf default)
# Param 4: Timeout (secs) (optional)

if (( $# == 0 )); then
	echo "Missing parameter 1 (Input office file path)";
	exit 1
elif (( $# == 1 )); then
	echo "Missing parameter 2 (Output pdf file path)";
	exit 1
fi;


#Create tmp dir for conversion
mkdir -p "/tmp/bbb-soffice-$(whoami)/"
tempDir="$(mktemp -d -p /tmp/bbb-soffice-$(whoami)/)"
trap 'rm -fr "$tempDir"' EXIT

source="$1"
dest="$2"

#If output format is missing, define PDF
convertTo="${3:-pdf}"
convertToParam="--convert-to $convertTo"

#If timeout is missing, define 60
timeoutSecs="${4:-60}"
#Truncate timeout to max 3 digits (as expected by sudoers)
timeoutSecs="${timeoutSecs:0:3}"

#If output is html, include param --writer to avoid blank page
if [ ${1: -5} == ".html" ]
then
	convertToParam="$convertToParam --writer"
fi

cp "${source}" "$tempDir/file"
sudo /usr/bin/docker run --rm --memory=1g --memory-swap=1g --network none --env="HOME=/tmp/" -w /tmp/ --user=$(printf %05d `id -u`) -v "$tempDir/":/data/ -v /usr/share/fonts/:/usr/share/fonts/:ro --rm bbb-soffice sh -c "timeout $(printf %03d $timeoutSecs)s /usr/bin/soffice -env:UserInstallation=file:///tmp/ $convertToParam --outdir /data /data/file"
cp "$tempDir/file.$convertTo" "${dest}"
