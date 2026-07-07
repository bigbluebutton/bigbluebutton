#!/bin/bash -ex

TARGET=$(basename "$(pwd)")

PACKAGE=$(echo $TARGET | cut -d'_' -f1)
VERSION=$(echo $TARGET | cut -d'_' -f2)
DISTRO=$(echo $TARGET | cut -d'_' -f3)
TAG=$(echo $TARGET | cut -d'_' -f4)

#
# Clean up directories
rm -rf staging

#
# package

# Create directory for fpm to process
DIRS="/usr/share/bbb-file-upload /usr/share/bbb-file-upload/config /usr/share/bigbluebutton/nginx"
for dir in $DIRS; do
  mkdir -p staging$dir
  DIRECTORIES="$DIRECTORIES --directories $dir"
done

# Set nginx location
cp bbb-file-upload.nginx staging/usr/share/bigbluebutton/nginx

echo "Npm version:"
npm -v
echo "Node version:"
node -v

# Build bbb-file-upload
npm ci --no-progress
npm run build

mv dist/index.js dist/bbb-file-upload.js
cp -r dist/* staging/usr/share/bbb-file-upload
cp package.json staging/usr/share/bbb-file-upload
cp package-lock.json staging/usr/share/bbb-file-upload
cp config/default.yml staging/usr/share/bbb-file-upload/config
cp -r node_modules staging/usr/share/bbb-file-upload

chmod 755 staging/usr/share/bbb-file-upload

# Setup service
mkdir -p staging/usr/lib/systemd/system
cp bbb-file-upload.service staging/usr/lib/systemd/system

. ./opts-$DISTRO.sh

#
# Build package
fpm -s dir -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --after-install after-install.sh \
    --before-install before-install.sh \
    --before-remove before-remove.sh \
    --after-remove after-remove.sh \
    --description "BigBlueButton File Upload Server" \
    $DIRECTORIES \
    $OPTS \
    -d 'nodejs (>= 18)' -d 'nodejs (<< 23)'
