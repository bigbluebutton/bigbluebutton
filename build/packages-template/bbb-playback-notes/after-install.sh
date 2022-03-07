#!/bin/bash -e
BIGBLUEBUTTON_USER=bigbluebutton

case "$1" in
  configure|upgrade|1|2)

    TARGET=/usr/local/bigbluebutton/core/scripts/notes.yml

    chmod +r $TARGET
 
    mkdir -p /var/bigbluebutton/published/notes
    chown -R $BIGBLUEBUTTON_USER:$BIGBLUEBUTTON_USER /var/bigbluebutton/published/notes
    chmod -R o+rx /var/bigbluebutton/published/
    
    mkdir -p /var/log/bigbluebutton/notes
    chown -R $BIGBLUEBUTTON_USER:$BIGBLUEBUTTON_USER /var/log/bigbluebutton/notes
    
    mkdir -p /var/bigbluebutton/recording/publish/notes
    chown -R $BIGBLUEBUTTON_USER:$BIGBLUEBUTTON_USER /var/bigbluebutton/recording/publish/notes
    
    if [ -f /var/bigbluebutton/published/notes/index.html ]; then
      rm /var/bigbluebutton/published/notes/index.html
    fi
    
    systemctl reload nginx
  ;;
  
  failed-upgrade)
  ;;

  *)
    echo "## postinst called with unknown argument \`$1'" >&2
  ;;
esac

