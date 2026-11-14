#!/bin/bash
set -e

if [ "$EUID" -ne 0 ]; then
	echo "Please run this script as root ( or with sudo )" ;
	exit 1;
fi;


if [ -f /usr/share/bbb-libreoffice/docker-image ]; then
	IMAGE="$(cat /usr/share/bbb-libreoffice/docker-image)"
	if docker image inspect "$IMAGE" &> /dev/null; then
		echo "Removing image"
		docker image rm "$IMAGE"
	fi
	rm -rf /usr/share/bbb-libreoffice/
fi

# alias built by versions up to 4.0
if docker image inspect bbb-soffice &> /dev/null; then
	echo "Removing legacy bbb-soffice image"
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
