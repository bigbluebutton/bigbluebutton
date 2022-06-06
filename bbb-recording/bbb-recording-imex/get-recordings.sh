#!/bin/bash
while getopts i:r:s:m: flag
do
   case "${flag}" in
      i) MEETING_ID=${OPTARG};;
      r) RECORD_ID=${OPTARG};;
      s) STATE=${OPTARG};;
      m) META=${OPTARG};;
   esac
done

BASE_URL=""
SUBDIRECTORY="bigbluebutton/api/"
ENDPOINT="getRecordings"
QUERY=""

if ! [[ -z ${MEETING_ID+x} ]]; then QUERY+="meetingID=$MEETING_ID&"; fi
if ! [[ -z ${RECORD_ID+x} ]]; then QUERY+="recordID=$RECORD_ID&"; fi
if ! [[ -z ${STATE+x} ]]; then QUERY+="state=$STATE&"; fi
if ! [[ -z ${META+x} ]]; then QUERY+="meta=$META"; fi

echo "query: $QUERY"

INDEX=${#QUERY}-1
if [ "${QUERY:$INDEX:1}" = "&" ]; then QUERY=${QUERY:0:$INDEX}; fi

echo "query: $QUERY"

SALT=""
DATA="$ENDPOINT$QUERY$SALT"

echo "data: $DATA"

CHECKSUM=$(echo -n $DATA | sha256sum)
CHECKSUM=${CHECKSUM:0:64}

echo "sha256 checksum: $CHECKSUM"

QUERY="?$QUERY"

if ! [[ ${#QUERY} -eq 1 ]]; then QUERY+="&"; fi

QUERY+="checksum=$CHECKSUM"

echo "query: $QUERY"

REQUEST="$BASE_URL$SUBDIRECTORY$ENDPOINT$QUERY"
echo "request: $REQUEST"

curl -s -X GET "$REQUEST"
