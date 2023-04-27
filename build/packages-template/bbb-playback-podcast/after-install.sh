#!/bin/bash -e

BBB_USER=bigbluebutton

case "$1" in
  configure|upgrade|1|2)
    
  TARGET=/usr/local/bigbluebutton/core/scripts/podcast.yml

  if [ -f $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties ]; then
    HOST=$(cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties | sed -n '/^bigbluebutton.web.serverURL/{s/.*\///;p}')
  else
    HOST=$IP
  fi

  if [ -f $TARGET ]; then
    yq e -i ".playback_host = \"$HOST\"" $TARGET
  else
    echo "No: $TARGET"
    exit 1
  fi
    
    mkdir -p /var/bigbluebutton/published/podcast
    chown -R $BBB_USER:$BBB_USER /var/bigbluebutton/published/podcast
    chmod -R o+rx /var/bigbluebutton/published/
    
    mkdir -p /var/log/bigbluebutton/podcast
    chown -R $BBB_USER:$BBB_USER /var/log/bigbluebutton/podcast
    
    mkdir -p /var/bigbluebutton/recording/publish/podcast
    chown -R $BBB_USER:$BBB_USER /var/bigbluebutton/recording/publish/podcast
    
    if [ -f /var/bigbluebutton/published/podcast/index.html ]; then
      rm /var/bigbluebutton/published/podcast/index.html
    fi
    
  ;;
  
  failed-upgrade)
  ;;

  *)
    echo "## postinst called with unknown argument \`$1'" >&2
  ;;
esac

