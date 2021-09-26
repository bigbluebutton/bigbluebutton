#!/bin/bash -e

BBB_USER=bigbluebutton

case "$1" in
  configure|upgrade|1|2)
    
    SOURCE=/tmp/podcast.yml
    TARGET=/usr/local/bigbluebutton/core/scripts/podcast.yml

    if [ -f $SOURCE.keep ]; then
      propagate_keep_file $TARGET
    elif [ -f $SOURCE ]; then
      #
      # upgrade, so let's propagate values
      VARS=$(cat $SOURCE | grep : | grep -v \# | sed -e "s/ //g" -e "s/:.*/ /g" | tr -d '\n')
      for v in $VARS ; do
        old_val=$(cat $SOURCE | tr -d '\r' | sed -n "/^${v}[# ]*:[ ]*/{s/${v}[ ]*:[ ]*//;p}" )
        change_yml_value $TARGET $v $old_val
      done
    else
      #
      # New install 
      if [ -f $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties ]; then
        HOST=$(cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties | sed -n '/^bigbluebutton.web.serverURL/{s/.*\///;p}')
      else
        HOST=$IP
      fi
      
      if [ -f $TARGET ]; then
        change_yml_value $TARGET playback_host $HOST
      else
        echo "No: $TARGET"
        exit 1
      fi
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

