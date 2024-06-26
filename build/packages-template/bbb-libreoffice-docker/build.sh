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

if [ $DISTRO != "amzn2" ]; then 
  mkdir -p staging/etc/sudoers.d
  cp assets/zzz-bbb-docker-libreoffice  staging/etc/sudoers.d/zzz-bbb-docker-libreoffice
fi

cp assets/etherpad-export.sh staging/usr/share/bbb-libreoffice-conversion/etherpad-export.sh
cp assets/convert-local.sh  staging/usr/share/bbb-libreoffice-conversion/convert-local.sh
cp assets/convert-remote.sh staging/usr/share/bbb-libreoffice-conversion/convert-remote.sh

chmod +x staging/usr/share/bbb-libreoffice-conversion/convert-local.sh
chmod +x staging/usr/share/bbb-libreoffice-conversion/convert-remote.sh
chmod +x staging/usr/share/bbb-libreoffice-conversion/etherpad-export.sh

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
