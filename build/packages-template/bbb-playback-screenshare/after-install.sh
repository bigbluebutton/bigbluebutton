#!/bin/bash -e

if [ -f /etc/redhat-release ]; then
  DISTRIB_ID=centos
else
  . /etc/lsb-release    # Get value for DISTRIB_ID
fi


case "$1" in
  configure|upgrade|1|2)
    
    mkdir -p /var/bigbluebutton/published/screenshare
    chown -R bigbluebutton:bigbluebutton /var/bigbluebutton/published/screenshare
    chmod -R o+rx /var/bigbluebutton/published/
    
    mkdir -p /var/log/bigbluebutton/screenshare
    chown -R bigbluebutton:bigbluebutton /var/log/bigbluebutton/screenshare
    
    mkdir -p /var/bigbluebutton/recording/publish/screenshare
    chown -R bigbluebutton:bigbluebutton /var/bigbluebutton/recording/publish/screenshare
    
    if [ -f /var/bigbluebutton/published/screenshare/index.html ]; then
      rm /var/bigbluebutton/published/screenshare/index.html
    fi
 
    if [ ! -f /.dockerenv ]; then
      systemctl restart nginx
    fi
    
  ;;
  
  failed-upgrade)
  ;;

  *)
    echo "## postinst called with unknown argument \`$1'" >&2
  ;;
esac

