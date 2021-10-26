#!/bin/bash -e

set +x

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
# Set the permissions to /var/bigbluebutton so both red5 and tomcat can write
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

if [ -d /var/bigbluebutton/screenshare ]; then
  chown red5:red5 /var/bigbluebutton/screenshare
fi

#
# Added to enable bbb-record-core to move files #8901
#
usermod bigbluebutton -a -G freeswitch
chmod 0775 /var/freeswitch/meetings

if ! id kurento >/dev/null 2>&1; then
    useradd --home-dir "/var/lib/kurento" --system kurento
fi
usermod bigbluebutton -a -G kurento
chown kurento:kurento /var/kurento
chmod 0775 /var/kurento

if [ -d /var/kurento/recordings ]; then
  chmod 0775 /var/kurento/recordings
fi

if [ -d /var/kurento/screenshare ]; then 
  chmod 0775 /var/kurento/screenshare
fi

if [ -f /usr/lib/systemd/system/red5.service ]; then
  chown root:root /usr/lib/systemd/system/red5.service
fi

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

sed -i 's/worker_connections 768/worker_connections 4000/g' /etc/nginx/nginx.conf

if grep "worker_rlimit_nofile" /etc/nginx/nginx.conf; then
  num=$(grep worker_rlimit_nofile /etc/nginx/nginx.conf | grep -o '[0-9]*')
  if [[ "$num" -lt 10000 ]]; then
    sed -i 's/worker_rlimit_nofile [0-9 ]*;/worker_rlimit_nofile 10000;/g' /etc/nginx/nginx.conf
  fi
else
  sed -i 's/events {/worker_rlimit_nofile 10000;\n\nevents {/g' /etc/nginx/nginx.conf
fi

# Load the overrides
systemctl daemon-reload
