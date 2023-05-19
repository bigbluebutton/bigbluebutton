#!/bin/bash -e

case "$1" in
  configure|upgrade|1|2)
    TARGET=/usr/local/bigbluebutton/bbb-transcription-controller/config/default.yml
    cp /usr/local/bigbluebutton/bbb-transcription-controller/config/default.example.yml $TARGET

    startService bbb-transcription-controller|| echo "bbb-transcription-controller could not be registered or started"
  ;;

  abort-upgrade|abort-remove|abort-deconfigure)
  ;;

  *)
    echo "postinst called with unknown argument \`$1'" >&2
    exit 1
  ;;
esac
