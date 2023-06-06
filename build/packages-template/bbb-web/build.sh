#!/bin/bash -ex

TARGET=`basename $(pwd)`


PACKAGE=$(echo $TARGET | cut -d'_' -f1)
DISTRO=$(echo $TARGET | cut -d'_' -f3)
set -e -x
echo "START BUILDING in $PWD"
#
# Clean up directories
STAGING="$PWD/staging"
rm -rf $STAGING

. ./opts-$DISTRO.sh

#
# Create directory for fpm to process
DIRS="/var/bigbluebutton/configs /var/log/bigbluebutton /var/log/bigbluebutton/html5"
for dir in $DIRS; do
  mkdir -p "${STAGING}/${dir}"
done

mkdir -p ~/.sbt/1.0
echo 'resolvers += "Artima Maven Repository" at "https://repo.artima.com/releases"' > ~/.sbt/1.0/global.sbt

##

# [ $DISTRO == "centos6" ] && JAVA_HOME=/usr/lib/jvm/java-1.11.0-openjdk-1.11.0.91-1.b14.el6.x86_64

EPHEMERAL_VERSION=0.0.$(date +%s)-SNAPSHOT
sed -i "s|\(version := \)\".*|\1\"$EPHEMERAL_VERSION\"|g" bbb-common-message/build.sbt
find -name build.gradle -exec sed -i "s|\(.*org.bigbluebutton.*bbb-common-message[^:]*\):.*|\1:$EPHEMERAL_VERSION\"|g" {} \;
find -name build.sbt -exec sed -i "s|\(.*org.bigbluebutton.*bbb-common-message[^\"]*\"[ ]*%[ ]*\)\"[^\"]*\"\(.*\)|\1\"$EPHEMERAL_VERSION\"\2|g" {} \;

sed -i "s|\(version := \)\".*|\1\"$EPHEMERAL_VERSION\"|g" bbb-common-web/build.sbt
find -name build.gradle -exec sed -i "s|\(.*org.bigbluebutton.*bbb-common-web[^:]*\):.*|\1:$EPHEMERAL_VERSION\"|g" {} \;
find -name build.sbt -exec sed -i "s|\(.*org.bigbluebutton.*bbb-common-web[^\"]*\"[ ]*%[ ]*\)\"[^\"]*\"\(.*\)|\1\"$EPHEMERAL_VERSION\"\2|g" {} \;

sed -i 's/\r$//' bbb-common-web/project/Dependencies.scala
sed -i 's|\(val bbbCommons = \)"[^"]*"$|\1"EPHEMERAL_VERSION"|g' bbb-common-web/project/Dependencies.scala
sed -i "s/EPHEMERAL_VERSION/$EPHEMERAL_VERSION/g" bbb-common-web/project/Dependencies.scala

echo start building bbb-common-message
cd bbb-common-message
sbt publish
sbt publishLocal
cd ..
echo end building bbb-common-message

# New project directory containing parts of bbb-web
cd bbb-common-web
sbt update
sbt publish
sbt publishLocal
cd ..

cd bigbluebutton-web
# Build new version of bbb-web
gradle clean
gradle resolveDeps
grails assemble

# Build presentation checker
if [ -d pres-checker ]; then
  cd pres-checker
    gradle clean
    gradle resolveDeps
    gradle jar
    mkdir -p "$STAGING"/usr/share/prescheck/lib
    cp lib/* "$STAGING"/usr/share/prescheck/lib
    cp build/libs/bbb-pres-check-0.0.1.jar "$STAGING"/usr/share/prescheck/lib
    cp run.sh "$STAGING"/usr/share/prescheck/prescheck.sh
    chmod +x "$STAGING"/usr/share/prescheck/prescheck.sh
  cd ..
fi

echo $PWD

mkdir -p "$STAGING"/usr/share/bbb-web
mv build/libs/bigbluebutton-0.10.0.war "$STAGING"/usr/share/bbb-web

mkdir -p "$STAGING"/etc/default
cp ../bbb-web.env "$STAGING"/etc/default/bbb-web

mkdir -p "$STAGING"/lib/systemd/system
cp ../bbb-web.service "$STAGING"/lib/systemd/system

pushd "$STAGING"/usr/share/bbb-web
jar -xvf bigbluebutton-0.10.0.war
rm bigbluebutton-0.10.0.war
popd
pwd

# Copy this as simply 'web' and we'll make a symbolic link later in the .postinst script
mkdir -p "$STAGING"/usr/share/bigbluebutton/nginx
cp bbb-web.nginx "$STAGING"/usr/share/bigbluebutton/nginx/web
cp loadbalancer.nginx "$STAGING"/usr/share/bigbluebutton/nginx/loadbalancer.nginx

mkdir -p "$STAGING"/var/log/bigbluebutton
# Copy directive for serving SVG files (HTML5) from nginx
if [ -f nginx-confs/presentation-slides.nginx ]; then
  cp nginx-confs/presentation-slides.nginx "$STAGING"/usr/share/bigbluebutton/nginx
fi

mkdir -p "$STAGING"/var/bigbluebutton/diagnostics

##
cd ..

fpm -s dir -C "$STAGING" -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --before-install before-install.sh      \
    --after-install after-install.sh        \
    --description "BigBlueButton API" \
    $DIRECTORIES \
    $OPTS
