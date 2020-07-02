#!/bin/bash
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


if (($INSTANCE_NUMBER >= 1 && $INSTANCE_NUMBER <= 10)); then
	PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

	_kill

	docker run --name bbb-libreoffice-${INSTANCE_NUMBER} -p 82${INSTANCE_NUMBER}:8000 -v/var/tmp/soffice${INSTANCE_NUMBER}:/var/tmp/soffice${INSTANCE_NUMBER} --rm bbb-libreoffice &

	wait $!
else
	echo ;
	echo "Invalid or missing parameter INSTANCE_NUMBER"
	echo "    Usage: $0 INSTANCE_NUMBER"
	exit 1
fi;
