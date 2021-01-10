#!/bin/bash
set -e

INSTANCE_NUMBER=$1

if [ -z "$INSTANCE_NUMBER" ]; then
	INSTANCE_NUMBER=0
fi;

_kill() {
	CHECK_CONTAINER=`docker inspect bbb-libreoffice-${INSTANCE_NUMBER} &> /dev/null && echo 1 || echo 0`
	if [ "$CHECK_CONTAINER" = "1" ]; then
		echo "Killing container"
		docker kill bbb-libreoffice-${INSTANCE_NUMBER};
		sleep 1
	fi;
}

trap _kill SIGINT


if (($INSTANCE_NUMBER >= 1)); then
	PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

	_kill

	let PORT=8200+${INSTANCE_NUMBER}

	SOFFICE_WORK_DIR="/var/tmp/soffice_"`printf "%02d\n" $INSTANCE_NUMBER`

	INPUT_RULE="INPUT -i br-soffice -m state --state NEW -j DROP"
	iptables -C $INPUT_RULE || iptables -I $INPUT_RULE

	FORWARD_RULE="FORWARD -i br-soffice -m state --state NEW -j DROP"
	iptables -C $FORWARD_RULE || iptables -I $FORWARD_RULE


	docker run --network bbb-libreoffice --user `id -u bigbluebutton` --name bbb-libreoffice-${INSTANCE_NUMBER} -p $PORT:8000 -v${SOFFICE_WORK_DIR}:${SOFFICE_WORK_DIR} --rm bbb-libreoffice &

	wait $!
else
	echo ;
	echo "Invalid or missing parameter INSTANCE_NUMBER"
	echo "    Usage: $0 INSTANCE_NUMBER"
	exit 1
fi;
