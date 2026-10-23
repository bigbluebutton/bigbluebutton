#!/bin/sh
# Switch the Tier 1 stack's bbb-web to a config profile, and back; conform.env
# names it as BBB_PROFILE_CMD. A profile is an overlay in
# ../bbb-web/profiles/NAME.properties: render.sh appends it to the stack's
# bbb-web.properties, where the last value of a key wins, and bbb-web is
# restarted.
#
#   profile.sh NAME      apply a profile
#   profile.sh default   Tier 1's own settings
#   profile.sh status    print the profile in force
#
# When the stack isn't running it exits 77, which bbb-conform reads as
# "this server can't be switched", and skips the profile's cases.
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
	default | status) ;;
	*)
		if [ ! -f "$env_dir/bbb-web/profiles/$name.properties" ]; then
			echo "no profile $name: $env_dir/bbb-web/profiles/$name.properties doesn't exist" >&2
			exit 2
		fi
		;;
esac

compose="docker compose --progress quiet -f $env_dir/compose.yaml"
cid=$($compose ps -q bbb-web 2>/dev/null || true)
if [ -z "$cid" ] || [ "$(docker inspect -f '{{.State.Running}}' "$cid" 2>/dev/null)" != true ]; then
	echo "the Tier 1 stack isn't running (make -C $env_dir up), so it can't be switched" >&2
	exit 77
fi

# One switch at a time.
mkdir -p "$state"
exec 9>"$state/profile.lock"
if ! flock -w 600 9; then
	echo "another profile switch has held $state/profile.lock for 10 minutes" >&2
	exit 1
fi
current=$(cat "$state/profile" 2>/dev/null || echo default)
if [ "$name" = status ]; then
	echo "$current"
	exit 0
fi
if [ "$name" = "$current" ]; then
	echo "bbb-web already runs with $name"
	exit 0
fi

"$here/render.sh" "$name"
# Values are read at startup only.
started=$(docker inspect -f '{{.State.StartedAt}}' "$cid")
$compose restart bbb-web >/dev/null
waited=0
while :; do
	now=$(docker inspect -f '{{.State.StartedAt}} {{.State.Health.Status}}' "$cid")
	if [ "${now% *}" != "$started" ] && [ "${now#* }" = healthy ]; then
		break
	fi
	if [ "$waited" -ge 300 ]; then
		echo "bbb-web wasn't healthy within 300s of the restart" >&2
		$compose logs --tail=30 bbb-web >&2 || true
		exit 1
	fi
	sleep 2
	waited=$((waited + 2))
done
if [ "$name" = default ]; then
	rm -f "$state/profile"
else
	echo "$name" > "$state/profile"
fi
echo "bbb-web restarted with $name"
