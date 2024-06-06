#!/bin/bash -e

case "$1" in
    install|upgrade|1|2)
        
        addGroup freeswitch ""
        addUser freeswitch "" freeswitch /opt/freeswitch "freeswitch" /usr/sbin/nologin

        rm -f /tmp/external.xml
        if [ -f /opt/freeswitch/etc/freeswitch/sip_profiles/external.xml ]; then
                cp /opt/freeswitch/etc/freeswitch/sip_profiles/external.xml /tmp/external.xml
        fi

        rm -f /tmp/vars.xml
        if [ -f /opt/freeswitch/etc/freeswitch/vars.xml ]; then
                cp /opt/freeswitch/etc/freeswitch/vars.xml /tmp/vars.xml
        fi

        rm -f /tmp/event_socket.conf.xml
        if [ -f /opt/freeswitch/etc/freeswitch/autoload_configs/event_socket.conf.xml ]; then
                cp /opt/freeswitch/etc/freeswitch/autoload_configs/event_socket.conf.xml /tmp/event_socket.conf.xml
        fi


	if [ -f /.dockerenv ]; then
           # To make it easier, we'll override how systemd runs freeswitch
	   mkdir -p /etc/systemd/system/freeswitch.service.d
           cat <<HERE > /etc/systemd/system/freeswitch.service.d/override.conf
[Service]
Type=simple
Environment="DAEMON_OPTS=-nonat -nf"
HERE
	fi

    ;;

    abort-upgrade)
    ;;

    *)
        echo "## preinst called with unknown argument \`$1'" >&2
    ;;
esac

