#!/bin/sh

set -e

case "$1" in
  purge)
    # remove config file added/changed by preinst script
    OP_CONFIG=/etc/bigbluebutton/bbb-apps-akka.conf
    if [ -f "${OP_CONFIG}" ]; then
      rm "${OP_CONFIG}"
    fi
esac
