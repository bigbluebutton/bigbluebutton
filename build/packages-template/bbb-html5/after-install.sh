#!/bin/bash -e


HOST=$(cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties | grep -v '#' | sed -n '/^bigbluebutton.web.serverURL/{s/.*\///;p}')

if [ ! -L /etc/nginx/sites-enabled/bigbluebutton ]; then
  ln -s /etc/nginx/sites-available/bigbluebutton /etc/nginx/sites-enabled/bigbluebutton
fi

cd /usr/share/meteor

# meteor code should be owned by root, config file by meteor user
meteor_owner=$(stat -c %U:%G /usr/share/meteor)
if [[ $meteor_owner != "root:root" ]] ; then
    chown -R root:root /usr/share/meteor
fi

SOURCE=/tmp/settings.yml
TARGET=/usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml

  if [ -f $SOURCE ]; then

    WSURL=$(yq r $SOURCE public.kurento.wsUrl)
    ENABLESCREENSHARING=$(yq r $SOURCE public.kurento.enableScreensharing)
    ENABLEVIDEO=$(yq r $SOURCE public.kurento.enableVideo)

    yq w -i $TARGET public.kurento.wsUrl               "$WSURL"
    yq w -i $TARGET public.kurento.enableScreensharing "$ENABLESCREENSHARING"
    yq w -i $TARGET public.kurento.enableVideo         "$ENABLEVIDEO"

    yq w -i $TARGET public.pads.url                    "$PROTOCOL://$HOST/pad"

    yq w -i $TARGET public.app.listenOnlyMode          "true"

    mv -f $SOURCE "${SOURCE}_"
  else
    # New Setup
    WSURL=$(cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties | grep -v '#' | sed -n '/^bigbluebutton.web.serverURL/{s/.*=//;p}' | sed 's/https/wss/g' | sed s'/http/ws/g')

    yq w -i $TARGET public.kurento.wsUrl               "$WSURL/bbb-webrtc-sfu"

    yq w -i $TARGET public.kurento.enableScreensharing "true"
    yq w -i $TARGET public.kurento.enableVideo         "true"

    yq w -i $TARGET public.app.listenOnlyMode          "true"

    yq w -i $TARGET public.pads.url                    "$PROTOCOL://$HOST/pad"

    sed -i "s/proxy_pass .*/proxy_pass http:\/\/$IP:5066;/g" /etc/bigbluebutton/nginx/sip.nginx
    sed -i "s/server_name  .*/server_name  $IP;/g" /etc/nginx/sites-available/bigbluebutton
  fi

  chmod 600 $TARGET
  chown meteor:meteor $TARGET

if [ ! -f /.dockerenv ]; then
  systemctl enable disable-transparent-huge-pages.service
  systemctl daemon-reload
fi

# set full BBB version in settings.yml so it can be displayed in the client
BBB_RELEASE_FILE=/etc/bigbluebutton/bigbluebutton-release
BBB_HTML5_SETTINGS_FILE=/usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml
if [[ -f $BBB_RELEASE_FILE ]] ; then
  BBB_FULL_VERSION=$(cat $BBB_RELEASE_FILE | sed -n '/^BIGBLUEBUTTON_RELEASE/{s/.*=//;p}' )
  echo "setting BBB_FULL_VERSION=$BBB_FULL_VERSION in $BBB_HTML5_SETTINGS_FILE "
  if [[ -f $BBB_HTML5_SETTINGS_FILE ]] ; then
    sed -i "s/HTML5_FULL_BBB_VERSION/$BBB_FULL_VERSION/g" $BBB_HTML5_SETTINGS_FILE
  fi
fi

# Remove old overrides 
if [ -f /etc/systemd/system/mongod.service.d/override-mongo.conf ] \
  || [ -f /etc/systemd/system/mongod.service.d/override.conf ] \
  || [ -f /usr/lib/systemd/system/mongod.service.d/mongod-service-override.conf ] ; then
  rm -f /etc/systemd/system/mongod.service.d/override-mongo.conf
  rm -f /etc/systemd/system/mongod.service.d/override.conf
  rm -f /usr/lib/systemd/system/mongod.service.d/mongod-service-override.conf 
  systemctl daemon-reload
fi

# Setup specific version of node


source /etc/lsb-release

if [ "$DISTRIB_RELEASE" == "18.04" ]; then
  node_version="14.18.1"
  if [[ ! -d /usr/share/node-v${node_version}-linux-x64 ]]; then
    cd /usr/share
    tar xfz "node-v${node_version}-linux-x64.tar.gz"
  fi
  node_owner=$(stat -c %U:%G "/usr/share/node-v${node_version}-linux-x64")
  if [[ $node_owner != root:root ]] ; then
    chown -R root:root "/usr/share/node-v${node_version}-linux-x64"
  fi
fi


# Enable Listen Only support in FreeSWITCH

if [ -f /opt/freeswitch/etc/freeswitch/sip_profiles/external.xml ]; then
  sed -i 's/<!--<param name="enable-3pcc" value="true"\/>-->/<param name="enable-3pcc" value="proxy"\/>/g' /opt/freeswitch/etc/freeswitch/sip_profiles/external.xml
fi

if [ -f /tmp/sip.nginx ]; then
  IP_SIP=$(cat /tmp/sip.nginx | grep -v '#' | sed -n '/proxy_pass/{s/.*\/\///;s/:.*//;p}')
  IP_PORT=$(cat /tmp/sip.nginx | grep -v '#' | sed -n '/proxy_pass/{s/[^:]*.*[^:]*://;s/;.*//;p}')
  if grep proxy_pass /tmp/sip.nginx | grep -q https; then
    sed -i "s/proxy_pass http.*/proxy_pass https:\/\/$IP_SIP:$IP_PORT;/g" \
            /etc/bigbluebutton/nginx/sip.nginx
  else
    sed -i "s/proxy_pass http.*/proxy_pass http:\/\/$IP_SIP:$IP_PORT;/g" \
            /etc/bigbluebutton/nginx/sip.nginx
  fi
fi

if ! grep -q auth_request /etc/bigbluebutton/nginx/sip.nginx; then
	sed -i 's#}#\n        auth_request /bigbluebutton/connection/checkAuthorization;\n        auth_request_set $auth_status $upstream_status;\n}#g' \
	       /etc/bigbluebutton/nginx/sip.nginx
fi

chown root:root /usr/lib/systemd/system
chown root:root /usr/lib/systemd/system/bbb-html5.service
chown root:root /usr/lib/systemd/system/disable-transparent-huge-pages.service

# Ensure settings is readable
chmod go+r /usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml

startService bbb-html5 || echo "bbb-html5 service could not be registered or started"

