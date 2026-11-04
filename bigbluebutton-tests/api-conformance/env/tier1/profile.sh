#!/bin/sh
# Switch the Tier 1 stack's bbb-web to a config profile, and back; conform.env
# names it as BBB_PROFILE_CMD. A profile is an overlay in
# ../bbb-web/profiles/NAME.properties: render.sh appends it to the stack's
# bbb-web.properties, where the last value of a key wins, and bbb-web is
# restarted, and akka-apps too when the switch changes a setting it reads.
#
#   profile.sh NAME      apply a profile
#   profile.sh default   Tier 1's own settings
#   profile.sh status    print the profile in force
#
# When the stack isn't running, or a service the profile needs isn't, it
# exits 77, which bbb-conform reads as "this server can't be switched", and
# skips the profile's cases.
set -eu

here=$(cd "$(dirname "$0")" && pwd)
env_dir=$(dirname "$here")
state=$env_dir/.state
name=${1:-}
case $name in
	'' | *[!a-z0-9-]*)
		echo "usage: profile.sh NAME|default|status (NAME: lower-case letters, digits and dashes)" >&2
		exit 2
		;;
	status)
		cat "$state/profile" 2>/dev/null || echo default
		exit 0
		;;
	default) ;;
	*)
		if [ ! -f "$env_dir/bbb-web/profiles/$name.properties" ]; then
			echo "no profile $name: $env_dir/bbb-web/profiles/$name.properties doesn't exist" >&2
			exit 2
		fi
		;;
esac

compose="docker compose -f $env_dir/compose.yaml --profile clamav"
running() {
	if ! ids=$($compose ps -q --status running "$1"); then
		echo "profile.sh: docker compose failed" >&2
		exit 1
	fi
	[ -n "$ids" ]
}
if ! running bbb-web; then
	echo "the Tier 1 stack isn't running (make -C $env_dir up), so it can't be switched" >&2
	exit 77
fi
# Services a profile needs beyond the default ones.
case $name in
	clamav-scan)
		if ! running clamav; then
			echo "$name needs ClamAV, which runs only with make -C $env_dir up CLAMAV=1" >&2
			exit 77
		fi
		;;
esac

# One switch, or render, at a time (make reset and render take this lock
# too, a reset for up to its 15 minutes).
mkdir -p "$state"
exec 9>"$state/profile.lock"
if ! flock -w 1200 9; then
	echo "another profile switch has held $state/profile.lock for 20 minutes" >&2
	exit 1
fi
cid=$($compose ps -q bbb-web)
# akka-apps still to be restarted for a switch that failed part way.
pending=$state/akka-restart-pending
# In force: recorded, bbb-web started after the file was written, and
# akka-apps restarted if the switch needed it.
current=$(cat "$state/profile" 2>/dev/null || echo default)
written=$(date -r "$state/conform/bbb-web.properties" +%s)
started=$(date -d "$(docker inspect -f '{{.State.StartedAt}}' "$cid")" +%s)
if [ "$name" = "$current" ] && [ "$started" -ge "$written" ] && [ ! -e "$pending" ]; then
	echo "bbb-web already runs with $name"
	exit 0
fi

# akka-apps reads one of bbb-web's settings at startup
# (SystemConfiguration.scala): a switch that changes it restarts akka-apps
# too, and until it has been, a later switch does it. The last value of a
# key wins.
akka_reads() {
	grep -E '^clientSettingsOverrideStrictValidation=' "$state/conform/bbb-web.properties" 2>/dev/null | tail -n 1 || true
}
before=$(akka_reads)
# The record follows the file, so a switch that fails part way is retried
# rather than taken as done.
"$here/render.sh" "$name"
if [ "$name" = default ]; then
	rm -f "$state/profile"
else
	echo "$name" > "$state/profile"
fi
# Values are read at startup only.
[ "$(akka_reads)" = "$before" ] || : > "$pending"
services=bbb-web
[ ! -e "$pending" ] || services="akka-apps bbb-web"
restart() {
	id=$($compose ps -q "$1")
	started=$(docker inspect -f '{{.State.StartedAt}}' "$id")
	if ! out=$($compose restart "$1" 2>&1); then
		echo "$out" >&2
		exit 1
	fi
	waited=0
	while :; do
		now=$(docker inspect -f '{{.State.StartedAt}} {{.State.Health.Status}}' "$id")
		if [ "${now% *}" != "$started" ] && [ "${now#* }" = healthy ]; then
			break
		fi
		if [ "$waited" -ge 300 ]; then
			echo "$1 wasn't healthy within 300s of the restart" >&2
			$compose logs --tail=30 "$1" >&2 || true
			exit 1
		fi
		sleep 2
		waited=$((waited + 2))
	done
}
for service in $services; do
	restart "$service"
done
rm -f "$pending"
echo "$(echo "$services" | sed 's/ / and /') restarted with $name"
