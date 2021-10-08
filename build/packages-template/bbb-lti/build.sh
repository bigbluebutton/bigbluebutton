#!/bin/bash -ex

TARGET=`basename $(pwd)`


PACKAGE=$(echo $TARGET | cut -d'_' -f1)
VERSION=$(echo $TARGET | cut -d'_' -f2)
DISTRO=$(echo $TARGET | cut -d'_' -f3)

#
# Clean up directories
rm -rf staging

#
# Create directory for fpm to process
DIRS="/usr/share/bbb-lti"
for dir in $DIRS; do
  mkdir -p staging$dir
  DIRECTORIES="$DIRECTORIES --directories $dir"
done

##

gradle clean
gradle resolveDeps
grails assemble

mkdir -p staging/lib/systemd/system
cp bbb-lti.service staging/lib/systemd/system

mkdir -p staging/etc/bigbluebutton/nginx
cp lti.nginx  staging/etc/bigbluebutton/nginx

mkdir -p staging/usr/share/bbb-lti
cp build/libs/bbb-lti-0.5.war staging/usr/share/bbb-lti

cd staging/usr/share/bbb-lti
jar -xvf bbb-lti-0.5.war
rm bbb-lti-0.5.war
cd ../../../..

cp run-prod.sh staging/usr/share/bbb-lti
chmod +x staging/usr/share/bbb-lti/run-prod.sh

mkdir -p staging/etc/bigbluebutton/nginx
cp lti.nginx  staging/etc/bigbluebutton/nginx

mkdir -p staging/lib/systemd/system
cp bbb-lti.service staging/lib/systemd/system

##

. ./opts-$DISTRO.sh

fpm -s dir -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --after-install after-install.sh        \
    --after-remove  after-remove.sh        \
    --depends unzip                        \
    --description "BigBlueButton endpoint for LTI" \
    $DIRECTORIES \
    $OPTS

