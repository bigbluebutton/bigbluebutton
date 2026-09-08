#!/bin/bash -e

case "$1" in
    remove|0)
        stopService coturn || echo "coturn could not be unregistered or stopped"
    ;;
    upgrade|deconfigure|failed-upgrade|1)
        # On upgrade, leave the service running: the old binary keeps serving
        # until after-install restarts it, so the relay never stays down.
    ;;
    *)
        stopService coturn || echo "coturn could not be unregistered or stopped"
    ;;
esac
