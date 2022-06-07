#!/bin/bash

/opt/freeswitch/bin/fs_cli -x 'fsctl sync_clock_when_idle' -p $(xmlstarlet sel -t -m 'configuration/settings/param[@name="password"]' -v @value /opt/freeswitch/etc/freeswitch/autoload_configs/event_socket.conf.xml)  > /var/log/freeswitch_sync_clock.log 2>&1
