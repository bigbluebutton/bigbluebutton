#!/bin/bash -e

if [ ! -L /etc/nginx/sites-enabled/bigbluebutton ]; then
  mkdir -p /etc/nginx/sites-enabled
  ln -s /etc/nginx/sites-available/bigbluebutton /etc/nginx/sites-enabled/bigbluebutton
fi

cd /usr/share/meteor

# meteor code should be owned by root, config file by meteor user
meteor_owner=$(stat -c %U:%G /usr/share/meteor)
if [[ $meteor_owner != "root:root" ]] ; then
    chown -R root:root /usr/share/meteor
fi

TARGET=/usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml

  sed -i "s/proxy_pass .*/proxy_pass http:\/\/$IP:5066;/g" /usr/share/bigbluebutton/nginx/sip.nginx
  sed -i "s/server_name  .*/server_name  $IP;/g" /etc/nginx/sites-available/bigbluebutton

  chmod 600 $TARGET
  chown meteor:meteor $TARGET

startService disable-transparent-huge-pages.service

# set full BBB version in settings.yml so it can be displayed in the client
BBB_RELEASE_FILE=/etc/bigbluebutton/bigbluebutton-release
BBB_HTML5_SETTINGS_FILE=/usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml
if [ -f $BBB_RELEASE_FILE ] && [ -f $BBB_HTML5_SETTINGS_FILE ]; then
  BBB_FULL_VERSION=$(cat $BBB_RELEASE_FILE | sed -n '/^BIGBLUEBUTTON_RELEASE/{s/.*=//;p}' | tail -n 1)
  echo "setting public.app.bbbServerVersion: $BBB_FULL_VERSION in $BBB_HTML5_SETTINGS_FILE "
  yq w -i $BBB_HTML5_SETTINGS_FILE public.app.bbbServerVersion $BBB_FULL_VERSION
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
chown root:root /usr/lib/systemd/system/bbb-html5.service
chown root:root /usr/lib/systemd/system/disable-transparent-huge-pages.service

# Ensure settings is readable
chmod go+r /usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml

startService bbb-html5 || echo "bbb-html5 service could not be registered or started"
