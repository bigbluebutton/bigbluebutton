#!/bin/bash -e

case "$1" in
    install|upgrade|1|2)
    ;;

    abort-upgrade)
    ;;

    *)
        echo "## preinst called with unknown argument \`$1'" >&2
    ;;
esac

