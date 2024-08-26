#!/bin/bash -ex

source /etc/lsb-release

case "$1" in
  configure|upgrade|1|2)
    TARGET=/usr/local/bigbluebutton/bbb-webrtc-sfu/config/default.yml

    cp /usr/local/bigbluebutton/bbb-webrtc-sfu/config/default.example.yml $TARGET
    chown bigbluebutton:bigbluebutton $TARGET

    # Set mediasoup IPs
    # mediasoup.webrtc.listenIps[]: used for EXTERNAL comms (browser <-> ms)
    yq e -i ".mediasoup.webrtc.listenIps[0].announcedIp = \"$IP\"" $TARGET
    # mediasoup.plainRtp.listenIp: used for INTERNAL comms (FreeSWITCH <-> ms)
    yq e -i ".mediasoup.plainRtp.listenIp.announcedIp = \"$IP\"" $TARGET
    # mediasoup.workerBalancing: defines the strategy to distribute mediasoup
    # elements (transports, producers, consumers) among workers.
    yq e -i '.mediasoup.workerBalancing.strategy = "least-loaded"' $TARGET
    # mediasoup.enableWorkerTransposing: whether to enable worker transposing
    # (ie: the ability to move a media stream from one worker to another).
    yq e -i '.mediasoup.enableWorkerTransposing = true' $TARGET
    # mediasoup.dedicatedMediaTypeWorkers.audio: spin up #auto mediasoup workers
    # dedicated to handling audio streams.
    # auto = ceil((min(nproc,32) * 0.8) + (max(0, nproc - 32) / 2))
    # The goal here is to try and preserve quality for audio streams via:
    #   - reducing noise from video streams in these single threaded workers
    #   - giving the possibility to specify different scheduling priorities for audio workers
    yq e -i '.mediasoup.dedicatedMediaTypeWorkers.audio = "auto"' $TARGET


    FREESWITCH_IP=$(xmlstarlet sel -t -v '//X-PRE-PROCESS[@cmd="set" and starts-with(@data, "local_ip_v4=")]/@data' /opt/freeswitch/conf/vars.xml | sed 's/local_ip_v4=//g')
    if [ "$FREESWITCH_IP" != "" ]; then
      yq e -i ".freeswitch.ip = \"$FREESWITCH_IP\"" $TARGET
      yq e -i ".freeswitch.sip_ip = \"$IP\"" $TARGET
    else
      # Looks like the FreeSWITCH package is being installed, let's fall back to the default value
      yq e -i ".freeswitch.ip = \"$IP\"" $TARGET
      if [ "$DISTRIB_CODENAME" == "focal" ]; then
        yq e -i ".freeswitch.sip_ip = \"$IP\"" $TARGET
      fi
    fi

    cd /usr/local/bigbluebutton/bbb-webrtc-sfu
    mkdir -p node_modules

    mkdir -p /var/log/bbb-webrtc-sfu/
    touch /var/log/bbb-webrtc-sfu/bbb-webrtc-sfu.log

    yq e -i '.recordWebcams = true' $TARGET
    # Set bbb-webrtc-recorder as the default recordingAdapter
    yq e -i '.recordingAdapter = "bbb-webrtc-recorder"' $TARGET
    # Do not configure any Kurento instances - BBB >= 2.8 doesn't provide Kurento by default
    yq e -i '.kurento = []' $TARGET

    echo "Resetting mcs-address from localhost to 127.0.0.1"
    yq e -i '.mcs-address = "127.0.0.1"' $TARGET

    if id bigbluebutton > /dev/null 2>&1; then
      chown -R bigbluebutton:bigbluebutton /usr/local/bigbluebutton/bbb-webrtc-sfu /var/log/bbb-webrtc-sfu/
    else
      echo "#"
      echo "# Warning: Unable to assign ownership of bigbluebutton to sfu files"
      echo "#"
    fi

    # Creates the mediasoup raw media file dir if needed
    if [ ! -d /var/mediasoup ]; then
      mkdir -p /var/mediasoup
    fi

    chmod 644 $TARGET
    chown bigbluebutton:bigbluebutton $TARGET

    reloadService nginx
    startService bbb-webrtc-sfu || echo "bbb-webrtc-sfu could not be registered or started"
    ;;

  abort-upgrade|abort-remove|abort-deconfigure)
    ;;

  *)
    echo "postinst called with unknown argument \`$1'" >&2
    exit 1
    ;;
esac
