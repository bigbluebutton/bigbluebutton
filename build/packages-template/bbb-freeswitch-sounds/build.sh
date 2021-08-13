#!/bin/bash -ex

TARGET=`basename $(pwd)`


PACKAGE=$(echo $TARGET | cut -d'_' -f1)
VERSION=$(echo $TARGET | cut -d'_' -f2)
DISTRO=$(echo $TARGET | cut -d'_' -f3)

#VERSION=1.6.7

#
# Clear staging directory for build
rm -rf staging

#
# Create directory for fpm to process
#DIRS="/opt/freeswitch \
#      /var/freeswitch/meetings"
#for dir in $DIRS; do
#  mkdir -p staging$dir
#  DIRECTORIES="$DIRECTORIES --directories $dir"
#done

##

##

DESTDIR=staging
CONFDIR=$DESTDIR/opt/freeswitch/etc/freeswitch

mkdir -p $DESTDIR/opt/freeswitch/share/freeswitch
if [ ! -f sounds.tar.gz ] ; then
    wget http://bigbluebutton.org/downloads/sounds.tar.gz -O sounds.tar.gz
fi
tar xvfz sounds.tar.gz -C $DESTDIR/opt/freeswitch/share/freeswitch

. ./opts-$DISTRO.sh

fpm -s dir -C $DESTDIR -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --description "FreeSWITCH Sounds" \
    $DIRECTORIES                            \
    $OPTS

