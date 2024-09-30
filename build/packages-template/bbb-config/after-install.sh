#!/bin/bash -e

set +x

removeOldOverride() {
    service_name=$1
    # check if override file has been modified. If not it can be safely removed
    if [ -f "/etc/systemd/system/${service_name}.service.d/override.conf" ] ; then
        if echo "d32a00b9a2669b3fe757b8de3470e358  /etc/systemd/system/${service_name}.service.d/override.conf" | md5sum -c --quiet 2>/dev/null >/dev/null ; then
            rm -f "/etc/systemd/system/${service_name}.service.d/override.conf"
        fi
    fi
    if [ -d "/etc/systemd/system/${service_name}.service.d" ]; then
        if [ $(ls "/etc/systemd/system/${service_name}.service.d" |wc -l) = 0 ]; then
            rmdir "/etc/systemd/system/${service_name}.service.d"
        fi
    fi
}

BIGBLUEBUTTON_USER=bigbluebutton

if ! id freeswitch >/dev/null 2>&1; then
  echo "Error: FreeSWITCH not installed"
  exit 1
fi

if lsb_release -d | grep -q CentOS; then
  DISTRO=centos
  FREESWITCH=freeswitch
  FREESWITCH_GROUP=daemon
else
  DISTRO=ubuntu
  FREESWITCH=freeswitch
  FREESWITCH_GROUP=freeswitch
fi

#
# Set the permissions to /var/bigbluebutton so services can write
#
if [ -d /var/bigbluebutton ]; then
  echo -n "."
  chown -R $BIGBLUEBUTTON_USER:$BIGBLUEBUTTON_USER /var/bigbluebutton
  echo -n "."
  
  chmod o+rx /var/bigbluebutton
 
  #
  # Setup for recordings XXX
  #
  mkdir -p /var/bigbluebutton/recording
  mkdir -p /var/bigbluebutton/recording/raw
  mkdir -p /var/bigbluebutton/recording/process
  mkdir -p /var/bigbluebutton/recording/publish
  mkdir -p /var/bigbluebutton/recording/status
  mkdir -p /var/bigbluebutton/recording/status/recorded
  mkdir -p /var/bigbluebutton/recording/status/archived
  mkdir -p /var/bigbluebutton/recording/status/processed
  mkdir -p /var/bigbluebutton/recording/status/sanity
  echo -n "."
  chown -R $BIGBLUEBUTTON_USER:$BIGBLUEBUTTON_USER /var/bigbluebutton/recording
  
  mkdir -p /var/bigbluebutton/published
  echo -n "."
  chown -R $BIGBLUEBUTTON_USER:$BIGBLUEBUTTON_USER /var/bigbluebutton/published
  
  mkdir -p /var/bigbluebutton/deleted
  echo -n "."
  chown -R $BIGBLUEBUTTON_USER:$BIGBLUEBUTTON_USER /var/bigbluebutton/deleted
  
  mkdir -p /var/bigbluebutton/unpublished
  echo -n "."
  chown -R $BIGBLUEBUTTON_USER:$BIGBLUEBUTTON_USER /var/bigbluebutton/unpublished
  echo
else
  echo "Warning: BigBlueButton not installed"
fi

if [ -f /usr/share/bbb-apps-akka/conf/application.conf ]; then
  if [ "$(cat /usr/share/bbb-apps-akka/conf/application.conf | sed -n '/sharedSecret.*/{s/[^"]*"//;s/".*//;p}')" == "changeme" ]; then
    SECRET=$(cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties | grep -v '#' | tr -d '\r' | sed -n '/securitySalt/{s/.*=//;p}')
    sed -i "s/sharedSecret[ ]*=[ ]*\"[^\"]*\"/sharedSecret=\"$SECRET\"/g" \
       /usr/share/bbb-apps-akka/conf/application.conf

    HOST=$(cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties | grep -v '#' | sed -n '/^bigbluebutton.web.serverURL/{s/.*\///;p}')
    sed -i  "s/bbbWebAPI[ ]*=[ ]*\"[^\"]*\"/bbbWebAPI=\"http:\/\/$HOST\/bigbluebutton\/api\"/g" \
       /usr/share/bbb-apps-akka/conf/application.conf
    sed -i "s/bbbWebHost[ ]*=[ ]*\"[^\"]*\"/bbbWebHost=\"$HOST\"/g" \
       /usr/share/bbb-apps-akka/conf/application.conf
    sed -i "s/deskshareip[ ]*=[ ]*\"[^\"]*\"/deskshareip=\"$HOST\"/g" \
       /usr/share/bbb-apps-akka/conf/application.conf
    sed -i "s/defaultPresentationURL[ ]*=[ ]*\"[^\"]*\"/defaultPresentationURL=\"http:\/\/$HOST\/default.pdf\"/g" \
       /usr/share/bbb-apps-akka/conf/application.conf

  fi
fi

#
# Added to enable bbb-record-core to move files #8901
#
usermod bigbluebutton -a -G freeswitch
chmod 0775 /var/freeswitch/meetings

# Verify mediasoup raw media directories ownership and perms
if [ -d /var/mediasoup ]; then
  chown bigbluebutton:bigbluebutton /var/mediasoup
  chmod 0700 /var/mediasoup
fi

if [ -d /var/mediasoup/recordings ]; then
  chmod 0700 /var/mediasoup/recordings
fi

if [ -d /var/mediasoup/screenshare ]; then
  chmod 0700 /var/mediasoup/screenshare
fi

sed -i 's/worker_connections 768/worker_connections 10000/g' /etc/nginx/nginx.conf

if grep -q "worker_rlimit_nofile" /etc/nginx/nginx.conf; then
  num=$(grep worker_rlimit_nofile /etc/nginx/nginx.conf | grep -o '[0-9]*')
  if [[ "$num" -lt 10000 ]]; then
    sed -i 's/worker_rlimit_nofile [0-9 ]*;/worker_rlimit_nofile 10000;/g' /etc/nginx/nginx.conf
  fi
else
  sed -i 's/events {/worker_rlimit_nofile 10000;\n\nevents {/g' /etc/nginx/nginx.conf
fi

mkdir -p /etc/bigbluebutton/nginx

# symlink default bbb nginx config from package if it does not exist
if [ ! -e /etc/bigbluebutton/nginx/include_default.nginx ] ; then
  ln -s /usr/share/bigbluebutton/include_default.nginx /etc/bigbluebutton/nginx/include_default.nginx
fi

# set full BBB version in settings.yml so it can be displayed in the client
BBB_RELEASE_FILE=/etc/bigbluebutton/bigbluebutton-release
BBB_HTML5_SETTINGS_FILE=/usr/share/bigbluebutton/html5-client/private/config/settings.yml
if [ -f $BBB_RELEASE_FILE ] && [ -f $BBB_HTML5_SETTINGS_FILE ]; then
  BBB_FULL_VERSION=$(cat $BBB_RELEASE_FILE | sed -n '/^BIGBLUEBUTTON_RELEASE/{s/.*=//;p}' | tail -n 1)
  echo "setting public.app.bbbServerVersion: $BBB_FULL_VERSION in $BBB_HTML5_SETTINGS_FILE "
  yq e -i ".public.app.bbbServerVersion = \"$BBB_FULL_VERSION\"" $BBB_HTML5_SETTINGS_FILE
fi

# Fix permissions for logging
chown bigbluebutton:bigbluebutton /var/log/bbb-fsesl-akka

# cleanup old overrides

removeOldOverride bbb-apps-akka
removeOldOverride bbb-fsesl-akka
removeOldOverride bbb-transcode-akka


# re-create the symlink for apply-lib.sh to ensure the latest version is present
if [ -f /etc/bigbluebutton/bbb-conf/apply-lib.sh ]; then
  rm /etc/bigbluebutton/bbb-conf/apply-lib.sh
fi
if [ -f /usr/lib/bbb-conf/apply-lib.sh ]; then
  ln -s /usr/lib/bbb-conf/apply-lib.sh /etc/bigbluebutton/bbb-conf/apply-lib.sh
fi

# Load the overrides
systemctl daemon-reload
