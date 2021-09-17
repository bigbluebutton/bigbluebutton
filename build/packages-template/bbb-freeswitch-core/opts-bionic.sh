. ./opts-global.sh

# mkdir /tmp/debs
# cd /tmp/debs
# wget https://launchpad.net/~kepstin/+archive/ubuntu/opus/+files/libopusenc-dev_0.2.1-1kepstin1_amd64.deb
# wget https://launchpad.net/~kepstin/+archive/ubuntu/opus/+files/libopusenc-doc_0.2.1-1kepstin1_all.deb
# wget https://launchpad.net/~kepstin/+archive/ubuntu/opus/+files/libopusenc0_0.2.1-1kepstin1_amd64.deb
# reprepro --priority optional -b /var/lib/jenkins/reprepro_dev/m22/bionic-2.3.0 includedeb bigbluebutton-bionic *


#OPTS="$OPTS -t deb -d xmlstarlet,libfreetype6,libcurl3,libspeex1,libspeexdsp1,libopus0,libopusfile0,libopusenc0,libsndfile1,liblua5.2-0,libjbig0,libldns1,bbb-freeswitch-sounds --deb-user freeswitch --deb-group daemon --deb-use-file-permissions"
OPTS="$OPTS -t deb -d xmlstarlet,libfreetype6,libcurl4,libspeex1,libspeexdsp1,libopus0,libsndfile1,libopusenc0,libopusfile0,liblua5.2-0,libjbig0,libldns2,bbb-freeswitch-sounds --deb-user freeswitch --deb-group daemon --deb-use-file-permissions"

