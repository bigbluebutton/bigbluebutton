#!/bin/sh
# Renders the stack's configuration into env/.state/conform, which the
# services mount at /etc/bigbluebutton/conform:
#   bbb-web.properties   Tier 1's, plus the profile in force, if any
#   bbb-apps-akka.conf
#   certs/               the CA and nginx's certificate (certs.sh)
#   conform.env          the variables the runner reads
#
#   render.sh [profile]  a name in env/bbb-web/profiles/, or default; without
#                        one, the profile profile.sh last put in force
set -eu
here=$(cd "$(dirname "$0")" && pwd)
env_dir=$(dirname "$here")
out=$env_dir/.state/conform
. "$here/tier1.env"

profile=${1:-$(cat "$env_dir/.state/profile" 2>/dev/null || true)}
[ "$profile" != default ] || profile=
mkdir -p "$out"
"$here/certs.sh" "$out/certs" "$env_dir/.state/ca"

subst() { sed "s|@SALT@|$TIER1_SALT|g" "$1"; }

# write_changed FILE: writes stdin to FILE if that changes it. In place, so a
# running service reads it after a restart, and untouched otherwise:
# profile.sh reads the file's time. Mode 0644, since bbb-web silently ignores
# an override file it can't read.
write_changed() {
	tmp=$(mktemp)
	cat > "$tmp"
	if ! cmp -s "$tmp" "$1"; then
		cat "$tmp" > "$1"
	fi
	rm -f "$tmp"
	chmod 644 "$1"
}
{
	subst "$env_dir/bbb-web/tier1.properties.in"
	if [ -n "$profile" ]; then
		printf '\n# bbb-conform profile %s\n' "$profile"
		cat "$env_dir/bbb-web/profiles/$profile.properties"
	fi
} | write_changed "$out/bbb-web.properties"
subst "$env_dir/akka-apps/bbb-apps-akka.conf.in" | write_changed "$out/bbb-apps-akka.conf"

cat > "$out/conform.env" <<END
export BBB_URL=https://localhost:8443/bigbluebutton/
export BBB_SECRET=$TIER1_SALT
export BBB_WEB_DIRECT_URL=http://localhost:8090
export BBB_TAP_URL=http://localhost:8099
export BBB_PROFILE_CMD=$here/profile.sh
export SSL_CERT_FILE=$out/certs/bundle.pem
END
