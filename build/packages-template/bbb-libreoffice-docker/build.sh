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

IMAGE="$(cat docker-image)"

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


cp docker-image                      staging/usr/share/bbb-libreoffice/docker-image
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
