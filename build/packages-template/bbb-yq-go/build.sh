#!/bin/bash -ex

TARGET=$(basename "$(pwd)")

PACKAGE=$(echo "$TARGET" | cut -d'_' -f1)
VERSION=$(echo "$TARGET" | cut -d'_' -f2)
DISTRO=$(echo "$TARGET"  | cut -d'_' -f3)

# Upstream mikefarah/yq (Go) version to package. Bump here and refresh
# bbb-yq-go.sha256sum. Kept independent of the BBB package VERSION above.
YQ_VERSION=4.53.2

# Map the build-host architecture to the upstream release asset name.
ARCH=$(dpkg --print-architecture)
case "$ARCH" in
  amd64) ASSET=yq_linux_amd64 ;;
  *) echo "bbb-yq-go: unsupported architecture '$ARCH'" >&2; exit 1 ;;
esac

# Clean staging tree
rm -rf staging
mkdir -p staging/usr/bin

# Fetch the upstream release binary and verify it against the hashes pinned
# in bbb-yq-go.sha256sum (reviewed in-repo, same approach as bbb-mkclean).
# --ignore-missing checks only the asset for this build's architecture.
curl -fsSLO "https://github.com/mikefarah/yq/releases/download/v${YQ_VERSION}/${ASSET}"
sha256sum -c --ignore-missing bbb-yq-go.sha256sum

# Install as /usr/bin/yq-go so it coexists with any other 'yq'.
install -Dm0755 "$ASSET" staging/usr/bin/yq-go

# Distro-specific fpm options (sources opts-global.sh for vendor/maintainer/url).
# shellcheck disable=SC1090
. "./opts-$DISTRO.sh"

# VERSION/EPOCH are the BBB build version/epoch (from the environment); the
# upstream yq version is pinned above. provides/conflicts/replaces make this a
# drop-in for the 'yq-go' virtual package other bbb-* packages depend on.
# shellcheck disable=SC2086
fpm -s dir -t deb -C ./staging -n "$PACKAGE" \
    --version "$VERSION" --epoch "$EPOCH" \
    --description "mikefarah/yq (Go) packaged for BigBlueButton as /usr/bin/yq-go" \
    --provides yq-go --conflicts yq-go --replaces yq-go \
    $DIRECTORIES \
    $OPTS
