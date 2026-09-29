#!/bin/bash -ex

TARGET=$(basename "$(pwd)")

SERVER_VERSION=v1.13.7
CLI_VERSION=2.18.8
SIP_VERSION=v1.17.0

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

    # START OF PSRPC PATCH
    #
    # LK's psrpc patch: this is a workaround for an issue found when upgrading
    # to LK with psrpc versions >= v0.7.7. When running under FIFO, LK may take
    # all available CPUs in specific but usual conditions such as meeting end,
    # webrtc-recorder healthcheck disconnects etc. This was a thing before,
    # but became way more likely in v0.7.7 due to a specific change in psrpc
    # channel disconn loop.
    # This is going to be reported in upstream and hopefully fixed there, but
    # for now I'm patching this inline with a trigger to break the build on
    # subsequent LK bumps so we remember to fix this upstream - prlanzarin
    grep -qE '^[[:space:]]+github.com/livekit/psrpc v0\.7\.7$' go.mod || {
        echo "livekit no longer requires psrpc v0.7.7, which the psrpc patch is made for. Fix it upstream." >&2
        exit 1
    }
    psrpc_dir=$(go mod download -json github.com/livekit/psrpc@v0.7.7 | jq -er .Dir)
    mkdir -p third_party
    cp -r "$psrpc_dir" third_party/psrpc
    chmod -R u+w third_party/psrpc
    patch -d third_party/psrpc -p1 --forward --fuzz=0 -i "$BUILDDIR/closed-channel-loop_psrpc.patch"
    patched=$(grep -rE '(requests|claims) = nil$' third_party/psrpc/pkg/server | wc -l)
    [ "$patched" -eq 4 ] || {
        echo "closed-channel-loop_psrpc.patch did not apply" >&2
        exit 1
    }
    go mod edit -replace github.com/livekit/psrpc=./third_party/psrpc
    # END OF PSRPC PATCH

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

# Apply livekit-sip patches if any. All patches end in "_sip.patch" and are in
# the same directory as this script.
for patch in "$BUILDDIR"/*_sip.patch; do
    if [ -f "$patch" ]; then
        echo "Applying patch: $patch"
        pushd "$SIP_DIR" > /dev/null
        git apply "$patch"
        popd > /dev/null
    fi
done

pushd "$SIP_DIR" > /dev/null

if [ "$TARGETPLATFORM" = "linux/arm64" ]; then
    GOARCH=arm64
else
    GOARCH=amd64
fi

CGO_ENABLED=1 GOOS=linux GOARCH="${GOARCH}" GO111MODULE=on go build -a \
    -ldflags "-X github.com/livekit/sip/version.Version=${SIP_VERSION}" \
    -o livekit-sip ./cmd/livekit-sip

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
