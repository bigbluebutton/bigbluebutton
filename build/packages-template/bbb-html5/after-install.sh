#!/bin/bash -e

BIGBLUEBUTTON_USER=bigbluebutton

HOST=$(cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties | grep -v '#' | sed -n '/^bigbluebutton.web.serverURL/{s/.*\///;p}')
# set ownership of activity directory
chown -R $BIGBLUEBUTTON_USER:$BIGBLUEBUTTON_USER /var/bigbluebutton/html5-client/

if [ ! -L /etc/nginx/sites-enabled/bigbluebutton ]; then
  mkdir -p /etc/nginx/sites-enabled
  ln -s /etc/nginx/sites-available/bigbluebutton /etc/nginx/sites-enabled/bigbluebutton
fi

TARGET=/var/bigbluebutton/html5-client/private/config/settings.yml

WSURL=$(cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties | grep -v '#' | sed -n '/^bigbluebutton.web.serverURL/{s/.*=//;p}' | sed 's/https/wss/g' | sed s'/http/ws/g')

yq e -i ".public.kurento.wsUrl = \"$WSURL/bbb-webrtc-sfu\"" $TARGET

yq e -i  ".public.pads.url = \"$PROTOCOL://$HOST/pad\"" $TARGET

sed -i "s/proxy_pass .*/proxy_pass http:\/\/$IP:5066;/g" /usr/share/bigbluebutton/nginx/sip.nginx
sed -i "s/server_name  .*/server_name  $IP;/g" /etc/nginx/sites-available/bigbluebutton

chmod 600 $TARGET

if [ ! -f /.dockerenv ]; then
  systemctl enable disable-transparent-huge-pages.service
  systemctl daemon-reload
fi
# set full BBB version in settings.yml so it can be displayed in the client
BBB_RELEASE_FILE=/etc/bigbluebutton/bigbluebutton-release
BBB_HTML5_SETTINGS_FILE=/var/bigbluebutton/html5-client/private/config/settings.yml
if [ -f $BBB_RELEASE_FILE ] && [ -f $BBB_HTML5_SETTINGS_FILE ]; then
  BBB_FULL_VERSION=$(cat $BBB_RELEASE_FILE | sed -n '/^BIGBLUEBUTTON_RELEASE/{s/.*=//;p}' | tail -n 1)
  echo "setting public.app.bbbServerVersion: $BBB_FULL_VERSION in $BBB_HTML5_SETTINGS_FILE "
  yq e -i ".public.app.bbbServerVersion = \"$BBB_FULL_VERSION\"" $BBB_HTML5_SETTINGS_FILE
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

# Enable Listen Only support in FreeSWITCH
if [ -f /opt/freeswitch/etc/freeswitch/sip_profiles/external.xml ]; then
  sed -i 's/<!--<param name="enable-3pcc" value="true"\/>-->/<param name="enable-3pcc" value="proxy"\/>/g' /opt/freeswitch/etc/freeswitch/sip_profiles/external.xml
fi

chown root:root /usr/lib/systemd/system
chown root:root /usr/lib/systemd/system/disable-transparent-huge-pages.service

chmod go+r $TARGET
#
# Restart nginx to take advantage of the updates to nginx configuration
#
reloadService nginx

