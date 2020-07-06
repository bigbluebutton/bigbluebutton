#!/bin/bash
if [ "$EUID" -ne 0 ]; then
        echo "Please run this script as root ( or with sudo )" ;
        exit 1;
fi;

IMAGE_CHECK=`docker image inspect bbb-libreoffice 2>&1 > /dev/null && echo 1 || echo 0`
if [ "$IMAGE_CHECK"  = "1" ]; then
        echo "Stopping services"
        systemctl --no-pager --no-legend --value --state=running | grep bbb-libreoffice | awk -F '.service' '{print $1}' | xargs -n 1 systemctl stop

	echo "Removing image"
	docker image rm bbb-libreoffice
fi


FOLDER_CHECK=`[ -d /usr/share/bbb-libreoffice/ ] && echo 1 || echo 0`
if [ "$FOLDER_CHECK" = "1" ]; then
	echo "Stopping services"
        systemctl --no-pager --no-legend --value --state=running | grep bbb-libreoffice | awk -F '.service' '{print $1}' | xargs -n 1 systemctl stop

	echo "Removing install folder"
	rm -rf /usr/share/bbb-libreoffice/

	echo "Removing service definitions"
	rm /lib/systemd/system/bbb-libreoffice-0*
	find /etc/systemd/ | grep bbb-libreoffice | xargs --no-run-if-empty -n 1 -I __ rm __
	systemctl daemon-reload
fi;
