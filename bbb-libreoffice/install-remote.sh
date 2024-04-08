#!/bin/bash
if [ "$EUID" -ne 0 ]; then
	echo "Please run this script as root ( or with sudo )" ;
	exit 1;
fi;

cd "$(dirname "$0")"

FOLDER_CHECK=`[ -d /usr/share/bbb-libreoffice-conversion/ ] && echo 1 || echo 0`
if [ "$FOLDER_CHECK" = "0" ]; then
	echo "Install folder doesn't exists, installing"
	install -Dm755 assets/convert-remote.sh /usr/share/bbb-libreoffice-conversion/convert.sh
	install -Dm755 assets/convert-cool.sh /usr/share/bbb-libreoffice-conversion/convert-cool.sh
	install -Dm755 assets/etherpad-export.sh /usr/share/bbb-libreoffice-conversion/etherpad-export.sh
	chown -R root /usr/share/bbb-libreoffice-conversion/
else
	echo "Install folder already exists"
fi;

