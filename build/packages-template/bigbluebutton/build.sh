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
bbb-export-annotations
bbb-freeswitch-core
bbb-freeswitch-sounds
bbb-fsesl-akka
bbb-html5
bbb-learning-dashboard
bbb-libreoffice-docker
bbb-livekit
bbb-mkclean
bbb-pads
bbb-shared-notes-server
bbb-playback
bbb-playback-presentation
bbb-record-core
bbb-web
bbb-webrtc-sfu
bbb-webrtc-recorder"

DEPENDENCIES=$(
  for PKG in $PKGS; do
    PKG_VERSION=""
    # If DEBS_DIR is set, read the real version from the actual .deb
    if [ -n "$DEBS_DIR" ]; then
      DEB_FILE=$(find "$DEBS_DIR" -name "${PKG}_*.deb" -o -name "${PKG//-/_}_*.deb" 2>/dev/null | head -1)
      if [ -n "$DEB_FILE" ]; then
        PKG_VERSION=$(dpkg-deb --show --showformat='${Version}' "$DEB_FILE")
      fi
    fi
    # Fall back to packages_to_skip.txt (GitLab CI path)
    if [ -z "$PKG_VERSION" ] && [ -f packages_to_skip.txt ]; then
      OLDER_VERSION="$(grep "$PKG " packages_to_skip.txt || true)"
      if [ -n "$OLDER_VERSION" ]; then
        PKG_VERSION=$(echo $OLDER_VERSION | tr '_' ' ' | cut -f3 -d ' ')
      fi
    fi
    # Fall back to global version
    if [ -z "$PKG_VERSION" ]; then
      PKG_VERSION="$VERSION"
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
Maintainer: ffdixon@bigbluebutton.org
Depends: $DEPENDENCIES
Architecture: amd64
Copyright: LICENSE
Description: Virtual Classroom
  BigBlueButton is a virtual classroom for online teaching and learning. It was built for online learning, has a large community of teachers and developers that constantly work to improve it, and is deeply embedded into the world’s major learning management system. Users run BigBlueButton within their browsers with no additional software to install.
EOF

equivs-build control
