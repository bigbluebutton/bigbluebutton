#!/bin/bash
set -e

if [ "$EUID" -ne 0 ]; then
	echo "Please run this script as root ( or with sudo )" ;
	exit 1;
fi;


FOLDER_CHECK=`[ -d /usr/share/bbb-libreoffice-conversion/ ] && echo 1 || echo 0`
if [ "$FOLDER_CHECK" = "1" ]; then
	echo "Removing install folder"
	rm -rf /usr/share/bbb-libreoffice-conversion/
fi;
