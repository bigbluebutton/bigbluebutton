# This is a library of functions for 
#
#  /etc/bigbluebutton/bbb-conf/apply-config.sh
#
# which (if exists) will be run by `bbb-conf --setip` and `bbb-conf --restart` before restarting
# BigBlueButton.
#
# The purpose of apply-config.sh is to make it easy to apply your configuration changes to a BigBlueButton server 
# before BigBlueButton starts
#

### duplicated code: see deb-helper.sh and bbb-conf
if [ -e "/sys/class/net/venet0:0" ]; then
    # IP detection for OpenVZ environment
    _dev="venet0:0"
else
    _dev=$(awk '$2 == 00000000 { print $1 }' /proc/net/route | head -1)
fi
_ips=$(LANG=C ip -4 -br address show dev "$_dev" | awk '{ $1=$2=""; print $0 }')
_ips=${_ips/127.0.0.1\/8/}
read -r IP _ <<< "$_ips"
IP=${IP/\/*} # strip subnet provided by ip address
if [ -z "$IP" ]; then
  read -r IP _ <<< "$(hostname -I)"
fi

if [ -f /usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties ]; then
  SERVLET_DIR=/usr/share/bbb-web
fi

BBB_WEB_ETC_CONFIG=/etc/bigbluebutton/bbb-web.properties

# We'll create a newline file to ensure bigbluebutton.properties ends with a newline
tmpfile=$(mktemp /tmp/carriage-return.XXXXXX)
echo "\n" > $tmpfile

PROTOCOL=http
if [ -f $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties ]; then
  SERVER_URL=$(cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties $tmpfile $BBB_WEB_ETC_CONFIG | grep -v '#' | sed -n '/^bigbluebutton.web.serverURL/{s/.*\///;p}' | tail -n 1)
  if cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties $tmpfile $BBB_WEB_ETC_CONFIG | grep -v '#' | grep ^bigbluebutton.web.serverURL | tail -n 1 | grep -q https; then
    PROTOCOL=https
  fi
fi

HOST=$(cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties $tmpfile $BBB_WEB_ETC_CONFIG | grep -v '#' | sed -n '/^bigbluebutton.web.serverURL/{s/.*\///;p}' | tail -n 1)

HTML5_CONFIG=/usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml
BBB_WEB_CONFIG=$SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties


#
# Enable Looging of the HTML5 client for debugging
#
enableHTML5ClientLog() {
  echo "  - Enable HTML5 client log to /var/log/nginx/html5-client.log"

  yq w -i $HTML5_CONFIG public.clientLog.external.enabled true
  yq w -i $HTML5_CONFIG public.clientLog.external.url     "$PROTOCOL://$HOST/html5log"
  yq w -i $HTML5_CONFIG public.app.askForFeedbackOnLogout true
  chown meteor:meteor $HTML5_CONFIG

  cat > /usr/share/bigbluebutton/nginx/html5-client-log.nginx << HERE
location /html5log {
        access_log /var/log/nginx/html5-client.log postdata;
        echo_read_request_body;
}
HERE

  cat > /etc/nginx/conf.d/html5-client-log.conf << HERE
log_format postdata '\$remote_addr [\$time_iso8601] \$request_body';
HERE

  # We need nginx-full to enable postdata log_format
  if ! dpkg -l | grep -q nginx-full; then
    apt-get install -y nginx-full
  fi

  touch /var/log/nginx/html5-client.log
  chown bigbluebutton:bigbluebutton /var/log/nginx/html5-client.log

  #
  # You can monitor the live HTML5 client logs with the command
  #
  #   tail -f /var/log/nginx/html5-client.log | sed -u 's/\\x22/"/g' | sed -u 's/\\x5C//g'
}


enableHTML5CameraQualityThresholds() {
  echo "  - Enable HTML5 cameraQualityThresholds"
  yq w -i $HTML5_CONFIG public.kurento.cameraQualityThresholds.enabled true
}

enableHTML5WebcamPagination() {
  echo "  - Enable HTML5 webcam pagination"
  yq w -i $HTML5_CONFIG public.kurento.pagination.enabled true
}


#
# Enable firewall rules to open only 
#
enableUFWRules() {
  echo "  - Enable Firewall and opening 22/tcp, 80/tcp, 443/tcp and 16384:32768/udp"

  if ! which ufw > /dev/null; then
    apt-get install -y ufw
  fi

  ufw allow OpenSSH
  ufw allow "Nginx Full"
  ufw allow 16384:32768/udp
  ufw --force enable
}


enableMultipleKurentos() {
  echo "  - Configuring three Kurento Media Servers (listen only, webcam, and screenshare)"

  # Step 1.  Setup shared certificate between FreeSWITCH and Kurento

  HOSTNAME=$(cat /etc/nginx/sites-available/bigbluebutton | grep -v '#' | sed -n '/server_name/{s/.*server_name[ ]*//;s/;//;p}' | cut -d' ' -f1 | head -n 1)
  openssl req -x509 -new -nodes -newkey rsa:4096 -sha256 -days 3650 -subj "/C=BR/ST=Ottawa/O=BigBlueButton Inc./OU=Live/CN=$HOSTNAME" -keyout /tmp/dtls-srtp-key.pem -out /tmp/dtls-srtp-cert.pem
  cat /tmp/dtls-srtp-key.pem /tmp/dtls-srtp-cert.pem > /etc/kurento/dtls-srtp.pem
  cat /tmp/dtls-srtp-key.pem /tmp/dtls-srtp-cert.pem > /opt/freeswitch/etc/freeswitch/tls/dtls-srtp.pem

  sed -i 's/;pemCertificateRSA=.*/pemCertificateRSA=\/etc\/kurento\/dtls-srtp.pem/g' /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini

  # Step 2.  Setup systemd unit files to launch three separate instances of Kurento

  for i in `seq 8888 8890`; do

    cat > /usr/lib/systemd/system/kurento-media-server-${i}.service << HERE
# /usr/lib/systemd/system/kurento-media-server-#{i}.service
[Unit]
Description=Kurento Media Server daemon (${i})
After=network.target
PartOf=kurento-media-server.service
After=kurento-media-server.service

[Service]
UMask=0002
Environment=KURENTO_LOGS_PATH=/var/log/kurento-media-server
Environment=KURENTO_CONF_FILE=/etc/kurento/kurento-${i}.conf.json
User=kurento
Group=kurento
LimitNOFILE=1000000
ExecStartPre=-/bin/rm -f /var/kurento/.cache/gstreamer-1.5/registry.x86_64.bin
ExecStart=/usr/bin/kurento-media-server --gst-debug-level=3 --gst-debug="3,Kurento*:4,kms*:4,KurentoWebSocketTransport:5"
Type=simple
PIDFile=/var/run/kurento-media-server-${i}.pid
TasksMax=infinity
Restart=always

[Install]
WantedBy=kurento-media-server.service
HERE

    # Make a new configuration file each instance of Kurento that binds to a different port
    cp /etc/kurento/kurento.conf.json /etc/kurento/kurento-${i}.conf.json
    sed -i "s/8888/${i}/g" /etc/kurento/kurento-${i}.conf.json
  done

  # Step 3. Override the main kurento-media-server unit to start/stop the three Kurento instances

  cat > /etc/systemd/system/kurento-media-server.service << HERE
[Unit]
Description=Kurento Media Server

[Service]
Type=oneshot
ExecStart=/bin/true
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
HERE

  # Step 4. Extend bbb-webrtc-sfu unit to wait for all three KMS servers to start

  mkdir -p /etc/systemd/system/bbb-webrtc-sfu.service.d
  cat > /etc/systemd/system/bbb-webrtc-sfu.service.d/override.conf << HERE
[Unit]
After=syslog.target network.target freeswitch.service kurento-media-server-8888.service kurento-media-server-8889.service kurento-media-server-8890.service
HERE

  systemctl daemon-reload

  for i in `seq 8888 8890`; do
    systemctl enable kurento-media-server-${i}.service
  done


  # Step 5.  Modify bbb-webrtc-sfu config to use the three Kurento servers

  KURENTO_CONFIG=/usr/local/bigbluebutton/bbb-webrtc-sfu/config/default.yml

  MEDIA_TYPE=(main audio content)
  IP=$(yq r /usr/local/bigbluebutton/bbb-webrtc-sfu/config/default.yml kurento[0].ip)

  for i in `seq 0 2`; do
    yq w -i $KURENTO_CONFIG "kurento[$i].ip" $IP
    yq w -i $KURENTO_CONFIG "kurento[$i].url" "ws://127.0.0.1:$(($i + 8888))/kurento"
    yq w -i $KURENTO_CONFIG "kurento[$i].mediaType" "${MEDIA_TYPE[$i]}"
    yq w -i $KURENTO_CONFIG "kurento[$i].ipClassMappings.local" ""
    yq w -i $KURENTO_CONFIG "kurento[$i].ipClassMappings.private" ""
    yq w -i $KURENTO_CONFIG "kurento[$i].ipClassMappings.public" ""
    yq w -i $KURENTO_CONFIG "kurento[$i].options.failAfter" 5
    yq w -i $KURENTO_CONFIG "kurento[$i].options.request_timeout" 30000
    yq w -i $KURENTO_CONFIG "kurento[$i].options.response_timeout" 30000
  done

  yq w -i $KURENTO_CONFIG balancing-strategy MEDIA_TYPE
}

disableMultipleKurentos() {
  echo "  - Configuring a single Kurento Media Server for listen only, webcam, and screenshare"
  systemctl stop kurento-media-server.service

  for i in `seq 8888 8890`; do
    systemctl disable kurento-media-server-${i}.service
  done

  # Remove the overrride (restoring the original kurento-media-server.service unit file)
  rm -f /etc/systemd/system/kurento-media-server.service
  rm -f /etc/systemd/system/bbb-webrtc-sfu.service.d/override.conf

  systemctl daemon-reload

  # Restore bbb-webrtc-sfu configuration to use a single instance of Kurento
  KURENTO_CONFIG=/usr/local/bigbluebutton/bbb-webrtc-sfu/config/default.yml
  yq d -i $KURENTO_CONFIG kurento[1]
  yq d -i $KURENTO_CONFIG kurento[1]

  yq w -i $KURENTO_CONFIG "kurento[0].url" "ws://127.0.0.1:8888/kurento"
  yq w -i $KURENTO_CONFIG "kurento[0].mediaType" ""

  yq w -i $KURENTO_CONFIG balancing-strategy ROUND_ROBIN
}


notCalled() {
#
# This function is not called.

# Instead, it gives you the ability to copy the following text and paste it into the shell to create a starting point for
# apply-config.sh.
#
# By creating apply-config.sh manually, it will not be overwritten by any package updates.  You can call functions in this
# library for commong BigBlueButton configuration tasks.

## Start Copying HEre
  cat > /etc/bigbluebutton/bbb-conf/apply-config.sh << HERE
#!/bin/bash

# Pull in the helper functions for configuring BigBlueButton
source /etc/bigbluebutton/bbb-conf/apply-lib.sh

# Available configuration options

#enableHTML5ClientLog
#enableUFWRules

#enableHTML5CameraQualityThresholds
#enableHTML5WebcamPagination

#enableMultipleKurentos

# Shorten the FreeSWITCH "you have been muted" and "you have been unmuted" prompts
# cp -r /etc/bigbluebutton/bbb-conf/sounds /opt/freeswitch/share/freeswitch

HERE
chmod +x /etc/bigbluebutton/bbb-conf/apply-config.sh
## Stop Copying HERE
}

