#!/bin/bash -e


case "$1" in
  configure|upgrade|1|2)
    if [ -f /tmp/vars.xml ]; then
      cp /tmp/vars.xml /opt/freeswitch/etc/freeswitch/vars.xml
      # Needed for bbb-webrtc-sfu
      sed -i 's/,VP8//g' /opt/freeswitch/etc/freeswitch/vars.xml
      mv -f /tmp/vars.xml /tmp/_vars.xml
    else
      sed -i "s@<X-PRE-PROCESS cmd=\"set\" data=\"local_ip_v4=.*\"/>@<X-PRE-PROCESS cmd=\"set\" data=\"local_ip_v4=$IP\"/>@g"  /opt/freeswitch/etc/freeswitch/vars.xml
    fi

    sed -n 's/,VP8//g' /opt/freeswitch/etc/freeswitch/vars.xml

    SOURCE=/tmp/external.xml
    TARGET=/opt/freeswitch/etc/freeswitch/sip_profiles/external.xml

    # Determine if there are ws-binding and wss-binding values to propagate
    if [ -f $SOURCE ]; then
      if xmlstarlet sel -t -v '//param[@name="ws-binding"]/@value' $SOURCE > /dev/null 2>&1; then
        WS_BINDING=$(xmlstarlet sel -t -v '//param[@name="ws-binding"]/@value' $SOURCE)
        xmlstarlet edit --inplace --update '//param[@name="ws-binding"]/@value' --value "$WS_BINDING" $TARGET
      fi
      if xmlstarlet sel -t -v '//param[@name="wss-binding"]/@value' $SOURCE > /dev/null 2>&1; then
        WSS_BINDING=$(xmlstarlet sel -t -v '//param[@name="wss-binding"]/@value' $SOURCE)
        xmlstarlet edit --inplace --update '//param[@name="wss-binding"]/@value' --value "$WSS_BINDING" $TARGET
      fi 
      mv -f $SOURCE "${SOURCE}_"
    fi 

    if [ -f /tmp/verto.conf.xml ]; then
      cp /tmp/verto.conf.xml /opt/freeswitch/conf/autoload_configs/verto.conf.xml
      mv -f /tmp/verto.conf.xml /tmp/_verto.conf.xml
    fi

    if [ -f /tmp/event_socket.conf.xml ]; then
      ESL_PASSWORD=$(xmlstarlet sel -t -m 'configuration/settings/param[@name="password"]' -v @value /tmp/event_socket.conf.xml)
      if [ ! -z "$ESL_PASSWORD" ]; then
        xmlstarlet edit --inplace --update '//param[@name="password"]/@value' --value "$ESL_PASSWORD" /opt/freeswitch/etc/freeswitch/autoload_configs/event_socket.conf.xml
      fi
      mv -f /tmp/event_socket.conf.xml /tmp/event_socket.conf.xml_
    fi



    chown freeswitch:daemon /var/freeswitch/meetings
    chown -R freeswitch:daemon /opt/freeswitch
  ;;

  abort-upgrade|abort-remove|abort-deconfigure)
  ;;

  *)
    echo "## postinst called with unknown argument \`$1'" >&2
  ;;
esac

ldconfig
if [ -f /.dockerenv ]; then
  # To make it easier to run within Docker, disable IPV6
  sed -i 's/::/0.0.0.0/g' /opt/freeswitch/etc/freeswitch/autoload_configs/event_socket.conf.xml

  if [ -f /opt/freeswitch/conf/sip_profiles/external-ipv6.xml ]; then
    mv /opt/freeswitch/conf/sip_profiles/external-ipv6.xml /opt/freeswitch/conf/sip_profiles/external-ipv6.xml_
  fi
  if [ -f /opt/freeswitch/conf/sip_profiles/internal-ipv6.xml ]; then
    mv /opt/freeswitch/conf/sip_profiles/internal-ipv6.xml /opt/freeswitch/conf/sip_profiles/internal-ipv6.xml_
  fi
else
  startService freeswitch.service || echo "freeswitch.service could not be registered or started"
fi

