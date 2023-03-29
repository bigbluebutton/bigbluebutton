#!/bin/bash -ex

TARGET=`basename $(pwd)`


PACKAGE=$(echo $TARGET | cut -d'_' -f1)
VERSION=$(echo $TARGET | cut -d'_' -f2)
DISTRO=$(echo $TARGET | cut -d'_' -f3)
TAG=$(echo $TARGET | cut -d'_' -f4)
BUILD=$1

#
# Clean up directories
rm -rf staging

#
# package

# New format
if [ -f private/config/settings.yml ]; then
  sed -i "s/HTML5_CLIENT_VERSION/$(($BUILD))/g" private/config/settings.yml
fi

mkdir -p staging/usr/share/bigbluebutton/nginx
cp bbb-html5.nginx staging/usr/share/bigbluebutton/nginx

mkdir -p staging/etc/nginx/conf.d
cp bbb-html5-loadbalancer.conf staging/etc/nginx/conf.d
cp bbb-html5-conn-limit.conf staging/etc/nginx/conf.d


mkdir -p staging/etc/systemd/system
cp mongod.service staging/etc/systemd/system

mkdir -p staging/usr/share/meteor

rm -rf /tmp/html5-build
mkdir -p /tmp/html5-build

npm -v
meteor npm -v
meteor node -v
cat .meteor/release

# meteor version control was moved to the Dockerfile of the image used in .gitlab-ci.yml
# meteor update --allow-superuser --release 2.3.6

# Install the npm dependencies needed for the HTML5 client.
# Argument 'c' means package-lock.json will be respected
# --production means we won't be installing devDependencies
meteor npm ci --production

# deleting links as they were repeatedly broken (node_modules/acorn/bin mostly)
# I have not seen this on npm 8+ but meteor npm is still at 6.x right now
# https://forums.meteor.com/t/broken-symbolic-link-on-running-app/57770/3
find node_modules/.bin -xtype l -delete

# Build the HTML5 client https://guide.meteor.com/deployment.html#custom-deployment
# https://docs.meteor.com/environment-variables.html#METEOR-DISABLE-OPTIMISTIC-CACHING - disable caching because we're only building once
# --allow-superuser
# --directory - instead of creating tar.gz and then extracting (which is the default option)
METEOR_DISABLE_OPTIMISTIC_CACHING=1 meteor build /tmp/html5-build --architecture os.linux.x86_64 --allow-superuser --directory

# Install the npm dependencies, then copy to staging
cd /tmp/html5-build/bundle/programs/server/

# Install Meteor related dependencies
# Note that we don't use "c" argument as there is no package-lock.json here
# only package.json. The dependencies for bbb-html5 are already installed in
# /usr/share/meteor/bundle/programs/server/npm/node_modules/ and not in
# /usr/share/meteor/bundle/programs/server/node_modules
npm i
cd -
cp -r /tmp/html5-build/bundle staging/usr/share/meteor

# copy over tl;draw fonts due to a preset path
mkdir -p staging/usr/share/meteor/bundle/programs/web.browser/app/files
cp node_modules/@fontsource/*/files/*.woff[2] staging/usr/share/meteor/bundle/programs/web.browser/app/files/

cp systemd_start.sh staging/usr/share/meteor/bundle
chmod +x staging/usr/share/meteor/bundle/systemd_start.sh

cp systemd_start_frontend.sh staging/usr/share/meteor/bundle
chmod +x staging/usr/share/meteor/bundle/systemd_start_frontend.sh

cp workers-start.sh staging/usr/share/meteor/bundle
chmod +x staging/usr/share/meteor/bundle/workers-start.sh

cp bbb-html5-with-roles.conf staging/usr/share/meteor/bundle

cp mongod_start_pre.sh staging/usr/share/meteor/bundle
chmod +x staging/usr/share/meteor/bundle/mongod_start_pre.sh

cp mongo-ramdisk.conf staging/usr/share/meteor/bundle

mkdir -p staging/usr/lib/systemd/system
cp bbb-html5.service staging/usr/lib/systemd/system
cp disable-transparent-huge-pages.service staging/usr/lib/systemd/system

cp bbb-html5-backend@.service staging/usr/lib/systemd/system
cp bbb-html5-frontend@.service staging/usr/lib/systemd/system


mkdir -p staging/usr/share

# replace v=VERSION with build number in head and css files
if [ -f staging/usr/share/meteor/bundle/programs/web.browser/head.html ]; then
  sed -i "s/VERSION/$(($BUILD))/g" staging/usr/share/meteor/bundle/programs/web.browser/head.html
fi

find staging/usr/share/meteor/bundle/programs/web.browser -name '*.css' -exec sed -i "s/VERSION/$(($BUILD))/g" '{}' \;

# Compress CSS, Javascript and tensorflow WASM binaries used for virtual backgrounds. Keep the
# uncompressed versions as well so it works with mismatched nginx location blocks
find staging/usr/share/meteor/bundle/programs/web.browser -name '*.js' -exec gzip -k -f -9 '{}' \;
find staging/usr/share/meteor/bundle/programs/web.browser -name '*.css' -exec gzip -k -f -9 '{}' \;
find staging/usr/share/meteor/bundle/programs/web.browser -name '*.wasm' -exec gzip -k -f -9 '{}' \;

mkdir -p staging/etc/nginx/sites-available
cp bigbluebutton.nginx staging/etc/nginx/sites-available/bigbluebutton

mkdir -p staging/usr/share/bigbluebutton/nginx
cp sip.nginx staging/usr/share/bigbluebutton/nginx

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
    $OPTS \
    -d 'yq (>= 3)' -d 'yq (<< 4)'
