#!/bin/bash -ex

TARGET=$(basename "$(pwd)")

SERVER_VERSION=v1.9.0
CLI_VERSION=2.3.1
SIP_VERSION=v1.1.1

PACKAGE=$(echo "$TARGET" | cut -d'_' -f1)
VERSION=$(echo "$TARGET" | cut -d'_' -f2)
DISTRO=$(echo "$TARGET" | cut -d'_' -f3)

BUILDDIR="$PWD"
DESTDIR="$BUILDDIR/staging"

#
# Clear staging directory for build

rm -rf "$DESTDIR"
mkdir -p "$DESTDIR"

# shellcheck disable=SC1090
. "./opts-$DISTRO.sh"

mkdir -p "$DESTDIR/usr/share/bigbluebutton/nginx"
cp livekit.nginx "$DESTDIR/usr/share/bigbluebutton/nginx"

mkdir -p "$DESTDIR/lib/systemd/system/"
cp livekit-server.service livekit-sip.service "$DESTDIR/lib/systemd/system"

mkdir -p "$DESTDIR/usr/share/livekit-server"
cp livekit.yaml livekit-sip.yaml "$DESTDIR/usr/share/livekit-server"
chmod 644 "$DESTDIR/usr/share/livekit-server/livekit"*.yaml

mkdir -p "$DESTDIR/usr/bin"

# Pull built lk cli from github
curl "https://github.com/livekit/livekit-cli/releases/download/v${CLI_VERSION}/lk_${CLI_VERSION}_linux_amd64.tar.gz" -Lo - | tar -C "$DESTDIR/usr/bin" -xzf - lk

# Build livekit-server
buildbase=$(mktemp -d)
curl "https://github.com/livekit/livekit/archive/${SERVER_VERSION}.tar.gz" -Lo - | tar -xzf - -C "$buildbase"
# Get livekit-server's directory name from the extracted archive
LIVEKIT_DIR=$(find "$buildbase" -maxdepth 1 -type d -name "livekit-*" | head -n 1)

if [ -z "$LIVEKIT_DIR" ]; then
    echo "Error: Could not find livekit-server directory in extracted archive"
    exit 1
fi

# Build in an isolated shell as the GO* envs need to be overridden and I'd
# prefer not to leak them to the main shell.- prlanzarin
(
    # These are needed by the mage build
    export GOPATH="/tmp/go-${TARGET}"
    export GOBIN="$GOPATH/bin"
    mkdir -p "$GOBIN"
    export PATH="$GOBIN:$PATH"

    pushd "$LIVEKIT_DIR" > /dev/null
    ./bootstrap.sh
    mage
    popd > /dev/null
)

cp "$LIVEKIT_DIR/bin/livekit-server" "$DESTDIR/usr/bin"
rm -rf "$buildbase"

# End of livekit-server build

# Build livekit-sip
apt update && apt install -y pkg-config libopus-dev libopusfile-dev libsoxr-dev

buildbase=$(mktemp -d)
curl "https://github.com/livekit/sip/archive/${SIP_VERSION}.tar.gz" -Lo - | tar -xzf - -C "$buildbase"
# Get livekit-sip's directory name from the extracted archive
SIP_DIR=$(find "$buildbase" -maxdepth 1 -type d -name "sip-*" | head -n 1)

if [ -z "$SIP_DIR" ]; then
    echo "Error: Could not find livekit-sip directory in extracted archive"
    exit 1
fi

pushd "$SIP_DIR" > /dev/null

if [ "$TARGETPLATFORM" = "linux/arm64" ]; then
    GOARCH=arm64
else
    GOARCH=amd64
fi

CGO_ENABLED=1 GOOS=linux GOARCH="${GOARCH}" GO111MODULE=on go build -a -o livekit-sip ./cmd/livekit-sip

cp livekit-sip "$DESTDIR/usr/bin"
popd > /dev/null
rm -rf "$buildbase"
# End of livekit-sip build

# shellcheck disable=SC2086
fpm -s dir -C "$DESTDIR" -n "$PACKAGE" \
    --version "$VERSION" --epoch 2 \
    --before-install before-install.sh \
    --after-install after-install.sh \
    --before-remove before-remove.sh \
    --after-remove after-remove.sh \
    --description "BigBlueButton build of LiveKit Server" \
    $DIRECTORIES \
    $OPTS
