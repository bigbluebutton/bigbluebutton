#!/usr/bin/env bash
#
# Copyright (c) 2008-2019 by BigBlueButton Inc.
# Copyright (c) 2017-2019 by Dumalogiya (https://dumalogiya.ru)
#
# Documentation: 
#   http://code.google.com/p/bigbluebutton/wiki/Testing
#
# This file is part of BigBlueButton - http://www.bigbluebutton.org
#
# BigBlueButton is free software; you can redistribute it and/or modify it under the
# terms of the GNU Lesser General Public License as published by the Free Software
# Foundation; either version 2 of the License, or (at your option) any later
# version.
#
# BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
# PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License along
# with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
#
# Author(s):
#       Fred Dixon <ffdixon@bigbluebutton.org>
#       Mikhail Novosyolov <mikhailnov@dumalogiya.ru>
#
# Changelog:
#   2011-01-22 FFD  Inital Version
#   2017-03-08 Mikhail Novosyolov <mikhailnov@dumalogiya.ru>, v0.2:
#    - changed Firefox command line call for its new API
#   2019-03-31 Mikhail Novosyolov <mikhailnov@dumalogiya.ru>, v0.3:
#    - Chromium-based browsers support
#    - new tabs/windows switch
#    - better portatibility (bash may be not /bin/bash on BSD systems, 'which' command is not POSIX-compatible)
#    - detect local IP via hostname command
#    - allow passing arguements to script in any order
#    - allow connecting via HTTPS
#    - allow setting custom sleep time

VERSION=0.3
IP="$(hostname -I | cut -f1 -d' ')"

while [ -n "$1" ]; do
        case $1 in
                --x|-x) set -x ;;
                --h|-h) shift; HOST="$1" ;;
                --n|-n) shift; NUMBER="$1" ;;
                --b|-b) shift; BROWSER="$1" ;;
                --m|-m) shift; NEWOBJ="$1" ;;
                --s|-s) shift; SLEEP="$1" ;;
                *)		echo "$0: Unrecognized option: $1" >&2; exit 1 ;;
        esac
        shift
done

if [ -z "$HOST" ] || [ -z "$NUMBER" ]; then
        echo "BigBlueButton Testing Utility - Version $VERSION"
        echo
        echo "$0 [options]"
        echo
        echo "To launch BigBlueButton clients that connect to remote server:"
        echo "   -x debug mode (optional, default off)"
        echo "   -h remote_bigbluebutton_host"
        echo "   -n number_of_clients"
        echo "   -b web_browser_command (optional, Firefox and Chromium/Chrome are supported, Firefox is default)"
        echo "   -m tab|window (Open new tabs or new windows in the browser, default is tabs)"
        echo "   -s Sleep time in seconds between opening new connections, default is 5"
        echo
        echo "Examples:"
        echo "   $0 -h 192.168.0.104 -n 10"
        echo "   $0 -h 192.168.0.104 -n 10 -b chromium-browser -m window"
        echo "   $0 -h https://192.168.0.104 -n 10 -b firefox -s 5"
        exit 1
fi

#
# We'll use a get request to demo1.jsp to create clients
# bbb-demo must be installed on the server
#
# http://192.168.0.104/bigbluebutton/demo/demo1.jsp?username=Fred2&action=create

# HOST="http://$HOST/bigbluebutton/demo/demo1.jsp?action=create&username=user"
if ! echo "$HOST" | grep -qE '^http://|^https://'; then
	HOST="http://${HOST}"
fi
BROWSER="${BROWSER:-firefox}"
NEWOBJ="${NEWOBJ:-tab}"
SLEEP="${SLEEP:-5}"

case "$BROWSER" in
	firefox*|newmoon*|palemoon* )
		BROWSER_ARGS="-new-${NEWOBJ} -url"
		;;
	*chrome*|chromium*|opera*|vivaldi*|yandex* )
		BROWSER_ARGS="--new-${NEWOBJ}"
		;;
esac

REQUIRED_CMD="wget ${BROWSER}"
for cmd in ${REQUIRED_CMD}
do
	if ! command -v "$cmd" >/dev/null 2>&1; then
		echo "Unable to locate ${cmd}"
		exit 1
	fi
done

if ! wget "${HOST}/bigbluebutton/api" -O - --quiet | grep -q SUCCESS; then
	echo "Startup unsuccessful: could not connect to $HOST/api"
        exit 1
fi

i=0
while [ $i != "$NUMBER" ]; do
	echo "Connecting user $IP-$i"
	"$BROWSER" ${BROWSER_ARGS} "$HOST/demo/demo1.jsp?action=create&username=${IP}-${i}" &
	
	# We'll give BigBlueButton a moment to process the incoming request from this IP.  
	# If we try to open 10 clients at the same time, the session IDs for each client will
	# likely not go to the specific tab (as thay all share the same IP address)
	sleep "$SLEEP"

	i=$[$i+1]
done
echo
