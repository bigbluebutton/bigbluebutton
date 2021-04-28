#!/bin/bash
if [ "$EUID" -ne 0 ]; then
	echo "Please run this script as root ( or with sudo )" ;
	exit 1;
fi;

cd "$(dirname "$0")"

: ${SOFFICE_VARIANT:=free}

if [ "$SOFFICE_VARIANT" = "nonfree" ]; then
    echo "You will now be presented with the EULA governing Microsoft Core Fonts."
    echo "Press Enter to start pager..."
    read -s
    pager EULA.txt
    echo "Press Enter to accept the EULA, or Ctrl-C to abort installation..."
    read -s
else
    echo "By default, free replacements for the Microsoft Core Fonts are installed."
    echo "To install the non-free fonts under Microsoft's EULA, set SOFFICE_VARIANT=nonfree in the environment."
fi

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

IMAGE_CHECK=`docker image inspect bbb-soffice &> /dev/null && echo 1 || echo 0`
if [ "$IMAGE_CHECK"  = "0" ]; then
	echo "Docker image doesn't exists, building"
	docker build --target soffice-$SOFFICE_VARIANT -t bbb-soffice docker/
else
	echo "Docker image already exists";
fi

FOLDER_CHECK=`[ -d /usr/share/bbb-libreoffice-conversion/ ] && echo 1 || echo 0`
if [ "$FOLDER_CHECK" = "0" ]; then
	echo "Install folder doesn't exists, installing"
	mkdir -m 755 /usr/share/bbb-libreoffice-conversion/
	cp assets/convert-local.sh /usr/share/bbb-libreoffice-conversion/convert.sh
	chmod 755 /usr/share/bbb-libreoffice-conversion/convert.sh
	cp assets/etherpad-export.sh /usr/share/bbb-libreoffice-conversion/etherpad-export.sh
	chmod 755 /usr/share/bbb-libreoffice-conversion/etherpad-export.sh
	chown -R root /usr/share/bbb-libreoffice-conversion/
else
	echo "Install folder already exists"
fi;

FILE_SUDOERS_CHECK=`[ -f /etc/sudoers.d/zzz-bbb-docker-libreoffice ] && echo 1 || echo 0`
if [ "$FILE_SUDOERS_CHECK" = "0" ]; then
	echo "Sudoers file doesn't exists, installing"
	cp assets/zzz-bbb-docker-libreoffice /etc/sudoers.d/zzz-bbb-docker-libreoffice
else
	echo "Sudoers file already exists"
fi;

