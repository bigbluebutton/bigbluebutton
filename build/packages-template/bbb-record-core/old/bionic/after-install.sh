#!/bin/bash -e

BBB_USER=bigbluebutton

case "$1" in
  configure|upgrade|1|2)
    
    SOURCE=/tmp/bigbluebutton.yml
    TARGET=/usr/local/bigbluebutton/core/scripts/bigbluebutton.yml

    if [ -f /usr/local/bigbluebutton/core/lib/recordandplayback.rb ]; then
      sed -i "s/require 'recordandplayback\/webrtc_deskshare_archiver/#require 'recordandplayback\/webrtc_deskshare_archiver/g" /usr/local/bigbluebutton/core/lib/recordandplayback.rb
    fi

    if [ -f /etc/ImageMagick-6/policy.xml ]; then
      sed -i 's/<policy domain="coder" rights="none" pattern="PDF" \/>/<policy domain="coder" rights="write" pattern="PDF" \/>/g' /etc/ImageMagick-6/policy.xml
    fi

    if [ -f $SOURCE ]; then
      #
      # upgrade, so let's propagate values

      TMP=$(mktemp)
      yq m -x $TARGET $SOURCE > $TMP
      cat $TMP > $TARGET

      mv -f $SOURCE "${SOURCE}_"
    else
      #
      # New install 
      if [ -f $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties ]; then
        HOST=$(cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties | sed -n '/^bigbluebutton.web.serverURL/{s/.*\///;p}')
      else
        HOST=$IP
      fi

      yq w -i $TARGET playback_host "$HOST"
    fi

    chmod +r $TARGET

    if ! gem -v | grep -q ^3.; then 
      gem update --system --no-document
      gem install bundler --no-document
    fi
    
    if hash gem 2>&-; then
      cd /usr/local/bigbluebutton/core
      
      GEMS="builder bundler"
      for gem in $GEMS; do
        if ! gem list $gem | grep -q $gem; then
          gem install $gem
        fi
      done
      /usr/local/bin/bundle
    else
      echo "## Could not find gem ##"
      exit 1
    fi
    
    # Run recording link fixup/upgrade script
    # Don't abort on failure; users can manually run it later, too
    if id $BBB_USER > /dev/null 2>&1 ; then
      mkdir -p /var/bigbluebutton/recording/status
      chown $BBB_USER:$BBB_USER /var/bigbluebutton/recording/status

      mkdir -p /var/bigbluebutton/recording
      mkdir -p /var/bigbluebutton/recording/raw
      mkdir -p /var/bigbluebutton/recording/process
      mkdir -p /var/bigbluebutton/recording/publish
      mkdir -p /var/bigbluebutton/recording/status/recorded
      mkdir -p /var/bigbluebutton/recording/status/archived
      mkdir -p /var/bigbluebutton/recording/status/processed
      mkdir -p /var/bigbluebutton/recording/status/sanity
      mkdir -p /var/bigbluebutton/recording/status/ended
      chown -R $BBB_USER:$BBB_USER /var/bigbluebutton/recording

      mkdir -p /var/bigbluebutton/captions
      chown -R $BBB_USER:$BBB_USER /var/bigbluebutton/captions

      mkdir -p /var/bigbluebutton/published
      chown $BBB_USER:$BBB_USER /var/bigbluebutton/published

      mkdir -p /var/bigbluebutton/deleted
      chown $BBB_USER:$BBB_USER /var/bigbluebutton/deleted

      mkdir -p /var/bigbluebutton/unpublished
      chown $BBB_USER:$BBB_USER /var/bigbluebutton/unpublished

      mkdir -p /var/bigbluebutton/basic_stats
      chown $BBB_USER:$BBB_USER /var/bigbluebutton/basic_stats

      chown -R $BBB_USER:$BBB_USER /var/log/bigbluebutton
      chmod 755 /var/log/bigbluebutton

      if [ -f /var/log/bigbluebutton/bbb-rap-worker.log ]; then
        chown $BBB_USER:$BBB_USER /var/log/bigbluebutton/bbb-rap-worker.log
      fi

      if [ -f /var/log/bigbluebutton/sanity.log ]; then
        chown $BBB_USER:$BBB_USER /var/log/bigbluebutton/sanity.log
      fi
      if [ -f /var/log/bigbluebutton/post_process.log ]; then
        chown $BBB_USER:$BBB_USER /var/log/bigbluebutton/post_process.log
      fi
      if [ -f /var/log/bigbluebutton/bbb-recording-cleanup.log ]; then
        chown $BBB_USER:$BBB_USER /var/log/bigbluebutton/bbb-recording-cleanup.log
      fi
    fi

    if id freeswitch >/dev/null 2>&1; then
      chown -R freeswitch:freeswitch /var/freeswitch/meetings
    else
      echo "Error: FreeSWITCH not installed"
    fi

    
  ;;
  
  *)
    echo "## postinst called with unknown argument \`$1'" >&2
  ;;
esac

if dpkg -l | grep -q nginx; then
  reloadService nginx
fi

startService bbb-rap-resque-worker.service || echo "bbb-rap-resque-worker.service could not be registered or started"
startService bbb-rap-starter.service || echo "bbb-rap-starter.service could not be registered or started"

