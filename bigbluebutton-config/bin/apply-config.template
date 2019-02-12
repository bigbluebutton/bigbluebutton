#!/bin/bash -e

# This is a template for apply-config.sh, which if created will be automatically called by
# bbb-conf when you do
#
#   bbb-conf --restart
#   bbb-conf --seitp ... 
#
# To use this template, copy it to apply-config.sh and make it executable
#
#  cp apply-config.template apply-config.sh
#  chmod +x apply-config.sh
#
# You can then uncomment some of the built-in configuration options or add your own.
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


#
# Enable Looging of the HTML5 client for debugging
#
enableHTML5ClientLog() {
  echo "  - Enable HTML5 client log to /var/log/nginx/html5-client.log"

  HTML5_CONFIG=/usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml
  yq w -i $HTML5_CONFIG public.clientLog.external.enabled true
  yq w -i $HTML5_CONFIG public.clientLog.external.url     "$PROTOCOL://$HOST/html5log"

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


#enableHTML5ClientLog

