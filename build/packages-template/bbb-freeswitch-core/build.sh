#!/bin/bash -ex

TARGET=`basename $(pwd)`


PACKAGE=$(echo $TARGET | cut -d'_' -f1)
VERSION=$(echo $TARGET | cut -d'_' -f2)
DISTRO=$(echo $TARGET | cut -d'_' -f3)

BUILDDIR=$PWD
DESTDIR=$BUILDDIR/staging
CONFDIR=$DESTDIR/opt/freeswitch/etc/freeswitch

#
# Clear staging directory for build

rm -rf $DESTDIR
mkdir -p $DESTDIR

##

. ./opts-$DISTRO.sh

cp modules.conf $BUILDDIR/freeswitch
cd $BUILDDIR/freeswitch

pushd .

# sofia-sip start
if [ ! -d sofia-sip ]; then
  git clone https://github.com/freeswitch/sofia-sip.git
fi
cd sofia-sip/
git checkout v1.13.12
./bootstrap.sh
./configure

make -j $(nproc)
make install
cd ..
# sofia-sip end

# spandsp start
if [ ! -d spandsp ]; then
  git clone https://github.com/freeswitch/spandsp.git
fi
cd spandsp/
git checkout e59ca8fb8b1591e626e6a12fdc60a2ebe83435ed
./bootstrap.sh
./configure

make -j $(nproc)
make install

popd
# spandsp end



# libks start
if [ ! -d libks ]; then
  git clone https://github.com/signalwire/libks.git
fi
cd libks/
git checkout v1.8.2

cmake .
make

make install
cd ..
# libks end

ldconfig

# we already cloned the FS repo in freeswitch.placeholder.sh and selected tag/branch

cd $BUILDDIR/freeswitch

patch -p0 < $BUILDDIR/floor.patch
patch -p0 --ignore-whitespace < $BUILDDIR/audio.patch       # Provisional patch for https://github.com/signalwire/freeswitch/pull/1531

# Patch: https://github.com/signalwire/freeswitch/pull/1914
#   There are some long-standing issues with the way FreeSWITCH changes
#   candidate pairs based on connectivity checks. That generally manifests
#   as: 1) an asymmetric start time between inbound and outbound audio (eg
#   inbound audio takes 20 seconds to come in while outbound works right out
#   of the bat 2) wrong pairs being picked initially and FS taking longer
#   than ideal to find a new one 3) 1006s 4) ...
#
#   This ports signalwire/freeswitch/pull/1914 in an attempt to mitigate
#   the aforementioned issues. The PR description explains the rationale
#   rather well and seems sound.
patch -p1 < $BUILDDIR/1914.patch

./bootstrap.sh

./configure --disable-core-odbc-support --disable-core-pgsql-support \
    --without-python --without-erlang --without-java \
    --prefix=/opt/freeswitch

# Overrides for generating debug version
#   --prefix=/opt/freeswitch CFLAGS="-Wno-error -Og -ggdb" CXXFLAGS="-Wno-error -Og -ggdb"

make -j $(nproc)
make install

mkdir -p $DESTDIR/opt
cp -r /opt/freeswitch $DESTDIR/opt

cd $BUILDDIR

	mkdir -p $DESTDIR/lib/systemd/system
	cp freeswitch.service.${DISTRO} $DESTDIR/lib/systemd/system/freeswitch.service

	mkdir -p $DESTDIR/lib/systemd/system
	cp freeswitch.conf $DESTDIR/lib/systemd/system

        mkdir -p $DESTDIR/var/freeswitch/meetings
	echo "This directory holds *.wav files for FreeSWITCH" > $DESTDIR/var/freeswitch/meetings/readme.txt

	rm -rf $CONFDIR/*
	cp -r bbb-voice-conference/config/freeswitch/conf/* $CONFDIR

	pushd $DESTDIR/opt/freeswitch
	ln -s ./etc/freeswitch conf
	ln -s ./var/log/freeswitch log
	popd

	# Install libraries for sofia-sip and spandsp
        mkdir -p $DESTDIR/etc/ld.so.conf.d
	cat > $DESTDIR/etc/ld.so.conf.d/freeswitch.conf << HERE
/opt/freeswitch/lib
HERE

	files="sip-date sip-dig sip-options stunc addrinfo localinfo"
	for file in $files; do
	  cp /usr/local/bin/$file $DESTDIR/opt/freeswitch/bin
	done

	cp -P /usr/local/lib/lib* $DESTDIR/opt/freeswitch/lib

  if [ -f /etc/system-release ]; then
    cp /usr/lib64/libopusfile.so.0.4.4 $DESTDIR/opt/freeswitch/lib
    cp /usr/lib64/libopusurl.so.0.4.4 $DESTDIR/opt/freeswitch/lib
    pushd $DESTDIR/opt/freeswitch/lib
      ln -s libopusfile.so.0.4.4 libopusfile.so
      ln -s libopusurl.so.0.4.4 libopusurl.so
    popd
  fi

  mkdir -p $DESTDIR/usr/local/bin
	cp fs_clibbb $DESTDIR/usr/local/bin
	chmod +x $DESTDIR/usr/local/bin/fs_clibbb

	rm -rf $DESTDIR/usr/lib/tmpfiles.d

fpm -s dir -C $DESTDIR -n $PACKAGE \
    --version $VERSION --epoch 2 \
    --before-install before-install.sh      \
    --after-install after-install.sh        \
    --before-remove before-remove.sh        \
    --after-remove after-remove.sh         \
    --description "BigBlueButton build of FreeSWITCH" \
    $DIRECTORIES                            \
    $OPTS
