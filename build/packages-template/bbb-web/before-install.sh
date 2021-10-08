#!/bin/bash -e

case "$1" in
    install|upgrade|1|2)
        
        #addGroup bigbluebutton ""
        #addUser bigbluebutton "" freeswitch /opt/freeswitch "freeswitch" /bin/bash

        rm -f /tmp/bigbluebutton.properties
        if [ -f /var/lib/tomcat7/webapps/bigbluebutton/WEB-INF/classes/bigbluebutton.properties ]; then
          mv -f /var/lib/tomcat7/webapps/bigbluebutton/WEB-INF/classes/bigbluebutton.properties /tmp
          # Disable as not yet supported in HTML5 client
          sed -i 's/^defaultGuestPolicy=.*/defaultGuestPolicy=ALWAYS_ACCEPT/' /tmp/bigbluebutton.properties
          rm /var/lib/tomcat7/webapps/bigbluebutton.war
        else  
          if [ -f $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties ]; then
            cp $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties /tmp
          fi
        fi

        if [ -f $SERVLET_DIR/WEB-INF/classes/spring/turn-stun-servers.xml ]; then
          cp $SERVLET_DIR/WEB-INF/classes/spring/turn-stun-servers.xml /tmp
        fi

    ;;

    abort-upgrade)
    ;;

    *)
        echo "## preinst called with unknown argument \`$1'" >&2
    ;;
esac

