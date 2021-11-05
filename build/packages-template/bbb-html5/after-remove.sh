#!/bin/bash -e

case "$1" in
   remove|failed-upgrade|abort-upgrade|abort-install|disappear|0|1)
     if [ -f $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties ]; then
       sed -i 's/svgImagesRequired=true/svgImagesRequired=false/g' $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties
       #if [ ! -f /.dockerenv ]; then
       #  systemctl restart tomcat7
       #elif [ which supervisorctl > /dev/null ]; then
       #  supervisorctl restart tomcat7
       #fi
     fi

   if [ -L /etc/nginx/sites-enabled/bigbluebutton ]; then
     rm /etc/nginx/sites-enabled/bigbluebutton
   fi

   ;;
   purge)
     deleteUser meteor
     deleteGroup meteor
   ;;
   upgrade)
   ;;
   *)
      echo "postinst called with unknown argument $1" >&2
   ;;
esac

