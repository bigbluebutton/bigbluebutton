#!/bin/bash -ex

TARGET=`basename $(pwd)`


PACKAGE=$(echo $TARGET | cut -d'_' -f1)
VERSION=$(echo $TARGET | cut -d'_' -f2)
DISTRO=$(echo $TARGET | cut -d'_' -f3)
TAG=$(echo $TARGET | cut -d'_' -f4)

ETHERPAD_HOME=/usr/share/etherpad-lite

#
# Clean up directories
rm -rf staging

#
# Private Node.js runtime
#
# Etherpad 3.x requires Node >= 24 (engineStrict), while BigBlueButton 3.0 ships
# Node 22 for every other component. Rather than moving the whole server to a
# newer Node, bbb-etherpad carries its own runtime under $ETHERPAD_HOME/node-runtime
# and the systemd unit starts Etherpad with it.
NODE_VERSION=24.21.0
NODE_DIST="node-v${NODE_VERSION}-linux-x64"
rm -rf node-runtime "${NODE_DIST}" "${NODE_DIST}.tar.xz"
curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/${NODE_DIST}.tar.xz"
curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt" | grep " ${NODE_DIST}.tar.xz$" | sha256sum -c -
tar -xJf "${NODE_DIST}.tar.xz"
mv "${NODE_DIST}" node-runtime
rm -f "${NODE_DIST}.tar.xz"
export PATH="$PWD/node-runtime/bin:$PATH"
node -v

# pnpm, pinned to the version Etherpad's package.json asks for; it lives inside
# the private runtime so the plugin manager can find it at run time as well.
PNPM_VERSION=$(node -p "require('./package.json').packageManager.split('@')[1]")
npm install -g "pnpm@${PNPM_VERSION}"
pnpm -v

#
# Production workspace: admin UI, docs and the OIDC login pages (ui) are
# development-only workspace packages. Mirrors upstream's Dockerfile.
python3 - <<'PYEOF'
lines = open('pnpm-workspace.yaml').read().splitlines()
dev_only = {'- admin', '- doc', '- ui', '- admin/tools/openapi-codegen'}
lines = [l for l in lines if l.strip() not in dev_only]
open('pnpm-workspace.yaml', 'w').write('\n'.join(lines) + '\n')
PYEOF

export NODE_ENV=production
export ETHERPAD_PRODUCTION=true
# settings.json (ours, copied from packages-template) is already in place, so
# installDeps.sh does not copy the template over it.
bin/installDeps.sh

#
# Plugins. Etherpad 3.x installs plugins through its own plugin manager into
# src/plugin_packages (tracked in var/installed_plugins.json) and links them into
# src/node_modules; `npm install ep_...` from the 1.x days no longer registers them.
PLUGINS_SRC="$PWD/bbb-plugins-src"
rm -rf "$PLUGINS_SRC"
mkdir -p "$PLUGINS_SRC"

clone_plugin() {
  # $1 = plugin name (directory), $2 = repo, $3 = commit/tag
  git clone "$2" "$PLUGINS_SRC/$1"
  git -C "$PLUGINS_SRC/$1" checkout --quiet "$3"
  rm -rf "$PLUGINS_SRC/$1/.git"
}

clone_plugin ep_pad_ttl               https://github.com/mconf/ep_pad_ttl.git            360136cd38493dd698435631f2373cbb7089082d
clone_plugin ep_bigbluebutton_patches https://github.com/alangecker/bbb-etherpad-plugin.git 4dbc28d62c44742ffae79ce88c069802bc533068
clone_plugin ep_redis_publisher       https://github.com/mconf/ep_redis_publisher.git    2b6e47c1c59362916a0b2961a29b259f2977b694
clone_plugin ep_cursortrace           https://github.com/mconf/ep_cursortrace.git        v3.1.20-2

# Etherpad >= 2 opens the socket.io connection before the documentReady hook
# fires, so the sessionToken wrapper has to be installed at module load.
patch -p1 -F0 --forward -d "$PLUGINS_SRC/ep_bigbluebutton_patches" \
  -i "$PWD/ep_bigbluebutton_patches-socket-session-token.patch"

# registry plugins, pinned
pushd "$PLUGINS_SRC"
for spec in ep_disable_chat@0.0.55 ep_auth_session@1.1.2; do
  name="${spec%@*}"
  mkdir -p "$name"
  tar -xzf "$(npm pack "$spec" --silent)" -C "$name" --strip-components=1
done
rm -f ./*.tgz
popd

pnpm run plugins i --path \
  "$PLUGINS_SRC/ep_pad_ttl" \
  "$PLUGINS_SRC/ep_bigbluebutton_patches" \
  "$PLUGINS_SRC/ep_redis_publisher" \
  "$PLUGINS_SRC/ep_cursortrace" \
  "$PLUGINS_SRC/ep_disable_chat" \
  "$PLUGINS_SRC/ep_auth_session"
pnpm run plugins ls
cat var/installed_plugins.json

#
# Skin
rm -rf src/static/skins/bigbluebutton
git clone https://github.com/alangecker/bbb-etherpad-skin.git src/static/skins/bigbluebutton
git -C src/static/skins/bigbluebutton checkout --quiet 91b052c2cc4c169f2e381538e4342e894f944dbe
rm -rf src/static/skins/bigbluebutton/.git

#
# Staging
mkdir -p staging$ETHERPAD_HOME

cp -r CHANGELOG.md LICENSE README.md bin src var node_modules \
      package.json pnpm-workspace.yaml pnpm-lock.yaml settings.json node-runtime \
      staging$ETHERPAD_HOME

# The plugin manager links plugins with absolute symlinks pointing into this
# build directory; rewrite them relative so they survive the move to $ETHERPAD_HOME.
find staging$ETHERPAD_HOME -type l | while read -r link; do
  target=$(readlink "$link")
  case "$target" in
    "$PWD"/*)
      rel=$(realpath -s --relative-to="$(dirname "$link")" "staging$ETHERPAD_HOME/${target#$PWD/}")
      ln -sfn "$rel" "$link"
      ;;
  esac
done
# Nothing may still point outside the package
! find staging$ETHERPAD_HOME -type l -lname '/*' | grep .

chmod -R a+rX staging$ETHERPAD_HOME

mkdir -p staging/usr/lib/systemd/system
cp etherpad.service staging/usr/lib/systemd/system

mkdir -p staging/usr/share/bigbluebutton/nginx
cp notes.nginx staging/usr/share/bigbluebutton/nginx

##

. ./opts-$DISTRO.sh

#
# Build RPM package
# No dependency on the system nodejs: the package carries its own runtime.
fpm -s dir -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --before-install before-install.sh \
    --after-install after-install.sh \
    --before-remove before-remove.sh \
    --after-remove after-remove.sh \
    --description "The EtherPad Lite components for BigBlueButton" \
    $DIRECTORIES \
    $OPTS
