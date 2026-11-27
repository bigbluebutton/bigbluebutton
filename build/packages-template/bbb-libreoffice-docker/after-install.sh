#!/bin/bash -e

if ! which docker > /dev/null; then
	echo "#"
	echo "# Unable to install bbb-libreoffice-docker -- no docker available"
	echo "#"
	exit 0
fi

# Image that runs soffice
IMAGE="$(cat /usr/share/bbb-libreoffice/docker-image)"

# convert-local.sh runs the image named here. dpkg has just put the sudoers rule for $IMAGE in place, so name it first
install -d -m 0755 /var/lib/bbb-libreoffice
printf '%s\n' "$IMAGE" > /var/lib/bbb-libreoffice/docker-image.new
chmod 0644 /var/lib/bbb-libreoffice/docker-image.new
mv /var/lib/bbb-libreoffice/docker-image.new /var/lib/bbb-libreoffice/docker-image

# docker run pulls a missing image by itself; pull it now so the first conversion does not have to
if ! docker image inspect "$IMAGE" > /dev/null 2>&1; then
	echo "#"
	echo "# Pulling the bbb-libreoffice docker image $IMAGE"
	echo "#"
	docker pull "$IMAGE"
fi

# Earlier packages tagged a local copy of the image as bbb-soffice; nothing uses that alias any more
if docker image inspect bbb-soffice > /dev/null 2>&1; then
	docker image rm bbb-soffice || true
fi


chmod +x /usr/share/bbb-libreoffice-conversion/convert-cool.sh
chmod +x /usr/share/bbb-libreoffice-conversion/convert-local.sh
chmod +x /usr/share/bbb-libreoffice-conversion/convert-remote.sh


if [ ! -L /usr/share/bbb-libreoffice-conversion/convert.sh ]; then
	ln -s /usr/share/bbb-libreoffice-conversion/convert-local.sh /usr/share/bbb-libreoffice-conversion/convert.sh
fi

# Render the sudoers rule for the exact docker run line of convert-local.sh (sudoers wants ':' as '\:');
# build.sh renders the packaged copy of this file the same way
IMAGE_SUDOERS="${IMAGE//:/\\:}"
TEMPLATE="$(cat /usr/share/bbb-libreoffice/zzz-bbb-docker-libreoffice.template)"
echo "${TEMPLATE//@BBB_LIBREOFFICE_IMAGE@/$IMAGE_SUDOERS}" > /etc/sudoers.d/zzz-bbb-docker-libreoffice
chmod 0440 /etc/sudoers.d/zzz-bbb-docker-libreoffice
chown root:root /etc/sudoers.d/zzz-bbb-docker-libreoffice
if command -v visudo > /dev/null; then
	visudo -cqf /etc/sudoers.d/zzz-bbb-docker-libreoffice
fi

# Earlier tags of the image are no longer run; one still in use by a conversion is left for the next upgrade
IMAGE_ID="$(docker image inspect -f '{{.Id}}' "$IMAGE")"
docker image ls --no-trunc --format '{{.ID}} {{.Repository}}:{{.Tag}}' "${IMAGE%:*}" | while read -r id ref; do
	if [ "$id" != "$IMAGE_ID" ] && [ "${ref##*:}" != "<none>" ]; then
		docker image rm "$ref" > /dev/null || true
	fi
done

#for i in `seq 1 4` ; do
#
#	SOFFICE_WORK_DIR="/var/tmp/soffice_"`printf "%02d\n" ${i}`
#	mkdir -p $SOFFICE_WORK_DIR
#	chown bigbluebutton:bigbluebutton $SOFFICE_WORK_DIR
#
#        systemctl enable bbb-libreoffice@${i}
#        systemctl start bbb-libreoffice@${i}
#done

exit 0
