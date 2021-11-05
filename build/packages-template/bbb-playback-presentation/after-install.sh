#!/bin/bash -e

if [ -f /etc/redhat-release ]; then
  DISTRIB_ID=centos
else
  . /etc/lsb-release    # Get value for DISTRIB_ID
fi

BIGBLUEBUTTON_USER=bigbluebutton

case "$1" in
  configure|upgrade|1|2)
    
    SOURCE=/tmp/presentation.yml
    TARGET=/usr/local/bigbluebutton/core/scripts/presentation.yml

    if [ -f $SOURCE ]; then
      #
      # upgrade, so let's propagate values

      TMP=$(mktemp)
      yq m -x $TARGET $SOURCE > $TMP
      cat $TMP > $TARGET

      mv -f $SOURCE "${SOURCE}_"
    fi

    chmod +r $TARGET
    
    mkdir -p /var/bigbluebutton/published/presentation
    chown -R $BIGBLUEBUTTON_USER:$BIGBLUEBUTTON_USER /var/bigbluebutton/published/presentation
    chmod -R o+rx /var/bigbluebutton/published/
    
    mkdir -p /var/log/bigbluebutton/presentation
    chown -R $BIGBLUEBUTTON_USER:$BIGBLUEBUTTON_USER /var/log/bigbluebutton/presentation
    
    mkdir -p /var/bigbluebutton/recording/publish/presentation
    chown -R $BIGBLUEBUTTON_USER:$BIGBLUEBUTTON_USER /var/bigbluebutton/recording/publish/presentation
    
    if [ -f /var/bigbluebutton/published/presentation/index.html ]; then
      rm /var/bigbluebutton/published/presentation/index.html
    fi
    
  ;;
  
  failed-upgrade)
  ;;

  *)
    echo "## postinst called with unknown argument \`$1'" >&2
  ;;
esac

