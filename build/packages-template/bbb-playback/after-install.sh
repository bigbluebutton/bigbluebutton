#!/bin/bash -e

BIGBLUEBUTTON_USER=bigbluebutton

case "$1" in
  configure|upgrade|1|2)

    BBB_PLAYBACK_VERSION=2.3
    BBB_PLAYBACK_HOMEPAGE=playback/presentation
    BBB_PLAYBACK_BASE=/var/bigbluebutton/$BBB_PLAYBACK_HOMEPAGE
    BBB_PLAYBACK=$BBB_PLAYBACK_BASE/$BBB_PLAYBACK_VERSION
    chown -R $BIGBLUEBUTTON_USER:$BIGBLUEBUTTON_USER $BBB_PLAYBACK

    reloadService nginx

  ;;

  failed-upgrade)
  ;;

  *)
    echo "## postinst called with unknown argument \`$1'" >&2
  ;;
esac
