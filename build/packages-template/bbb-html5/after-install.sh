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

if [ -f $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties ]; then
  sed -i 's/^svgImagesRequired=.*/svgImagesRequired=true/' $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties
  if [ ! -f /.dockerenv ]; then
    systemctl restart nginx
  fi

  if cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties | grep bigbluebutton.web.serverURL | grep -q https; then
    PROTOCOL=https
    sed -i 's/^ENVIRONMENT_TYPE=.*/ENVIRONMENT_TYPE=production/' /usr/share/meteor/bundle/systemd_start.sh
  else
    PROTOCOL=http
    sed -i 's/^ENVIRONMENT_TYPE=.*/ENVIRONMENT_TYPE=development/' /usr/share/meteor/bundle/systemd_start.sh
  fi

fi

  SOURCE=/tmp/settings.yml
  TARGET=/usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml

  if [ -f $SOURCE ]; then

    WSURL=$(yq r $SOURCE public.kurento.wsUrl)
    CHROMEEXTENSIONKEY=$(yq r $SOURCE public.kurento.chromeExtensionKey)
    CHROMEEXTENSIONLINK=$(yq r $SOURCE public.kurento.chromeExtensionLink)
    ENABLESCREENSHARING=$(yq r $SOURCE public.kurento.enableScreensharing)
    ENABLEVIDEO=$(yq r $SOURCE public.kurento.enableVideo)

    ETHERPAD_ENABLED=$(yq r $SOURCE public.note.enabled)
    ETHERPAD_URL=$(yq r $SOURCE public.note.url)

    yq w -i $TARGET public.kurento.wsUrl               "$WSURL"
    yq w -i $TARGET public.kurento.chromeExtensionKey  "$CHROMEEXTENSIONKEY"
    yq w -i $TARGET public.kurento.chromeExtensionLink "$CHROMEEXTENSIONLINK"
    yq w -i $TARGET public.kurento.enableScreensharing "$ENABLESCREENSHARING"
    yq w -i $TARGET public.kurento.enableVideo         "$ENABLEVIDEO"

    if [ "$ETHERPAD_ENABLED" == "null" ]; then
      # This is an upgrade from a previous version of 2.2-dev that didn't have settings for etherpad
      yq w -i $TARGET public.note.enabled                "true"
      yq w -i $TARGET public.note.url                    "$PROTOCOL://$HOST/pad"
    else
      yq w -i $TARGET public.note.enabled                "$ETHERPAD_ENABLED"
      yq w -i $TARGET public.note.url                    "$ETHERPAD_URL"
    fi

    yq w -i $TARGET public.app.listenOnlyMode          "true"

    mv -f $SOURCE "${SOURCE}_"
  else
    # New Setup
    WSURL=$(cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties | grep -v '#' | sed -n '/^bigbluebutton.web.serverURL/{s/.*=//;p}' | sed 's/https/wss/g' | sed s'/http/ws/g')

    yq w -i $TARGET public.kurento.wsUrl               "$WSURL/bbb-webrtc-sfu"

    yq w -i $TARGET public.kurento.enableScreensharing "true"
    yq w -i $TARGET public.kurento.enableVideo         "true"

    yq w -i $TARGET public.app.listenOnlyMode          "true"

    yq w -i $TARGET public.note.enabled                "true"
    yq w -i $TARGET public.note.url                    "$PROTOCOL://$HOST/pad"

    sed -i "s/proxy_pass .*/proxy_pass http:\/\/$IP:5066;/g" /etc/bigbluebutton/nginx/sip.nginx
    sed -i "s/server_name  .*/server_name  $IP;/g" /etc/nginx/sites-available/bigbluebutton
  fi

  APIKEY=$(cat /usr/share/etherpad-lite/APIKEY.txt)
  yq w -i $TARGET private.etherpad.apikey $APIKEY

  chmod 600 $TARGET
  chown meteor:meteor $TARGET

if [ ! -f /.dockerenv ]; then
  systemctl enable disable-transparent-huge-pages.service
  systemctl daemon-reload
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
if [ "$DISTRIB_RELEASE" == "16.04" ]; then
  if [ ! -d /usr/share/node-v8.17.0-linux-x64 ]; then
    cd /usr/share
    tar xfz node-v8.17.0-linux-x64.tar.gz
    chown -R meteor:meteor node-v8.17.0-linux-x64
  fi
fi

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

startService bbb-html5 || echo "bbb-html5 service could not be registered or started"

