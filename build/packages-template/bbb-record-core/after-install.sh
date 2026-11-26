#!/bin/bash -e

BBB_USER=bigbluebutton

case "$1" in
  configure|upgrade|1|2)
    
    TARGET=/usr/local/bigbluebutton/core/scripts/bigbluebutton.yml

    if [ -f /usr/local/bigbluebutton/core/lib/recordandplayback.rb ]; then
      sed -i "s/require 'recordandplayback\/webrtc_deskshare_archiver/#require 'recordandplayback\/webrtc_deskshare_archiver/g" /usr/local/bigbluebutton/core/lib/recordandplayback.rb
    fi

  if [ -f /etc/ImageMagick-6/policy.xml ]; then
    sed -i 's/<policy domain="coder" rights="none" pattern="PDF" \/>/<policy domain="coder" rights="write" pattern="PDF" \/>/g' /etc/ImageMagick-6/policy.xml
  fi

    # The host of bbb-web as it runs: the serverURL in /etc/bigbluebutton/bbb-web.properties
    # (written by bbb-conf --setip) wins over the shipped default. bigbluebutton.yml is replaced
    # on every upgrade, so reading only the shipped default reset playback_host.
    HOST=""
    for PROPERTIES in /etc/bigbluebutton/bbb-web.properties $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties; do
      if [ -z "$HOST" ] && [ -f $PROPERTIES ]; then
        HOST=$(sed -n '/^bigbluebutton.web.serverURL/{s/.*\///;p}' $PROPERTIES | tail -n 1)
      fi
    done
    if [ -z "$HOST" ]; then
      HOST=$IP
    fi

    yq-go e -i ".playback_host = \"$HOST\"" $TARGET

    chmod +r $TARGET

    # Run recording link fixup/upgrade script
    # Don't abort on failure; users can manually run it later, too
    if id $BBB_USER > /dev/null 2>&1 ; then
      mkdir -p /var/bigbluebutton/recording/status
      chown $BBB_USER:$BBB_USER /var/bigbluebutton/recording/status

      mkdir -p /var/bigbluebutton/events
      chown $BBB_USER:$BBB_USER /var/bigbluebutton/events

      mkdir -p /var/bigbluebutton/recording
      mkdir -p /var/bigbluebutton/recording/raw
      mkdir -p /var/bigbluebutton/recording/process
      mkdir -p /var/bigbluebutton/recording/publish
      mkdir -p /var/bigbluebutton/recording/status/recorded
      mkdir -p /var/bigbluebutton/recording/status/archived
      mkdir -p /var/bigbluebutton/recording/status/processed
      mkdir -p /var/bigbluebutton/recording/status/sanity
      mkdir -p /var/bigbluebutton/recording/status/published
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

    # Start, not restart: a running worker keeps the job it is processing. A unit that was
    # stopped or had failed before the upgrade would otherwise stay down until the next restart.
    startService bbb-rap-resque-worker.service || echo "bbb-rap-resque-worker.service could not be registered or started"
    startService bbb-rap-starter.service || echo "bbb-rap-starter.service could not be registered or started"
    startService bbb-rap-caption-inbox.service || echo "bbb-rap-caption-inbox.service could not be registered or started"
  ;;
  
  *)
    echo "## postinst called with unknown argument \`$1'" >&2
  ;;
esac

if dpkg -l | grep -q nginx; then
  reloadService nginx
fi

systemctl daemon-reload
