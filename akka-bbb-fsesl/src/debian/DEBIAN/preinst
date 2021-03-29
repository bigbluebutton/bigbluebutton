#!/bin/sh

set -e

write_config_file() {
  mkdir -p /etc/bigbluebutton

        cat <<END > "${OP_CONFIG}"
// include default config from upstream
include "${PACKAGE_CONFIG}"

// you can customize everything starting from here.
freeswitch {
    esl {
        password="ClueCon"
    }
}
END
}

case "$1" in
  install|upgrade|1|2)

    PACKAGE_CONFIG=/usr/share/bbb-fsesl-akka/conf/application.conf
    OP_CONFIG=/etc/bigbluebutton/bbb-fsesl-akka.conf
    # create config file if it does not exist
    if [ ! -f "${OP_CONFIG}" ]; then
      write_config_file
    fi
esac
