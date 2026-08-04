#!/bin/bash -ex

TARGET=$(basename "$(pwd)")

PACKAGE=$(echo "$TARGET" | cut -d'_' -f1)
VERSION=$(echo "$TARGET" | cut -d'_' -f2)
DISTRO=$(echo "$TARGET"  | cut -d'_' -f3)

# Upstream coturn version to package. Bump here and refresh coturn.sha256sum.
# Kept independent of the BBB package VERSION above. Ubuntu Noble only ships
# 4.6.1, which is why we build our own.
COTURN_VERSION=4.16.0

BUILDDIR="$PWD"
DESTDIR="$BUILDDIR/staging"

# Build-time dependencies (installed here rather than baked into the build
# image, same as bbb-livekit). libsystemd-dev enables sd_notify, which the
# Type=notify unit below relies on.
apt-get update
apt-get install -y --no-install-recommends \
    libssl-dev libevent-dev libsystemd-dev pkg-config

# Clean staging tree and any previously extracted source
rm -rf "$DESTDIR" "coturn-${COTURN_VERSION}"
mkdir -p "$DESTDIR"

# Fetch the upstream source tarball and verify it against the hash pinned in
# coturn.sha256sum (reviewed in-repo, same approach as bbb-mkclean/bbb-yq-go).
if [ ! -f "coturn-${COTURN_VERSION}.tar.gz" ]; then
    curl -fsSL -o "coturn-${COTURN_VERSION}.tar.gz" \
        "https://github.com/coturn/coturn/archive/refs/tags/${COTURN_VERSION}.tar.gz"
fi
sha256sum -c coturn.sha256sum

tar -xzf "coturn-${COTURN_VERSION}.tar.gz"

pushd "coturn-${COTURN_VERSION}"
# coturn ships a hand-written ./configure (not autotools, so no autoreconf).
# The TURN_NO_* variables force-disable the optional user-database backends and
# prometheus regardless of which -dev packages happen to be in the build image:
# BBB authenticates with use-auth-secret/static-auth-secret, which needs no
# database, and leaving them on would add libsqlite3/libpq/libmysqlclient/
# libhiredis/libmongoc/libmicrohttpd to the runtime dependencies for nothing.
# --manprefix is needed because coturn's default MANPREFIX is $PREFIX, which
# would install the man pages into /usr/man.
TURN_NO_SQLITE=1 TURN_NO_PQ=1 TURN_NO_MYSQL=1 TURN_NO_MONGO=1 \
TURN_NO_HIREDIS=1 TURN_NO_PROMETHEUS=1 \
    ./configure --prefix=/usr --manprefix=/usr/share --disable-rpath
make -j"$(nproc)"
make install DESTDIR="$DESTDIR"
popd

# Prune what we do not ship: the static client library and headers (nothing in
# BBB links against libturnclient), the SQL/redis/mongo schemas and the empty
# sqlite turndb dir (no database backends are compiled in), upstream docs and
# examples, and the /usr/etc/turnserver.conf.default copy (we install the
# example as the real /etc/turnserver.conf below).
# ${DESTDIR:?} guards against these expanding to /usr/lib, /var etc. if DESTDIR
# were ever empty -- this runs as root inside the build container.
rm -rf "${DESTDIR:?}/usr/lib" \
       "${DESTDIR:?}/usr/include" \
       "${DESTDIR:?}/usr/etc" \
       "${DESTDIR:?}/usr/share/turnserver" \
       "${DESTDIR:?}/usr/share/doc" \
       "${DESTDIR:?}/usr/share/examples" \
       "${DESTDIR:?}/var"

# Default config: the upstream example, with every option commented out,
# installed where the distro coturn package puts it. It carries the line
# "#static-auth-secret=north" that bbb-install greps for to decide whether the
# config is still pristine and safe to overwrite. fpm marks files under /etc as
# conffiles, so an operator's edits survive upgrades.
install -Dm0644 "coturn-${COTURN_VERSION}/examples/etc/turnserver.conf" \
    "$DESTDIR/etc/turnserver.conf"

# systemd unit (checked into this directory, taken from upstream
# examples/etc/coturn.service). Named coturn.service so that bbb-install's
# /etc/systemd/system/coturn.service.d/override.conf drop-in and its
# "systemctl restart coturn" keep working unchanged.
install -Dm0644 coturn.service "$DESTDIR/usr/lib/systemd/system/coturn.service"

# Distro-specific fpm options (sources opts-global.sh for vendor/maintainer/url).
# shellcheck disable=SC1090
. "./opts-$DISTRO.sh"

# VERSION/EPOCH are the BBB build version/epoch (from the environment); the
# upstream coturn version is pinned above. provides/conflicts/replaces make this
# a drop-in replacement for the distro 'coturn' package.
# shellcheck disable=SC2086
fpm -s dir -C "$DESTDIR" -n "$PACKAGE" \
    --version "$VERSION" --epoch "$EPOCH" \
    --before-install before-install.sh \
    --after-install after-install.sh \
    --before-remove before-remove.sh \
    --after-remove after-remove.sh \
    --description "coturn ${COTURN_VERSION} TURN/STUN server packaged for BigBlueButton" \
    --provides coturn --conflicts coturn --replaces coturn \
    $DIRECTORIES \
    $OPTS
