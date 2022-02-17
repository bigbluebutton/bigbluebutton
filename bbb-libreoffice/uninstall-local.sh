#!/bin/bash
set -e

if [ "$EUID" -ne 0 ]; then
	echo "Please run this script as root ( or with sudo )" ;
	exit 1;
fi;


IMAGE_CHECK=`docker image inspect bbb-soffice 2>&1 > /dev/null && echo 1 || echo 0`
if [ "$IMAGE_CHECK"  = "1" ]; then
	echo "Removing image"
	docker image rm bbb-soffice
fi

FOLDER_CHECK=`[ -d /usr/share/bbb-libreoffice-conversion/ ] && echo 1 || echo 0`
if [ "$FOLDER_CHECK" = "1" ]; then
	echo "Removing install folder"
	rm -rf /usr/share/bbb-libreoffice-conversion/
fi;

FILE_SUDOERS_CHECK=`[ -f /etc/sudoers.d/zzz-bbb-docker-libreoffice ] && echo 1 || echo 0`
if [ "$FILE_SUDOERS_CHECK" = "1" ]; then
	echo "Removing Sudoers file"
	rm /etc/sudoers.d/zzz-bbb-docker-libreoffice
fi;
