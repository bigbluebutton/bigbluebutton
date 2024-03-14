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

HTML5_CONFIG=/etc/bigbluebutton/bbb-html5.yml
if [ ! -f "${HTML5_CONFIG}" ]; then
  touch $HTML5_CONFIG
fi

#
# Enable Looging of the HTML5 client for debugging
#
enableHTML5ClientLog() {
  echo "  - Enable HTML5 client log to /var/log/nginx/html5-client.log"

  yq e -i '.public.clientLog.external.enabled = true' $HTML5_CONFIG
  yq e -i ".public.clientLog.external.url = \"$PROTOCOL://$HOST/html5log\"" $HTML5_CONFIG
  yq e -i '.public.app.askForFeedbackOnLogout = true' $HTML5_CONFIG
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

   # Check if haproxy is running on this server and, if so, open port 3478 on ufw

  if systemctl is-enabled haproxy> /dev/null 2>&1; then
    if systemctl -q is-active haproxy; then
      echo "  - Local haproxy detected and running -- opening port 3478"
      ufw allow 3478
      # echo "  - Forcing FireFox to use turn server"
      # yq e -i '.public.kurento.forceRelayOnFirefox = true' $HTML5_CONFIG
    else
      if grep -q 3478 /etc/ufw/user.rules; then
        echo "  - Local haproxy not running -- closing port 3478"
        ufw delete allow 3478
      fi
    fi
  else
    if grep -q 3478 /etc/ufw/user.rules; then
      echo "  - Local haproxy not running -- closing port 3478"
      ufw delete allow 3478
    fi
  fi

  ufw --force enable
}


notCalled() {
#
# This function is not called.

# Instead, it gives you the ability to copy the following text and paste it into the shell to create a starting point for
# apply-config.sh.
#
# By creating apply-config.sh manually, it will not be overwritten by any package updates.  You can call functions in this
# library for common BigBlueButton configuration tasks.

## Start Copying Here
  cat > /etc/bigbluebutton/bbb-conf/apply-config.sh << HERE
#!/bin/bash

# Pull in the helper functions for configuring BigBlueButton
source /etc/bigbluebutton/bbb-conf/apply-lib.sh

# Available configuration options

#enableHTML5ClientLog
#enableUFWRules


# Shorten the FreeSWITCH "you have been muted" and "you have been unmuted" prompts
# cp -r /etc/bigbluebutton/bbb-conf/sounds /opt/freeswitch/share/freeswitch

HERE
chmod +x /etc/bigbluebutton/bbb-conf/apply-config.sh
## Stop Copying HERE
}

