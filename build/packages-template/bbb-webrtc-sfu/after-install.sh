#!/bin/bash -e

source /etc/lsb-release

case "$1" in
  configure|upgrade|1|2)

    TARGET=/usr/local/bigbluebutton/bbb-webrtc-sfu/config/default.yml

    cp /usr/local/bigbluebutton/bbb-webrtc-sfu/config/default.example.yml $TARGET
    chown bigbluebutton:bigbluebutton $TARGET

      # Set mediasoup IPs
      yq w -i $TARGET mediasoup.webrtc.listenIps[0].announcedIp "$IP"
      yq w -i $TARGET mediasoup.plainRtp.listenIp.announcedIp "$IP"

      FREESWITCH_IP=$(xmlstarlet sel -t -v '//X-PRE-PROCESS[@cmd="set" and starts-with(@data, "local_ip_v4=")]/@data' /opt/freeswitch/conf/vars.xml | sed 's/local_ip_v4=//g')
      if [ "$FREESWITCH_IP" != "" ]; then
        yq w -i $TARGET freeswitch.ip $FREESWITCH_IP
        yq w -i $TARGET freeswitch.sip_ip $FREESWITCH_IP
      else
        # Looks like the FreeSWITCH package is being installed, let's fall back to the default value
        yq w -i $TARGET freeswitch.ip $IP
	if [ "$DISTRIB_CODENAME" == "focal" ]; then
          yq w -i $TARGET freeswitch.sip_ip $IP
	fi
      fi
 
    cd /usr/local/bigbluebutton/bbb-webrtc-sfu
    mkdir -p node_modules

    # there's a problem rebuilding bufferutil
    # do not abort in case npm rebuild return something different than 0
    #npm config set unsafe-perm true
    #npm rebuild || true

    mkdir -p /var/log/bbb-webrtc-sfu/
    touch /var/log/bbb-webrtc-sfu/bbb-webrtc-sfu.log

    yq w -i $TARGET recordWebcams true
    if id bigbluebutton > /dev/null 2>&1 ; then
      chown -R bigbluebutton:bigbluebutton /usr/local/bigbluebutton/bbb-webrtc-sfu /var/log/bbb-webrtc-sfu/
    else
      echo "#"
      echo "# Warning: Unable to assign ownership of bigbluebutton to kurento files"
      echo "#"
    fi

    # Creates the mediasoup raw media file dir if needed
    if [ ! -d /var/mediasoup ]; then
      mkdir -p /var/mediasoup
    fi

    chmod 644 $TARGET
    chown bigbluebutton:bigbluebutton $TARGET

    reloadService nginx
    startService bbb-webrtc-sfu        || echo "bbb-webrtc-sfu could not be registered or started"

  ;;

  abort-upgrade|abort-remove|abort-deconfigure)

  ;;

  *)
    echo "postinst called with unknown argument \`$1'" >&2
    exit 1
  ;;
esac

