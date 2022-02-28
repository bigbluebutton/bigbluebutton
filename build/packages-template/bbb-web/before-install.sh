#!/bin/bash -e

case "$1" in
    install|upgrade|1|2)
        
        rm -f /tmp/bigbluebutton.properties
        if [ -f $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties ]; then
          cp $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties /tmp
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

