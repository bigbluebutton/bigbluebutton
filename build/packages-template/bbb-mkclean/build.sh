#!/bin/bash -ex

TARGET=`basename $(pwd)`


PACKAGE=$(echo $TARGET | cut -d'_' -f1)
VERSION=$(echo $TARGET | cut -d'_' -f2)
DISTRO=$(echo $TARGET | cut -d'_' -f3)

MKCLEAN_VERSION=0.9.0

#
# Clean up directories
rm -rf staging

if [ ! -f mkclean-$MKCLEAN_VERSION.tar.bz2 ]; then
    wget https://sourceforge.net/projects/matroska/files/mkclean/mkclean-$MKCLEAN_VERSION.tar.bz2/download -O mkclean-$MKCLEAN_VERSION.tar.bz2
fi
if ! sha256sum -c mkclean.sha256sum ; then
    exit 1
fi

if [ ! -d mkclean-$MKCLEAN_VERSION ]; then
  tar -vxjf mkclean-$MKCLEAN_VERSION.tar.bz2
fi

cd mkclean-$MKCLEAN_VERSION

cmake .
make
cd ..

mkdir -p staging/usr/bin
cp mkclean-$MKCLEAN_VERSION/mkclean/mkclean staging/usr/bin

##

. ./opts-$DISTRO.sh


fpm -s dir -t deb -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --description "Clean and optimize Matroska and WebM files" \
    $DIRECTORIES \
    $OPTS
