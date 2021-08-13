#!/bin/bash -e

case "$1" in
	install|upgrade|1|2)

		#
		# remember setting for sip
		#
		rm -f /tmp/webhooks.nginx
		if [ -f /etc/bigbluebutton/nginx/webhooks.nginx ]; then
			cp /etc/bigbluebutton/nginx/webhooks.nginx /tmp/webhooks.nginx
		fi

		rm -f /tmp/bbb-webhooks-default.yml
		if [ -f /usr/local/bigbluebutton/bbb-webhooks/config/default.yml ]; then
			cp /usr/local/bigbluebutton/bbb-webhooks/config/default.yml /tmp/bbb-webhooks-default.yml
		fi
	;;

	abort-upgrade)
	;;

	*)
		echo "preinst called with unknown argument \`$1'" >&2
		exit 1
	;;
esac

