#!/bin/bash -e

case "$1" in
	install|upgrade|1|2)
		# there might be remaining files from older BBB versions
		# BBB 2.3 and earlier did an npm rebuild in the after-install script.
		rm -rf /usr/local/bigbluebutton/bbb-webrtc-sfu/node_modules
	;;

	abort-upgrade)
	;;

	*)
		echo "preinst called with unknown argument \`$1'" >&2
		exit 1
	;;
esac

