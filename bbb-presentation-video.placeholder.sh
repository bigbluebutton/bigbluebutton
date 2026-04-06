#!/bin/sh
set -ex
RELEASE=5.1.0-beta.2
cat <<MSG
This tool downloads prebuilt packages built on Github Actions
The corresponding source can be browsed at https://github.com/bigbluebutton/bbb-presentation-video/tree/${RELEASE}
Build logs are at https://github.com/bigbluebutton/bbb-presentation-video/actions/workflows/package.yml?query=branch%3A${RELEASE}
MSG
curl -Lf -o bbb-presentation-video.zip "https://github.com/bigbluebutton/bbb-presentation-video/releases/download/${RELEASE}/ubuntu-22.04.zip"
rm -rf bbb-presentation-video
unzip -o bbb-presentation-video.zip -d bbb-presentation-video

# Download python3-perfect-freehand dependency
curl -Lf -o bbb-presentation-video/python3-perfect-freehand_1.2.0_all.deb \
  "https://github.com/bigbluebutton/perfect-freehand-python/releases/download/1.2.0/python3-perfect-freehand_1.2.0_all.deb"
