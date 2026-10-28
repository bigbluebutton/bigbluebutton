# shellcheck shell=sh
# The part of profile.sh that runs on the server, as root. profile.sh puts
# NAME and OVERLAY (a file with the profile's settings) in front of it.
set -eu

F=/etc/bigbluebutton/bbb-web.properties
ORIG=$F.bbb-conform-orig # the server's own file, kept while a profile is in force
STATE=$F.bbb-conform-state # the profile's name, then the sha256 of what was written
MARK="# bbb-conform profile"

if [ "$(id -u)" != 0 ]; then
	echo "profile switching needs root on the server" >&2
	exit 1
fi
exec 9>/run/bbb-conform-profile.lock
if ! flock -w 600 9; then
	echo "another profile switch has held /run/bbb-conform-profile.lock for 10 minutes" >&2
	exit 1
fi

sum() { sha256sum "$1" | cut -d' ' -f1; }

if [ "$NAME" = status ]; then
	if [ -f "$STATE" ]; then sed -n 1p "$STATE"; else echo default; fi
	exit 0
fi

[ -f "$F" ] || : >"$F"
if [ -f "$STATE" ] && [ "$(sum "$F")" != "$(sed -n 2p "$STATE")" ]; then
	if grep -q "^$MARK " "$F"; then
		echo "$F was edited after a profile was applied. Restore it from $ORIG, or edit it, then remove $STATE" >&2
		exit 1
	fi
	# Rewritten without a profile, e.g. by the server's boot scripts: that
	# is now the server's own file.
	rm -f "$STATE"
fi
if [ ! -f "$STATE" ]; then
	cp -p "$F" "$ORIG"
fi

tmp=$(mktemp "$F.XXXXXX")
cat "$ORIG" >"$tmp"
if [ "$NAME" != default ]; then
	printf '\n%s %s\n' "$MARK" "$NAME" >>"$tmp"
	cat "$OVERLAY" >>"$tmp"
fi
chown --reference="$ORIG" "$tmp"
chmod --reference="$ORIG" "$tmp"

if cmp -s "$tmp" "$F" && systemctl is-active -q bbb-web; then
	rm -f "$tmp"
	echo "bbb-web already runs with $NAME"
else
	mv "$tmp" "$F"
	# Values are read at startup only.
	. /etc/default/bbb-web 2>/dev/null || true
	url="http://${LISTEN_ADDRESS:-127.0.0.1}:${LISTEN_PORT:-8090}/bigbluebutton/api"
	old=$(systemctl show -p MainPID --value bbb-web)
	systemctl restart bbb-web
	waited=0
	while :; do
		pid=$(systemctl show -p MainPID --value bbb-web)
		if [ "$pid" != 0 ] && [ "$pid" != "$old" ] && curl -fsS -m 5 "$url" 2>/dev/null | grep -q '<response>'; then
			break
		fi
		if [ "$waited" -ge 300 ]; then
			echo "bbb-web didn't answer at $url within 300s of the restart" >&2
			journalctl -u bbb-web -n 30 --no-pager >&2 || true
			exit 1
		fi
		sleep 2
		waited=$((waited + 2))
	done
	echo "bbb-web restarted with $NAME"
fi

if [ "$NAME" = default ]; then
	rm -f "$STATE" "$ORIG"
else
	printf '%s\n%s\n' "$NAME" "$(sum "$F")" >"$STATE"
fi
