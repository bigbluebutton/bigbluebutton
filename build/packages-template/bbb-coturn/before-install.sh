#!/bin/bash -e

case "$1" in
    install|upgrade|1|2)
        # The group has to exist before the user, addUser passes --gid.
        addGroup turnserver ""
        addUser turnserver "" turnserver "" "Coturn TURN server user" "/usr/sbin/nologin"
    ;;

    abort-upgrade)
    ;;

    *)
        echo "preinst called with unknown argument \`$1'" >&2
    ;;
esac
