#!/bin/bash -ex

if [ -z "$VERSION" ]; then
  echo "[ERROR] no \$VERSION passed in environment, exiting"
  exit 1
fi

if [ -n "$EPOCH" ]; then
  VERSION="$EPOCH:$VERSION"
fi

if [ -n "$CI_PROJECT_DIR" ]; then
  cp $CI_PROJECT_DIR/packages_to_skip.txt .
fi

PKGS="bbb-apps-akka
bbb-config
bbb-etherpad
bbb-freeswitch-core
bbb-freeswitch-sounds
bbb-fsesl-akka
bbb-html5
bbb-learning-dashboard
bbb-libreoffice-docker
bbb-mkclean
bbb-playback
bbb-playback-presentation
bbb-record-core
bbb-web
bbb-webrtc-sfu"

DEPENDENCIES=$(
  for PKG in $PKGS; do
    PKG_VERSION="$VERSION"
    OLDER_VERSION="$(grep "$PKG " packages_to_skip.txt)"
    if [ -n "$OLDER_VERSION" ]; then
      PKG_VERSION=$(echo $OLDER_VERSION | tr '_' ' ' | cut -f3 -d ' ')
    fi
    # add 2: epoch if not already in filename
    if [[ "$PKG_VERSION" != "2:"* ]]; then
      PKG_VERSION="2:${PKG_VERSION}"
    fi
    echo " $PKG (= $PKG_VERSION)"
  done | tr '\n' ',' | tail -c +2 | head -c -1
  )

cat <<EOF > control
Section: web
Priority: optional
Homepage: https://bigbluebutton.org/
Standards-Version: 3.9.2

Package: bigbluebutton
Version: $VERSION
Maintainer: Senfcall IT <it@senfcall.de>
Depends: $DEPENDENCIES
Architecture: amd64
Copyright: license.txt
Description: Virtual Classroom
  BigBlueButton is a virtual classroom for online teaching and learning. It was built for online learning, has a large community of teachers and developers that constantly work to improve it, and is deeply embedded into the world’s major learning management system. Users run BigBlueButton within their browsers with no additional software to install.
EOF

equivs-build control
