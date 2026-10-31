#!/bin/bash
# Stands in for bbb-libreoffice-docker's convert.sh (convert-local.sh),
# which runs LibreOffice in a throwaway bbb-soffice container through sudo
# docker, with 1 GB of memory and no network. A container can't start one,
# so this runs the same LibreOffice build, copied from that image, in
# bbb-web's container, without those limits. The same arguments:
#   convert.sh <input> <output> [format, default pdf] [timeout in s, default 60]
set -e
set -u
PATH="/bin/:/usr/bin/"

if (( $# == 0 )); then
	echo "Missing parameter 1 (Input office file path)";
	exit 1
elif (( $# == 1 )); then
	echo "Missing parameter 2 (Output pdf file path)";
	exit 1
fi;

# Each call gets its own directory, and its own LibreOffice profile in it:
# conversions running at once would fail on a shared one.
mkdir -p "/tmp/bbb-soffice-$(whoami)/"
tempDir="$(mktemp -d -p /tmp/bbb-soffice-$(whoami)/)"
trap 'rm -fr "$tempDir"' EXIT

source="$1"
dest="$2"
convertTo="${3:-pdf}"
convertToParam="--convert-to $convertTo"
timeoutSecs="${4:-60}"
timeoutSecs="${timeoutSecs:0:3}"
if [ ${1: -5} == ".html" ]
then
	convertToParam="$convertToParam --writer"
fi

soffice=$(echo /opt/libreoffice*/program/soffice)
cp "${source}" "$tempDir/file"
cd "$tempDir"
HOME="$tempDir" timeout "$(printf %03d $timeoutSecs)s" "$soffice" -env:UserInstallation="file://$tempDir/profile" \
	$convertToParam --outdir "$tempDir" "$tempDir/file"
cp "$tempDir/file.$convertTo" "${dest}"
