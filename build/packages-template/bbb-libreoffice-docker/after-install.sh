#!/bin/bash -e

if ! which docker > /dev/null; then
	echo "#"
	echo "# Unable to install bbb-libreoffice-docker -- no docker available"
	echo "#"
	exit 0
fi

#if ! docker image inspect bbb-soffice > /dev/null 2>&1; then
	cd /usr/share/bbb-libreoffice
	echo "#"
	echo "# Building bbb-libreoffice docker image"
	echo "#"
	docker build -t bbb-soffice docker/
#fi


chmod +x /usr/share/bbb-libreoffice-conversion/convert-cool.sh
chmod +x /usr/share/bbb-libreoffice-conversion/convert-local.sh
chmod +x /usr/share/bbb-libreoffice-conversion/convert-remote.sh
chmod +x /usr/share/bbb-libreoffice-conversion/etherpad-export.sh


if [ ! -L /usr/share/bbb-libreoffice-conversion/convert.sh ]; then
	ln -s /usr/share/bbb-libreoffice-conversion/convert-local.sh /usr/share/bbb-libreoffice-conversion/convert.sh
fi

exit 0
