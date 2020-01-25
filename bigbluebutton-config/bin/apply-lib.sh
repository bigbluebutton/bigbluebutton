# This is a library of functions for 
#
#  /etc/bigbluebutton/bbb-conf/apply-config.sh
#
# which (if exists) will be run by `bbb-conf --setip` and `bbb-conf --restart` before restarting
# BigBlueButton.
#
# The purpose of apply-config.sh is to make it easy for you apply defaults to BigBlueButton server that get applied after
# each package update (since the last step in doing an upate is to run `bbb-conf --setip`.
#


if LANG=c ifconfig | grep -q 'venet0:0'; then
  # IP detection for OpenVZ environment
  IP=$(ifconfig | grep -v '127.0.0.1' | grep -E "[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*" | tail -1 | cut -d: -f2 | awk '{ print $1}')
else
  IP=$(hostname -I | sed 's/ .*//g')
fi

if [ -f /usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties ]; then
  SERVLET_DIR=/usr/share/bbb-web
else
  SERVLET_DIR=/var/lib/tomcat7/webapps/bigbluebutton
fi

PROTOCOL=http
if [ -f $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties ]; then
  SERVER_URL=$(cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties | sed -n '/^bigbluebutton.web.serverURL/{s/.*\///;p}')
  if cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties | grep bigbluebutton.web.serverURL | grep -q https; then
    PROTOCOL=https
  fi
fi

HOST=$(cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties | grep -v '#' | sed -n '/^bigbluebutton.web.serverURL/{s/.*\///;p}')

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

  cat > /etc/bigbluebutton/nginx/html5-client-log.nginx << HERE
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


# Enable firewall rules to lock down access to server
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

HERE
chmod +x /etc/bigbluebutton/bbb-conf/apply-config.sh
## Stop Copying HERE
}

