#!/bin/bash
if [ "$EUID" -ne 0 ]; then
	echo "Please run this script as root ( or with sudo )" ;
	exit 1;
fi;

DOCKER_CHECK=`docker --version &> /dev/null && echo 1 || echo 0`

if [ "$DOCKER_CHECK"  = "0" ]; then
	echo "Docker not found";
	apt update;
	apt install apt-transport-https ca-certificates curl software-properties-common
	curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
	add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable"
	apt update
	apt install docker-ce -y
	systemctl enable docker
	systemctl start docker
	systemctl status docker
else
	echo "Docker already installed";
fi


IMAGE_CHECK=`docker image inspect bbb-libreoffice &> /dev/null && echo 1 || echo 0`
if [ "$IMAGE_CHECK"  = "0" ]; then
	echo "Docker image doesn't exists, building"
	docker build --no-cache -t bbb-libreoffice docker/
else
	echo "Docker image already exists";
fi

NETWORK_CHECK=`docker network inspect bbb-libreoffice &> /dev/null && echo 1 || echo 0`

if [ "$NETWORK_CHECK" = "0" ]; then
	echo "Docker network doesn't exists, creating"
	docker network create bbb-libreoffice -d bridge --opt com.docker.network.bridge.name=br-soffice 
fi

FOLDER_CHECK=`[ -d /usr/share/bbb-libreoffice/ ] && echo 1 || echo 0`
if [ "$FOLDER_CHECK" = "0" ]; then
	echo "Install folder doesn't exists, installing"
	mkdir -m 755 /usr/share/bbb-libreoffice/
	cp assets/libreoffice_container.sh /usr/share/bbb-libreoffice/
	chmod 700 /usr/share/bbb-libreoffice/libreoffice_container.sh
	chown -R root /usr/share/bbb-libreoffice/

	cp assets/bbb-libreoffice.service /lib/systemd/system/bbb-libreoffice@.service
	systemctl daemon-reload

	for i in `seq 1 4` ; do
		systemctl enable bbb-libreoffice@${i}
		systemctl start bbb-libreoffice@${i}
	done

else
	echo "Install folder already exists"
fi;

