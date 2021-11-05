#!/bin/bash -e

case "$1" in
    install|upgrade|1|2)
        
        if [ -f /usr/share/bbb-lti/WEB-INF/classes/lti-config.properties ]; then
          cp /usr/share/bbb-lti/WEB-INF/classes/lti-config.properties /tmp
        fi

    ;;

    abort-upgrade)
    ;;

    *)
        echo "## preinst called with unknown argument \`$1'" >&2
    ;;
esac

