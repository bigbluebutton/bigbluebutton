#!/bin/bash

#
# BlueButton open source conferencing system - http://www.bigbluebutton.org/
#
# Copyright (c) 2018 BigBlueButton Inc.
#
# This program is free software; you can redistribute it and/or modify it under the
# terms of the GNU Lesser General Public License as published by the Free Software
# Foundation; either version 3.0 of the License, or (at your option) any later
# version.
#
# BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
# PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License along
# with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
#
set -x

change_var_value () {
        sed -i "s<^[[:blank:]#]*\(${2}\).*<\1=${3}<" $1
}

# docker run -p 80:80/tcp -p 443:443/tcp -p 1935:1935 -p 5066:5066 -p 3478:3478 -p 3478:3478/udp b2 -h 192.168.0.130

while getopts "eh:" opt; do
  case $opt in
    e)
      env
      exit
      ;;
    h)
      HOST=$OPTARG
      ;;
    e)
      SECRET=$OPTARG
      ;;
    :)
      echo "Missing option argument for -$OPTARG" >&2;
      exit 1
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      cat<<HERE
Docker startup script for BigBlueButton.

  -h   Hostname for BigBlueButton server
  -s   Shared secret

HERE
      exit 1
      ;;
    :)
      echo "Option -$OPTARG requires an argument." >&2
      exit 1
      ;;
  esac
done

apt-get install -y bbb-demo && /etc/init.d/tomcat7 start
while [ ! -f /var/lib/tomcat7/webapps/demo/bbb_api_conf.jsp ]; do sleep 1; done
sudo /etc/init.d/tomcat7 stop


# Setup the BigBlueButton configuration files
#
PROTOCOL_HTTP=http
PROTOCOL_RTMP=rtmp

IP=$(echo "$(LANG=c ifconfig  | awk -v RS="" '{gsub (/\n[ ]*inet /," ")}1' | grep ^et.* | grep addr: | head -n1 | sed 's/.*addr://g' | sed 's/ .*//g')$(LANG=c ifconfig  | awk -v RS="" '{gsub (/\n[ ]*inet /," ")}1' | grep ^en.* | grep addr: | head -n1 | sed 's/.*addr://g' | sed 's/ .*//g')" | head -n1)

xmlstarlet edit --inplace --update '//X-PRE-PROCESS[@cmd="set" and starts-with(@data, "external_rtp_ip=")]/@data' --value "stun:coturn" /opt/freeswitch/conf/vars.xml
xmlstarlet edit --inplace --update '//X-PRE-PROCESS[@cmd="set" and starts-with(@data, "external_sip_ip=")]/@data' --value "stun:coturn" /opt/freeswitch/conf/vars.xml
xmlstarlet edit --inplace --update '//X-PRE-PROCESS[@cmd="set" and starts-with(@data, "local_ip_v4=")]/@data' --value "${IP}" /opt/freeswitch/conf/vars.xml

sed -i "s/proxy_pass .*/proxy_pass $PROTOCOL_HTTP:\/\/$IP:5066;/g" /etc/bigbluebutton/nginx/sip.nginx

sed -i "s/http[s]*:\/\/\([^\"\/]*\)\([\"\/]\)/$PROTOCOL_HTTP:\/\/$HOST\2/g"  /var/www/bigbluebutton/client/conf/config.xml
sed -i "s/rtmp[s]*:\/\/\([^\"\/]*\)\([\"\/]\)/$PROTOCOL_RTMP:\/\/$HOST\2/g" /var/www/bigbluebutton/client/conf/config.xml

sed -i "s/server_name  .*/server_name  $HOST;/g" /etc/nginx/sites-available/bigbluebutton

sed -i "s/bigbluebutton.web.serverURL=http[s]*:\/\/.*/bigbluebutton.web.serverURL=$PROTOCOL_HTTP:\/\/$HOST/g" \
  /var/lib/tomcat7/webapps/bigbluebutton/WEB-INF/classes/bigbluebutton.properties

# Update Java screen share configuration
change_var_value /usr/share/red5/webapps/screenshare/WEB-INF/screenshare.properties streamBaseUrl rtmp://$HOST/screenshare
change_var_value /usr/share/red5/webapps/screenshare/WEB-INF/screenshare.properties jnlpUrl $PROTOCOL_HTTP://$HOST/screenshare
change_var_value /usr/share/red5/webapps/screenshare/WEB-INF/screenshare.properties jnlpFile $PROTOCOL_HTTP://$HOST/screenshare/screenshare.jnlp

change_var_value /usr/share/red5/webapps/sip/WEB-INF/bigbluebutton-sip.properties bbb.sip.app.ip $IP
change_var_value /usr/share/red5/webapps/sip/WEB-INF/bigbluebutton-sip.properties freeswitch.ip $IP

sed -i  "s/bbbWebAPI[ ]*=[ ]*\"[^\"]*\"/bbbWebAPI=\"${PROTOCOL_HTTP}:\/\/$HOST\/bigbluebutton\/api\"/g" \
  /usr/share/bbb-apps-akka/conf/application.conf
sed -i "s/bbbWebHost[ ]*=[ ]*\"[^\"]*\"/bbbWebHost=\"$HOST\"/g" \
  /usr/share/bbb-apps-akka/conf/application.conf
sed -i "s/deskshareip[ ]*=[ ]*\"[^\"]*\"/deskshareip=\"$HOST\"/g" \
  /usr/share/bbb-apps-akka/conf/application.conf
sed -i  "s/defaultPresentationURL[ ]*=[ ]*\"[^\"]*\"/defaultPresentationURL=\"${PROTOCOL_HTTP}:\/\/$HOST\/default.pdf\"/g" \
  /usr/share/bbb-apps-akka/conf/application.conf

cat > /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini  << HERE
; Only IP address are supported, not domain names for addresses
; You have to find a valid stun server. You can check if it works
; using this tool:
;   http://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
;stunServerAddress=64.233.177.127
;stunServerPort=19302

turnURL=kurento:kurento@${HOST}:3478

;pemCertificate is deprecated. Please use pemCertificateRSA instead
;pemCertificate=<path>
;pemCertificateRSA=<path>
;pemCertificateECDSA=<path>
HERE

TURN_SECRET=`openssl rand -hex 16`

# Configure coturn to handle incoming UDP connections
cat > /etc/turnserver.conf << HERE
denied-peer-ip=0.0.0.0-255.255.255.255
allowed-peer-ip=$IP
fingerprint
lt-cred-mech
use-auth-secret
static-auth-secret=$TURN_SECRET
user=user:password
log-file=/var/log/turn.log
HERE

# Setup tomcat7 to share the TURN server information with clients (with matching secret)
cat > /var/lib/tomcat7/webapps/bigbluebutton/WEB-INF/spring/turn-stun-servers.xml << HERE
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans" 
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-2.5.xsd">
   <bean id="turn0" class="org.bigbluebutton.web.services.turn.TurnServer">
      <constructor-arg index="0" value="$TURN_SECRET" />
      <constructor-arg index="1" value="turn:$HOST:3478" />
      <constructor-arg index="2" value="86400" />
   </bean>
   <bean id="turn1" class="org.bigbluebutton.web.services.turn.TurnServer">
      <constructor-arg index="0" value="$TURN_SECRET" />
      <constructor-arg index="1" value="turn:$HOST:3478?transport=tcp" />
      <constructor-arg index="2" value="86400" />
   </bean>
   <bean id="stunTurnService" class="org.bigbluebutton.web.services.turn.StunTurnService">
      <property name="stunServers">
         <set />
      </property>
      <property name="turnServers">
         <set>
            <ref bean="turn0" />
            <ref bean="turn1" />
         </set>
      </property>
      <property name="remoteIceCandidates">
         <set />
      </property>
   </bean>
</beans>
HERE

cat > /opt/freeswitch/conf/autoload_configs/acl.conf.xml << HERE
<configuration name="acl.conf" description="Network Lists">
  <network-lists>
    <list name="domains" default="allow">
      <!-- domain= is special it scans the domain from the directory to build the ACL -->
      <node type="allow" domain="\$\${domain}"/>
      <!-- use cidr= if you wish to allow ip ranges to this domains acl. -->
      <!-- <node type="allow" cidr="192.168.0.0/24"/> -->
    </list>

    <list name="webrtc-turn" default="deny">
      <node type="allow" cidr="$IP/32"/>
    </list>

  </network-lists>
</configuration>
HERE


# Ensure bbb-apps-akka has the latest shared secret from bbb-web
SECRET=$(cat /var/lib/tomcat7/webapps/bigbluebutton/WEB-INF/classes/bigbluebutton.properties | grep -v '#' | grep securitySalt | cut -d= -f2);
sed -i "s/sharedSecret[ ]*=[ ]*\"[^\"]*\"/sharedSecret=\"$SECRET\"/g" \
  /usr/share/bbb-apps-akka/conf/application.conf

sed -i "s/BigBlueButtonURL = \"http[s]*:\/\/\([^\"\/]*\)\([\"\/]\)/BigBlueButtonURL = \"$PROTOCOL_HTTP:\/\/$HOST\2/g" \
  /var/lib/tomcat7/webapps/demo/bbb_api_conf.jsp

sed -i "s/playback_host: .*/playback_host: $HOST/g" /usr/local/bigbluebutton/core/scripts/bigbluebutton.yml

sed -i 's/daemonize no/daemonize yes/g' /etc/redis/redis.conf

sed -i "s|\"wsUrl.*|\"wsUrl\": \"ws://$HOST/bbb-webrtc-sfu\",|g" \
  /usr/share/meteor/bundle/programs/server/assets/app/config/settings-production.json

rm /usr/share/red5/log/sip.log

# Add a sleep to each recording process so we can restart with supervisord
# (This works around the limitation that supervisord can't restart after intervals)
sed -i 's/BigBlueButton.logger.debug("rap-archive-worker done")/sleep 20; BigBlueButton.logger.debug("rap-archive-worker done")/g' /usr/local/bigbluebutton/core/scripts/rap-archive-worker.rb
sed -i 's/BigBlueButton.logger.debug("rap-process-worker done")/sleep 20; BigBlueButton.logger.debug("rap-process-worker done")/g' /usr/local/bigbluebutton/core/scripts/rap-process-worker.rb
sed -i 's/BigBlueButton.logger.debug("rap-sanity-worker done")/sleep 20 ; BigBlueButton.logger.debug("rap-sanity-worker done")/g'  /usr/local/bigbluebutton/core/scripts/rap-sanity-worker.rb
sed -i 's/BigBlueButton.logger.debug("rap-publish-worker done")/sleep 20; BigBlueButton.logger.debug("rap-publish-worker done")/g' /usr/local/bigbluebutton/core/scripts/rap-publish-worker.rb

# Start BigBlueButton!
#

export NODE_ENV=production

export DAEMON_LOG=/var/log/kurento-media-server
export GST_DEBUG="3,Kurento*:4,kms*:4"
export KURENTO_LOGS_PATH=$DAEMON_LOG

cat << HERE

BigBlueButton is now starting up at this address

  http://$HOST

HERE

updatedb
exec /usr/bin/supervisord > /var/log/supervisord.log

