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

if [ "$DISTRO" == "xenial" ]; then
  apt-get update
  apt-get install -y libopusfile-dev opus-tools libopusenc-dev
fi

if [ "$DISTRO" == "bionic" ]; then
	  add-apt-repository ppa:bigbluebutton/support -y
#  cat > /etc/apt/sources.list.d/kepstin-ubuntu-opus-bionic.list << HERE
#deb http://ppa.launchpad.net/kepstin/opus/ubuntu xenial main
# deb-src http://ppa.launchpad.net/kepstin/opus/ubuntu xenial main
#HERE
  apt-get update
  apt-get install -y libopusfile-dev opus-tools libopusenc-dev
fi

mkdir -p staging

pushd .
if [ ! -d sofia-sip ]; then
  git clone https://github.com/freeswitch/sofia-sip.git
fi
cd sofia-sip/
git pull
./bootstrap.sh
./configure
#make DESTDIR=/var/tmp/bbb-freeswitch-core_2.3.0_bionic_develop/staging install
make -j $(nproc)
make install
cd ..

if [ ! -d spandsp ]; then
  git clone https://github.com/freeswitch/spandsp.git
fi
cd spandsp/
git pull
./bootstrap.sh
./configure

make -j $(nproc)
make install

if [ $DISTRO == "centos7" ] || [ $DISTRO == "amzn2" ]; then
  export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig
  yum install -y opusfile-devel

  git clone https://github.com/xiph/libopusenc.git
  cd libopusenc/
  ./autogen.sh
  ./configure
  make -j $(nproc)
  make install
fi

popd

#cat > /etc/ld.so.conf.d/myapp.conf << HERE
#/var/tmp/bbb-freeswitch-core_2.3.0_bionic_develop/staging/usr/local/lib
#HERE
ldconfig

#pushd /tmp
#git clone https://git.xiph.org/libopusenc.git
#cd libopusenc
#./autogen.sh
#./configure
#make install
#popd


git fetch
git fetch --tags
git reset --hard
git checkout master
git pull

#git apply ../crash-fix2.patch

# Fix websocket lock
#cp ../websocket-fix/tport.c libs/sofia-sip/libsofia-sip-ua/tport/tport.c
#cp ../websocket-fix/tport_type_ws.c libs/sofia-sip/libsofia-sip-ua/tport/tport_type_ws.c


#cp ../opus-fix/mod_opusfile.c src/mod/formats/mod_opusfile/mod_opusfile.c
#cp ../opus-fix/Makefile.am src/mod/formats/mod_opusfile/Makefile.am


#if [ "$DISTRO" == "bionic" ];then
#  sed -i 's/formats\/mod_opusfile//g' modules.conf
#  sed -i 's/<load module="mod_opusfile"\/>//g' ../conf/modules.conf.xml
#fi

patch -p0 < floor.patch

./bootstrap.sh 
./configure --disable-core-odbc-support --disable-core-pgsql-support \
    --without-python --without-erlang --without-java \
    --prefix=/opt/freeswitch CFLAGS="-Wno-error -Og -ggdb" CXXFLAGS="-Wno-error -Og -ggdb"
#    --prefix=/opt/freeswitch CFLAGS="-Wno-error -O3 -ggdb" CXXFLAGS="-Wno-error -Og -ggdb"

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

        #mkdir -p $DESTDIR/etc/default
	#cp freeswitch.default $DESTDIR/etc/default/freeswitch

   if [ 1 == 0 ]; then
	cp conf/acl.conf.xml $CONFDIR/autoload_configs
	cp conf/opus.conf.xml $CONFDIR/autoload_configs
	
	# Leave these here in case administrator wants to try other settings for Opus
	#
	# find $(DESTDIR)/opt/freeswitch/sounds -type d -name 32000 -exec rm -rf '{}' \;
	# find $(DESTDIR)/opt/freeswitch/sounds -type d -name 48000 -exec rm -rf '{}' \;

	cp conf/vars.xml $CONFDIR

	cp conf/external.xml $CONFDIR/sip_profiles
	cp conf/external-ipv6.xml $CONFDIR/sip_profiles
	cp conf/internal-ipv6.xml $CONFDIR/sip_profiles
	cp conf/internal.xml $CONFDIR/sip_profiles
	cp conf/public.xml $CONFDIR/dialplan

	rm -rf $CONFDIR/directory/default/*
	cp conf/bbbuser.xml $CONFDIR/directory/default

	cp conf/modules.conf.xml $CONFDIR/autoload_configs
	cp conf/conference.conf.xml $CONFDIR/autoload_configs
	cp conf/switch.conf.xml $CONFDIR/autoload_configs
	# cp conf/verto.conf.xml $CONFDIR/autoload_configs

	rm -rf $CONFDIR/dialplan/default/*
	rm -rf $CONFDIR/dialplan/public/*

	cp conf/bbb_conference.xml $CONFDIR/dialplan/default
	cp conf/bbb_echo_test.xml $CONFDIR/dialplan/default
	cp conf/bbb_echo_to_conference.xml $CONFDIR/dialplan/default

	cp conf/default.xml $CONFDIR/dialplan

	cp conf/bbb_sip.xml $CONFDIR/dialplan/public
	cp conf/bbb_webrtc.xml $CONFDIR/dialplan/public

        mkdir -p $CONFDIR/tls

  else 
	rm -rf $CONFDIR/*
	cp -r config/freeswitch/conf/* $CONFDIR
  fi

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

