#!/bin/bash
if [ "$EUID" -ne 0 ]; then
	echo "Please run this script as root ( or with sudo )" ;
	exit 1;
fi;

cd "$(dirname "$0")" || exit 1

podman() {
    # shellcheck disable=SC2068
    runuser -u "$SUDO_USER" podman -- $@
}

PODMAN_CHECK=$(podman --version &> /dev/null && echo 1 || echo 0)

if [ "$PODMAN_CHECK"  = "0" ]; then
	echo "Podman not found";
	apt update
	apt install podman
else
	echo "Podman already installed";
fi

IMAGE_CHECK=$(podman image inspect bbb-soffice &> /dev/null && echo 1 || echo 0)
if [ "$IMAGE_CHECK"  = "0" ]; then
	echo "Container image doesn't exists, building"
	runuser -u "$SUDO_USER" podman build -t bbb-soffice docker/
else
	echo "Container image already exists";
fi

install  -m755 -o root -g root -d /usr/share/bbb-libreoffice-conversion 
install -Dm755 -o root -g root assets/convert-local.sh /usr/share/bbb-libreoffice-conversion/convert.sh
install -Dm755 -o root -g root assets/convert-cool.sh /usr/share/bbb-libreoffice-conversion/convert-cool.sh
install -Dm755 -o root -g root assets/etherpad-export.sh /usr/share/bbb-libreoffice-conversion/etherpad-export.sh

apt install -y --no-install-recommends \
	fonts-arkpandora fonts-crosextra-carlito \
	fonts-crosextra-caladea fonts-noto fonts-noto-cjk \
	fonts-liberation fonts-arkpandora
