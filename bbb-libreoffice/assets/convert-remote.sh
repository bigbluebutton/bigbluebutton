#!/bin/bash
set -e
set -u
PATH="/bin/:/usr/bin/"

# This is a sample script - adjust it per your need
# 1 - setup a server with JOD-CONVERTER-REST ( docker run --memory 512m --rm -p 8080:8080 eugenmayer/jodconverter:rest )
# 2 - replace the HOST information in below command with your server host

# This script receives three params
# Param 1: Input office file path (e.g. "/tmp/test.odt")
# Param 2: Output pdf file path (e.g. "/tmp/test.pdf")
# Param 3: Destination Format (pdf default)

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

curl -X POST "http://127.0.0.1:8080/lool/convert-to/$convertTo" -H "accept: application/octet-stream" -H "Content-Type: multipart/form-data" -F "data=@${source}" > "${dest}"

exit 0
