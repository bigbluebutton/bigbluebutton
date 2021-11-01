#!/bin/sh

write_config_file() {
  mkdir -p /etc/bigbluebutton

        cat <<END > "${OP_CONFIG}"
// include default config from upstream
include "/usr/share/bbb-apps-akka/conf/application.conf"

// you can customize everything here. API endpoint and secret have to be changed
// This file will not be overridden by packages

services {
  bbbWebAPI=${API}
  sharedSecret=${SECRET}
}
END
}

case "$1" in
  install|upgrade|1|2)

    PACKAGE_CONFIG=/usr/share/bbb-apps-akka/conf/application.conf
    OP_CONFIG=/etc/bigbluebutton/bbb-apps-akka.conf
    # this is for upgrading packages from old packaging system where operators had
    # to change the package config file
    if [ ! -f "${OP_CONFIG}" -a -f "${PACKAGE_CONFIG}" ]; then
      API=$(grep bbbWebAPI "${PACKAGE_CONFIG}"  | sed 's/[^=]*=\s*//')
      SECRET=$(grep sharedSecret "${PACKAGE_CONFIG}"  | sed 's/[^=]*=\s*//')
      write_config_file
    fi
    # this is for fresh installs, where no config file exists
    if [ ! -f "${OP_CONFIG}" ]; then
      SECRET='"changeme"'
      API='"https://192.168.23.33/bigbluebutton/api"'
      write_config_file
    fi
esac
