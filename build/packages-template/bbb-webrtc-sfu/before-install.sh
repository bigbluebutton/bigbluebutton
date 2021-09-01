#!/bin/bash -e

case "$1" in
	install|upgrade|1|2)

		#
		# remember setting for sip
		#
		rm -f /tmp/webrtc-sfu.nginx
		if [ -f /etc/bigbluebutton/nginx/webrtc-sfu.nginx ]; then
			cp /etc/bigbluebutton/nginx/webrtc-sfu.nginx /tmp/webrtc-sfu.nginx
		fi

		rm -f /tmp/bbb-webrtc-sfu-default.yml
		if [ -f /usr/local/bigbluebutton/bbb-webrtc-sfu/config/default.yml ]; then
			cp /usr/local/bigbluebutton/bbb-webrtc-sfu/config/default.yml /tmp/bbb-webrtc-sfu-default.yml
		fi
	;;

	abort-upgrade)
	;;

	*)
		echo "preinst called with unknown argument \`$1'" >&2
		exit 1
	;;
esac

