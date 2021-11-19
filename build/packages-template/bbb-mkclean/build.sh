#!/bin/bash -ex

TARGET=`basename $(pwd)`


PACKAGE=$(echo $TARGET | cut -d'_' -f1)
VERSION=$(echo $TARGET | cut -d'_' -f2)
DISTRO=$(echo $TARGET | cut -d'_' -f3)

#VERSION=0.8.7

#
# Clean up directories
rm -rf staging

if [ ! -f mkclean-0.8.10.tar.bz2 ]; then
    wget https://netcologne.dl.sourceforge.net/project/matroska/mkclean/mkclean-0.8.10.tar.bz2 -O mkclean-0.8.10.tar.bz2
fi
if ! sha256sum -c mkclean.sha256sum ; then
    exit 1
fi

if [ ! -d mkclean-0.8.10 ]; then
  tar -vxjf mkclean-0.8.10.tar.bz2
fi

cd mkclean-0.8.10

make -C corec/tools/coremake
corec/tools/coremake/coremake $(corec/tools/coremake/system_output.sh)

make
cd ..

mkdir -p staging/usr/bin
cp mkclean-0.8.10/release/gcc_linux_x64/mkclean staging/usr/bin

##

. ./opts-$DISTRO.sh


fpm -s dir -t deb -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --description "Clean and optimize Matroska and WebM files" \
    $DIRECTORIES \
    $OPTS

