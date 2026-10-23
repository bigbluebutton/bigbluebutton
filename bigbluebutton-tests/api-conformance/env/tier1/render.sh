#!/bin/sh
# Renders the stack's configuration into env/.state/conform, which the
# services mount at /etc/bigbluebutton/conform:
#   bbb-web.properties   Tier 1's, plus the profile in force, if any
#   bbb-apps-akka.conf
#   certs/               the CA and nginx's certificate (certs.sh)
#   conform.env          the variables the runner reads
#
#   render.sh [profile]  the profile is a name in env/bbb-web/profiles/
set -eu
here=$(cd "$(dirname "$0")" && pwd)
env_dir=$(dirname "$here")
out=$env_dir/.state/conform
. "$here/tier1.env"

profile=${1:-}
mkdir -p "$out"
"$here/certs.sh" "$out/certs"

subst() { sed "s|@SALT@|$TIER1_SALT|g" "$1"; }

# Written in place, so a running bbb-web reads it after a restart; mode 0644,
# since bbb-web silently ignores an override file it can't read.
{
	subst "$env_dir/bbb-web/tier1.properties.in"
	if [ -n "$profile" ]; then
		printf '\n# bbb-conform profile %s\n' "$profile"
		cat "$env_dir/bbb-web/profiles/$profile.properties"
	fi
} > "$out/bbb-web.properties"
chmod 644 "$out/bbb-web.properties"
subst "$env_dir/akka-apps/bbb-apps-akka.conf.in" > "$out/bbb-apps-akka.conf"
chmod 644 "$out/bbb-apps-akka.conf"

cat > "$out/conform.env" <<END
export BBB_URL=https://localhost:8443/bigbluebutton/
export BBB_SECRET=$TIER1_SALT
export BBB_WEB_DIRECT_URL=http://localhost:8090
export SSL_CERT_FILE=$out/certs/bundle.pem
END
