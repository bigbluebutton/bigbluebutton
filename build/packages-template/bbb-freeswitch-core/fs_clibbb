#!/bin/bash

# "$@" is placed at the end of the command so it can be used as "fs_clibbb -x 'show channels as json'"
# @ will be replaced by the arguments you pass in the command line.
/opt/freeswitch/bin/fs_cli -p $(xmlstarlet sel -t -m 'configuration/settings/param[@name="password"]' -v @value /opt/freeswitch/etc/freeswitch/autoload_configs/event_socket.conf.xml) "$@"
