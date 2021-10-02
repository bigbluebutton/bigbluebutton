#!/bin/bash -ex


# for versions of bbb-libreoffice-docker before bbb 2.3-beta2
# BBB_LIBREOFFICE_SERVICE_EXISTS=`[systemctl list-units --type service | grep -q 'bbb-libreoffice-' ] && echo 1 || echo 0`
if systemctl list-units --type service | grep -q 'bbb-libreoffice-'; then
	for i in `seq 1 4` ; do
		systemctl stop bbb-libreoffice-0${i} 
		systemctl disable bbb-libreoffice-0${i}
	done
fi

#NETWORK_CHECK=`docker network inspect bbb-libreoffice &> /dev/null && echo 1 || echo 0`
if docker network inspect bbb-libreoffice &> /dev/null; then
	echo "removing bbb-libreoffice docker network"
	docker network remove bbb-libreoffice
else
	echo "not removing bbb-libreoffice docker network"
fi
