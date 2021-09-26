#!/bin/bash -e

if [ -f /etc/redhat-release ]; then
  DISTRIB_ID=centos
else
  . /etc/lsb-release    # Get value for DISTRIB_ID
fi

BIGBLUEBUTTON_USER=bigbluebutton

case "$1" in
  configure|upgrade|1|2)
    
    SOURCE=/tmp/notes.yml
    TARGET=/usr/local/bigbluebutton/core/scripts/notes.yml

    if [ -f $SOURCE ]; then
      #
      # upgrade, so let's propagate values

      TMP=$(mktemp)
      yq m -x $TARGET $SOURCE > $TMP
      cat $TMP > $TARGET

      mv -f $SOURCE "${SOURCE}_"
    fi
   
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

