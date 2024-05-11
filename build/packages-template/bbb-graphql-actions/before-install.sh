#!/bin/bash -e

case "$1" in
    install|upgrade|1|2)

    # handle renaming circa dec 2023
    if [[ -d /usr/local/bigbluebutton/bbb-graphql-actions-adapter-server ]] ; then
        stopService bbb-graphql-actions-adapter-server || echo "bbb-graphql-actions-adapter-server could not be unregistered or stopped"
        rm -f /usr/lib/systemd/system/bbb-graphql-actions-adapter-server.service
        systemctl daemon-reload
        rm -rf /usr/local/bigbluebutton/bbb-graphql-actions-adapter-server/
    fi
    ;;

    abort-upgrade)
    ;;

    *)
        echo "## preinst called with unknown argument \`$1'" >&2
    ;;
esac
