#!/bin/bash -ex

TARGET=$(basename "$(pwd)")

CLI_VERSION=2.3.1

PACKAGE=$(echo "$TARGET" | cut -d'_' -f1)
VERSION=$(echo "$TARGET" | cut -d'_' -f2)
DISTRO=$(echo "$TARGET" | cut -d'_' -f3)

BUILDDIR="$PWD"
DESTDIR="$BUILDDIR/staging"
LIVEKIT_SERVER_DIR="$BUILDDIR/livekit-server"
LIVEKIT_SIP_DIR="$BUILDDIR/livekit-sip"

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

# Build lk (livekit-cli)
# Pull built lk cli from github
curl "https://github.com/livekit/livekit-cli/releases/download/v${CLI_VERSION}/lk_${CLI_VERSION}_linux_amd64.tar.gz" -Lo - | tar -C "$DESTDIR/usr/bin" -xzf - lk
# End of lk (livekit-cli) build

# Build livekit-server
# Use an isolated shell as the GO* envs need to be overridden and I'd
# prefer not to leak them to the main shell.- prlanzarin
(
    # These are needed by the mage build
    export GOPATH="/tmp/go-${TARGET}"
    export GOBIN="$GOPATH/bin"
    mkdir -p "$GOBIN"
    export PATH="$GOBIN:$PATH"

    pushd "$LIVEKIT_SERVER_DIR" > /dev/null
    git config --global --add safe.directory "${PWD}"
    ./bootstrap.sh
    mage
    popd > /dev/null
)

cp "$LIVEKIT_SERVER_DIR/bin/livekit-server" "$DESTDIR/usr/bin"

# End of livekit-server build

# Build livekit-sip
apt update && apt install -y pkg-config libopus-dev libopusfile-dev libsoxr-dev

pushd "$LIVEKIT_SIP_DIR" > /dev/null
git config --global --add safe.directory "${PWD}"

if [ "$TARGETPLATFORM" = "linux/arm64" ]; then
    GOARCH=arm64
else
    GOARCH=amd64
fi

CGO_ENABLED=1 GOOS=linux GOARCH="${GOARCH}" GO111MODULE=on go build -a -o livekit-sip ./cmd/livekit-sip

cp livekit-sip "$DESTDIR/usr/bin"
popd > /dev/null
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
