#!/bin/bash -e

case "$1" in
    install|upgrade|1|2)

        # We want to ensure Redis is fully started before it signals it is ready to rely on
        mkdir -p /etc/systemd/system/redis-server.service.d
        cat <<HERE > /etc/systemd/system/redis-server.service.d/overrride.conf
[Service]
ExecStartPost=/usr/bin/timeout 30 sh -c 'while ! ss -H -t -l -n sport = :6379 | grep -q "^LISTEN.*:6379"; do sleep 1; done'
HERE
    ;;

    abort-upgrade)
    ;;

    *)
        echo "## preinst called with unknown argument \`$1'" >&2
    ;;
esac
