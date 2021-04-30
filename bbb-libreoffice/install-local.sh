#!/bin/bash
if [ "$EUID" -ne 0 ]; then
	echo "Please run this script as root ( or with sudo )" ;
	exit 1;
fi;

cd "$(dirname "$0")"

if docker image inspect bbb-soffice &>/dev/null; then
	echo "Docker image already exists";
else
	echo "Docker image doesn't exists, building"
	docker build -t bbb-soffice docker/
fi

if [[ -d /usr/share/bbb-libreoffice-conversion ]]; then
	echo "Install folder already exists"
else
	echo "Install folder doesn't exists, installing"
	mkdir -m 755 /usr/share/bbb-libreoffice-conversion/
	cp assets/convert-local.sh /usr/share/bbb-libreoffice-conversion/convert.sh
	chmod 755 /usr/share/bbb-libreoffice-conversion/convert.sh
	cp assets/etherpad-export.sh /usr/share/bbb-libreoffice-conversion/etherpad-export.sh
	chmod 755 /usr/share/bbb-libreoffice-conversion/etherpad-export.sh
	chown -R root /usr/share/bbb-libreoffice-conversion/
fi;

if [[ -f /etc/sudoers.d/zzz-bbb-docker-libreoffice ]]; then
	echo "Sudoers file already exists"
else
	echo "Sudoers file doesn't exists, installing"
	cp assets/zzz-bbb-docker-libreoffice /etc/sudoers.d/zzz-bbb-docker-libreoffice
fi;

