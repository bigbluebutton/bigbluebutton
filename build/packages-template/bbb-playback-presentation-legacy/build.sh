#!/bin/bash -ex

TARGET=`basename $(pwd)`


PACKAGE=$(echo $TARGET | cut -d'_' -f1)
VERSION=$(echo $TARGET | cut -d'_' -f2)
DISTRO=$(echo $TARGET | cut -d'_' -f3)

#
# Clear staging directory for build
rm -rf staging

##

# The 0.81 and 0.9.0 players are served by the static location for
# /playback/presentation that bbb-playback-presentation installs.
mkdir -p staging/var/bigbluebutton/playback/presentation
cp -r playback/presentation/0.81 playback/presentation/0.9.0 staging/var/bigbluebutton/playback/presentation

mkdir -p staging/usr/share/bigbluebutton/nginx
cp presentation-legacy.nginx staging/usr/share/bigbluebutton/nginx

##

. ./opts-$DISTRO.sh

#
# This package only works with a bbb-playback-presentation that no longer
# ships the legacy players and their redirect itself, so it depends on (and
# replaces files of) the version of that package built by the same pipeline.
# GitLab CI may reuse an older bbb-playback-presentation build (listed in
# packages_to_skip.txt); otherwise both packages come from this tree at $VERSION.
# Same lookup as the version pins of the bigbluebutton meta package.
PRESENTATION_VERSION=""
SKIP_FILE="${CI_PROJECT_DIR:-.}/packages_to_skip.txt"
if [ -f "$SKIP_FILE" ]; then
  REUSED_PRESENTATION="$(grep "^bbb-playback-presentation " "$SKIP_FILE" || true)"
  if [ -n "$REUSED_PRESENTATION" ]; then
    PRESENTATION_VERSION=$(echo $REUSED_PRESENTATION | tr '_' ' ' | cut -f3 -d ' ')
  fi
fi
if [ -z "$PRESENTATION_VERSION" ]; then
  PRESENTATION_VERSION="$VERSION"
fi
# add the epoch if not already in the filename
if [[ "$PRESENTATION_VERSION" != "${EPOCH}:"* ]]; then
  PRESENTATION_VERSION="${EPOCH}:${PRESENTATION_VERSION}"
fi

#
# Build package
# The versioned relationships are passed here and not through $OPTS because
# their values contain spaces and $OPTS is expanded unquoted.
fpm -s dir -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --after-install after-install.sh \
    --after-remove after-remove.sh \
    --description "Legacy BigBlueButton presentation recording players (0.81 and 0.9.0)" \
    --depends "bbb-playback-presentation (>= $PRESENTATION_VERSION)" \
    --replaces "bbb-playback-presentation (<< $PRESENTATION_VERSION)" \
    $OPTS
