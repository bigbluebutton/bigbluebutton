#!/bin/bash

#
# BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
#
# Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
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

#
#Redis configuration file
#
REDIS_CONF_FILE=/etc/redis/redis.conf

#
#Log file
#
ARCHIVE_LOG_FILE=/var/log/bigbluebutton/archive.log

#
#Error strings patterns
#
GENERAL_ERROR_PATTERN="Failed to"



#
#BigBlueButton-apps,desksahre,video,web configuration files
#
APPS_PROPS="/usr/share/red5/webapps/bigbluebutton/WEB-INF/bigbluebutton.properties"
DESKSHARE_PROPS="/usr/share/red5/webapps/deskshare/WEB-INF/deskshare.properties"
VIDEO_PROPS="/usr/share/red5/webapps/video/WEB-INF/bigbluebutton-video.properties"
WEB_PROPS="/var/lib/tomcat6/webapps/bigbluebutton/WEB-INF/classes/bigbluebutton.properties"
declare -A prop_files
prop_files=([apps]=$APPS_PROPS [deskshare]=$DESKSHARE_PROPS [video]=$VIDEO_PROPS [web]=$WEB_PROPS)



#
#Redis port in use.  Its value is set in /etc/redis/redis.conf
#
redis_port=`grep '^port \d*' $REDIS_CONF_FILE | awk '{print $2}'`


#
#Check redis port in bigbluebutton-apps,deskshare,video,web
#If not equal to redis port in /etc/redis/redis.conf => show problem, else OK
#
check_redis_port(){
  echo " -- Checking Redis port in Bigbluebutton configuration files --"
  for i in "${!prop_files[@]}"
  do
    port=`grep -i 'redis[.]*port=\d*' ${prop_files[$i]} | cut -d "=" -f2 | sed 's/\s//g'`
    if [ $port -ne $redis_port ];
    then
      echo "Configured redis port<$port> in bigbluebutton-$i does not match Redis port<$redis_port> in use"
    else
      echo "bigbluebutton-$i redis port <$port> is OK"
    fi
  done
}


#
#Set redis port in  bigbluebutton-apps,deskshare,video,web to port value in  redis configuration file
#
set_redis_port(){
  echo " -- Setting Redis port<$redis_port> in BigBlueButton configuration files -- "
  for i in "${!prop_files[@]}"
  do
    #sudo sed -i "s/\(redis[.]*port=\)\([0-9]*.*\)/\1$1/gI" ${prop_files[$i]} 
    sudo sed -i "s/\(redis[.]*port=\)\([0-9]*.*\)/\1$redis_port/gI" ${prop_files[$i]} 
   done
}


#
#Show configured redis host in bigbluebutton-apps,deskshare,video,web
#
check_redis_host(){
  echo " -- Checking Redis host in Bigbluebutton configuration files --"
  for i in "${!prop_files[@]}"
  do
    host=`grep -i 'redis[.]*host=.*' ${prop_files[$i]} | cut -d "=" -f2 | sed 's/\s//g'`
    echo "Configured redis host in bigbluebutton-$i is: $host"
  done
}



#
#Set redis host in  bigbluebutton-apps,deskshare,video,web 
#input param : host
#
set_redis_host(){
  echo " -- Setting Redis host<$1> in BigBlueButton configuration files -- "
  for i in "${!prop_files[@]}"
  do
    sudo sed -i "s/\(redis[.]*host=\)\(.*\)/\1$1/gI" ${prop_files[$i]} 
  done
}



#
#Scan errors in archive log file
#
scan_errors(){
 meetings=`grep "$GENERAL_ERROR_PATTERN" "$ARCHIVE_LOG_FILE" | awk '{print $6}' | uniq`
 echo "  -- There are potential ERRORS in the following meeting ids -- "
 echo "$meetings"
}
