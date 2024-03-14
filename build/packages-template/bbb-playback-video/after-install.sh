#!/bin/bash -e

if [ -f /etc/redhat-release ]; then
  DISTRIB_ID=centos
else
  . /etc/lsb-release    # Get value for DISTRIB_ID
fi

BIGBLUEBUTTON_USER=bigbluebutton

case "$1" in
  configure|upgrade|1|2)
    
    TARGET=/usr/local/bigbluebutton/core/scripts/video.yml

    chmod +r $TARGET
    
    mkdir -p /var/bigbluebutton/published/video
    chown -R $BIGBLUEBUTTON_USER:$BIGBLUEBUTTON_USER /var/bigbluebutton/published/video
    chmod -R o+rx /var/bigbluebutton/published/
    
    mkdir -p /var/log/bigbluebutton/video
    chown -R $BIGBLUEBUTTON_USER:$BIGBLUEBUTTON_USER /var/log/bigbluebutton/video
    
    mkdir -p /var/bigbluebutton/recording/publish/video
    chown -R $BIGBLUEBUTTON_USER:$BIGBLUEBUTTON_USER /var/bigbluebutton/recording/publish/video
    
    if [ -f /var/bigbluebutton/published/video/index.html ]; then
      rm /var/bigbluebutton/published/video/index.html
    fi
    
    reloadService nginx
  ;;
  
  failed-upgrade)
  ;;

  *)
    echo "## postinst called with unknown argument \`$1'" >&2
  ;;
esac

