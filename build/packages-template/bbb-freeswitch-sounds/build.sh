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

#
# Overwrite "your are now muted"/"you are now unmuted" with short audio sounds.  Thanks senfcall.de!
#
rm -f mute-and-unmute-sounds-master.zip
wget https://gitlab.senfcall.de/senfcall-public/mute-and-unmute-sounds/-/archive/master/mute-and-unmute-sounds-master.zip
rm -rf mute-and-unmute-sounds-master
unzip mute-and-unmute-sounds-master.zip

pushd mute-and-unmute-sounds-master/sounds
 find . -name "*.wav" -exec /bin/bash -c "sox -v 0.3  {} /tmp/tmp.wav; cp /tmp/tmp.wav ../../$DESTDIR/opt/freeswitch/share/freeswitch/sounds/en/us/callie/conference/{}" \;
popd

. ./opts-$DISTRO.sh

fpm -s dir -C $DESTDIR -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --description "FreeSWITCH Sounds" \
    $DIRECTORIES                            \
    $OPTS

