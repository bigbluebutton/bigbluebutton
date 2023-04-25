#!/bin/bash -e

BIGBLUEBUTTON_USER=bigbluebutton

case "$1" in
  configure|upgrade|1|2)

    if id $BIGBLUEBUTTON_USER > /dev/null 2>&1 ; then
      chown $BIGBLUEBUTTON_USER:$BIGBLUEBUTTON_USER /var/lib/bbb-webrtc-recorder
      chmod 0700 /var/lib/bbb-webrtc-recorder
    fi

    systemctl enable bbb-webrtc-recorder
  ;;

  *)
    echo "## postinst called with unknown argument \`$1'" >&2
  ;;
esac

systemctl daemon-reload
