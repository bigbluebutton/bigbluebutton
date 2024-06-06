#!/bin/bash -ex

#NETWORK_CHECK=`docker network inspect bbb-libreoffice &> /dev/null && echo 1 || echo 0`
if docker network inspect bbb-libreoffice &> /dev/null; then
	echo "removing bbb-libreoffice docker network"
	docker network remove bbb-libreoffice
else
	echo "not removing bbb-libreoffice docker network"
fi
