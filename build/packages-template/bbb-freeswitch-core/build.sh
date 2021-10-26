#!/bin/bash -ex

TARGET=`basename $(pwd)`


PACKAGE=$(echo $TARGET | cut -d'_' -f1)
VERSION=$(echo $TARGET | cut -d'_' -f2)
DISTRO=$(echo $TARGET | cut -d'_' -f3)

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

. ./opts-$DISTRO.sh

#cp modules.conf freeswitch
#cd freeswitch

#
# Need to figure out how to build with mod_av
if [ $DISTRO == "centos7" ] || [ $DISTRO == "amzn2" ]; then
  sed -i 's/applications\/mod_av/#applications\/mod_av/g' modules.conf
else
  apt-get update
  apt-get install -y software-properties-common
  add-apt-repository -y ppa:bigbluebutton/support
fi

if [ "$DISTRO" == "bionic" ]; then
	add-apt-repository ppa:bigbluebutton/support -y
  apt-get update
  apt-get install -y libopusfile-dev opus-tools libopusenc-dev
fi

mkdir -p staging

pushd .

# sofia-sip start
if [ ! -d sofia-sip ]; then
  git clone https://github.com/freeswitch/sofia-sip.git
fi
cd sofia-sip/
git checkout v1.13.6
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
git checkout 284fe91dd068d0cf391139110fdc2811043972b9
./bootstrap.sh
./configure

make -j $(nproc)
make install

if [ $DISTRO == "centos7" ] || [ $DISTRO == "amzn2" ]; then
  export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig
  yum install -y opusfile-devel

  git clone https://github.com/xiph/libopusenc.git
  cd libopusenc/
  git checkout dc6ab59ac41a96c5bf262056ea09fa5e2f776fe6
  ./autogen.sh
  ./configure
  make -j $(nproc)
  make install
fi
popd
# spandsp end



# libks start
if [ ! -d libks ]; then
  git clone https://github.com/signalwire/libks.git
fi
cd libks/
git checkout f43b85399f8fc840561566887e768fc877ba2583

cmake .
make

make install
cd ..
# libks end

ldconfig

# we already cloned the FS repo in freeswitch.placeholder.sh and selected tag/branch

patch -p0 < floor.patch

./bootstrap.sh 

./configure --disable-core-odbc-support --disable-core-pgsql-support \
    --without-python --without-erlang --without-java \
    --prefix=/opt/freeswitch CFLAGS="-Wno-error -Og -ggdb" CXXFLAGS="-Wno-error -Og -ggdb"

make -j $(nproc)
make install

DESTDIR=staging
CONFDIR=$DESTDIR/opt/freeswitch/etc/freeswitch

mkdir -p $DESTDIR/opt
cp -r /opt/freeswitch staging/opt

	mkdir -p $DESTDIR/lib/systemd/system
	cp freeswitch.service.${DISTRO} $DESTDIR/lib/systemd/system/freeswitch.service

	mkdir -p $DESTDIR/lib/systemd/system
	cp freeswitch.conf $DESTDIR/lib/systemd/system

        mkdir -p $DESTDIR/var/freeswitch/meetings
	echo "This directory holds *.wav files for FreeSWITCH" > $DESTDIR/var/freeswitch/meetings/readme.txt

	rm -rf $CONFDIR/*
	cp -r config/freeswitch/conf/* $CONFDIR

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

	# Needed for Edge
	# find $DESTDIR/etc/freeswitch -name "*.xml" -exec sed -i 's/ <param name="nonce-ttl" value="60"\/>/ <!--<param name="nonce-ttl" value="60"\/>-->/g' '{}' \;

fpm -s dir -C $DESTDIR -n $PACKAGE \
    --version $VERSION --epoch 2 \
    --before-install before-install.sh      \
    --after-install after-install.sh        \
    --before-remove before-remove.sh        \
    --after-remove after-remove.sh         \
    --description "BigBlueButton build of FreeSWITCH" \
    $DIRECTORIES                            \
    $OPTS

