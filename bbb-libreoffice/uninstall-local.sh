#!/bin/bash
set -e

if [ "$EUID" -ne 0 ]; then
	echo "Please run this script as root ( or with sudo )" ;
	exit 1;
fi;

if docker image inspect bbb-soffice &>/dev/null; then
	echo "Removing image"
	docker image rm bbb-soffice
fi

if [[ -d /usr/share/bbb-libreoffice-conversion ]]; then
	echo "Removing install folder"
	rm -rf /usr/share/bbb-libreoffice-conversion/
fi;

if [[ -f /etc/sudoers.d/zzz-bbb-docker-libreoffice ]]; then
	echo "Removing Sudoers file"
	rm /etc/sudoers.d/zzz-bbb-docker-libreoffice
fi;
