#!/bin/bash -ex

TARGET=`basename $(pwd)`


PACKAGE=$(echo $TARGET | cut -d'_' -f1)
VERSION=$(echo $TARGET | cut -d'_' -f2)
DISTRO=$(echo $TARGET | cut -d'_' -f3)
TAG=$(echo $TARGET | cut -d'_' -f4)

#
# Clean up directories
rm -rf staging

#
# package

# New format
if [ -f private/config/settings.yml ]; then
  sed -i "s/HTML5_CLIENT_VERSION/$(($VERSION))/" private/config/settings.yml
fi

mkdir -p staging/etc/bigbluebutton/nginx
cp $DISTRO/bbb-html5.nginx staging/etc/bigbluebutton/nginx

mkdir -p staging/etc/nginx/conf.d
cp $DISTRO/bbb-html5-loadbalancer.conf staging/etc/nginx/conf.d


mkdir -p staging/etc/systemd/system
cp $DISTRO/mongod.service staging/etc/systemd/system

mkdir -p staging/usr/share/meteor

rm -rf /tmp/html5-build
mkdir -p /tmp/html5-build

meteor npm -v
meteor node -v
cat .meteor/release

# meteor version control was moved to the Dockerfile of the image used in .gitlab-ci.yml
# meteor update --allow-superuser --release 2.3.6

# build the HTML5 client
meteor npm ci --production

METEOR_DISABLE_OPTIMISTIC_CACHING=1 meteor build /tmp/html5-build --architecture os.linux.x86_64 --allow-superuser

# extract, install the npm dependencies, then copy to staging
tar xfz /tmp/html5-build/bbb-html5_${VERSION}_${DISTRO}.tar.gz -C /tmp/html5-build/
cd /tmp/html5-build/bundle/programs/server/
npm i --production
cd -
cp -r /tmp/html5-build/bundle staging/usr/share/meteor


cp $DISTRO/systemd_start.sh staging/usr/share/meteor/bundle
chmod +x staging/usr/share/meteor/bundle/systemd_start.sh

cp $DISTRO/systemd_start_frontend.sh staging/usr/share/meteor/bundle
chmod +x staging/usr/share/meteor/bundle/systemd_start_frontend.sh

cp $DISTRO/workers-start.sh staging/usr/share/meteor/bundle
chmod +x staging/usr/share/meteor/bundle/workers-start.sh

cp $DISTRO/bbb-html5-with-roles.conf staging/usr/share/meteor/bundle

cp mongod_start_pre.sh staging/usr/share/meteor/bundle
chmod +x staging/usr/share/meteor/bundle/mongod_start_pre.sh

cp $DISTRO/mongo-ramdisk.conf staging/usr/share/meteor/bundle

mkdir -p staging/usr/lib/systemd/system
cp $DISTRO/bbb-html5.service staging/usr/lib/systemd/system
cp disable-transparent-huge-pages.service staging/usr/lib/systemd/system

cp $DISTRO/bbb-html5-backend@.service staging/usr/lib/systemd/system
cp $DISTRO/bbb-html5-frontend@.service staging/usr/lib/systemd/system


mkdir -p staging/usr/share

if [ ! -f node-v14.17.6-linux-x64.tar.gz ]; then
  wget https://nodejs.org/dist/v14.17.6/node-v14.17.6-linux-x64.tar.gz
fi

cp node-v14.17.6-linux-x64.tar.gz staging/usr/share

if [ -f staging/usr/share/meteor/bundle/programs/web.browser/head.html ]; then
  sed -i "s/VERSION/$(($BUILD))/" staging/usr/share/meteor/bundle/programs/web.browser/head.html
fi

mkdir -p staging/etc/nginx/sites-available
cp bigbluebutton.nginx staging/etc/nginx/sites-available/bigbluebutton

mkdir -p staging/etc/bigbluebutton/nginx
cp sip.nginx staging/etc/bigbluebutton/nginx

mkdir -p staging/var/www/bigbluebutton
touch staging/var/www/bigbluebutton/index.html

. ./opts-$DISTRO.sh

#
# Build RPM package
fpm -s dir -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --before-install before-install.sh \
    --after-install after-install.sh \
    --before-remove before-remove.sh \
    --after-remove after-remove.sh \
    --description "The HTML5 components for BigBlueButton" \
    $DIRECTORIES \
    $OPTS
