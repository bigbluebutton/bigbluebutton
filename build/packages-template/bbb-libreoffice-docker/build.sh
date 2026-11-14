#!/bin/bash -ex

TARGET=`basename $(pwd)`


PACKAGE=$(echo $TARGET | cut -d'_' -f1)
VERSION=$(echo $TARGET | cut -d'_' -f2)
DISTRO=$(echo $TARGET | cut -d'_' -f3)

DIRS="/usr/share/bbb-libreoffice /usr/share/bbb-libreoffice-conversion"
for dir in $DIRS; do
  mkdir -p staging$dir
  DIRECTORIES="$DIRECTORIES --directories $dir"
done

##

# The image the package runs LibreOffice from: the FROM line of docker/Dockerfile, which is what
# dependabot bumps and what the api-conformance stack reads too
IMAGE="$(sed -n 's/^FROM //p' docker/Dockerfile)"
[ -n "$IMAGE" ] || { echo "build.sh: no FROM line in docker/Dockerfile" >&2; exit 1; }

if [ $DISTRO != "amzn2" ]; then 
  mkdir -p staging/etc/sudoers.d
  # same rendering as after-install.sh, so the packaged conffile matches what it writes
  IMAGE_SUDOERS="${IMAGE//:/\\:}"
  TEMPLATE="$(cat assets/zzz-bbb-docker-libreoffice)"
  echo "${TEMPLATE//@BBB_LIBREOFFICE_IMAGE@/$IMAGE_SUDOERS}" > staging/etc/sudoers.d/zzz-bbb-docker-libreoffice
  chmod 0440 staging/etc/sudoers.d/zzz-bbb-docker-libreoffice
fi

cp assets/convert-local.sh  staging/usr/share/bbb-libreoffice-conversion/convert-cool.sh
cp assets/convert-local.sh  staging/usr/share/bbb-libreoffice-conversion/convert-local.sh
cp assets/convert-remote.sh staging/usr/share/bbb-libreoffice-conversion/convert-remote.sh

chmod +x staging/usr/share/bbb-libreoffice-conversion/convert-cool.sh
chmod +x staging/usr/share/bbb-libreoffice-conversion/convert-local.sh
chmod +x staging/usr/share/bbb-libreoffice-conversion/convert-remote.sh


# after-install.sh, convert-local.sh and uninstall-local.sh read the image from this one-line file
printf '%s\n' "$IMAGE" > staging/usr/share/bbb-libreoffice/docker-image
cp assets/zzz-bbb-docker-libreoffice staging/usr/share/bbb-libreoffice/zzz-bbb-docker-libreoffice.template

##

. ./opts-$DISTRO.sh

fpm -s dir -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --after-install after-install.sh        \
    --before-remove before-remove.sh        \
    --after-remove after-remove.sh          \
    --description "BigBlueButton setup for LibreOffice running in docker" \
    $DIRECTORIES \
    $OPTS
