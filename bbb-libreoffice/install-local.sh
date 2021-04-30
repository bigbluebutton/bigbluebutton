#!/bin/bash
if [ "$EUID" -ne 0 ]; then
	echo "Please run this script as root ( or with sudo )" ;
	exit 1;
fi;

cd "$(dirname "$0")"

if command -v docker &>/dev/null; then
	echo "Docker already installed";
else
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
fi

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

aptInstalledList=$(apt list --installed "fonts*" 2>/dev/null|awk -F'/' 'NR>1{print $1}')
fontInstalled=0

for font in fonts-arkpandora fonts-crosextra-carlito fonts-crosextra-caladea fonts-noto fonts-noto-cjk fonts-liberation fonts-arkpandora
do
	if [[ -n $(echo "$aptInstalledList" | grep "$font") ]]; then
		echo "Font $font already installed"
	else
		echo "Font $font doesn't exists, installing"
		apt install -y --no-install-recommends $font
		fontInstalled=1
	fi
done

if [ $fontInstalled = "1" ]; then
	dpkg-reconfigure fontconfig && fc-cache -f -s -v
fi
