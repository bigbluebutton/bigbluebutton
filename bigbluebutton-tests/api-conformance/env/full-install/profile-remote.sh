# shellcheck shell=sh
# The part of profile.sh that runs on the server, as root. profile.sh puts
# NAME, OVERLAY (a file with the profile's bbb-web settings) and
# AKKA_OVERLAY (one with its akka-apps settings, empty for most profiles) in
# front of it.
set -eu

F=/etc/bigbluebutton/bbb-web.properties
A=/etc/bigbluebutton/bbb-apps-akka.conf
# Restarts still owed by a switch that failed part way.
WEB_PENDING=$F.bbb-conform-restart-pending
PENDING=$A.bbb-conform-restart-pending

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
	if [ -f "$F.bbb-conform-state" ]; then sed -n 1p "$F.bbb-conform-state"; else echo default; fi
	exit 0
fi

# stage FILE MARK EXTRA: writes what FILE is to hold to FILE.bbb-conform-next:
# the server's own file, kept as FILE.bbb-conform-orig while a profile is in
# force, then, for a profile, "MARK NAME" and EXTRA's settings. A profile's
# mark goes into bbb-web.properties even when it has no settings, and into
# bbb-apps-akka.conf only with settings. FILE.bbb-conform-state holds the
# profile's name and the sha256 of what was written: a file edited since is
# refused rather than overwritten.
stage() {
	f=$1 mark=$2 extra=$3
	state=$f.bbb-conform-state orig=$f.bbb-conform-orig
	if [ -f "$state" ] && [ "$(sum "$f")" != "$(sed -n 2p "$state")" ]; then
		if grep -q "^$mark " "$f"; then
			echo "$f was edited after a profile was applied. Restore it from $orig, or edit it, then remove $state" >&2
			exit 1
		fi
		# Rewritten without a profile, e.g. by the server's boot scripts: that
		# is now the server's own file.
		rm -f "$state"
	fi
	if [ ! -f "$state" ]; then
		cp -p "$f" "$orig"
	fi
	cat "$orig" >"$f.bbb-conform-next"
	if [ "$NAME" != default ] && { [ "$f" = "$F" ] || [ -s "$extra" ]; }; then
		printf '\n%s %s\n' "$mark" "$NAME" >>"$f.bbb-conform-next"
		cat "$extra" >>"$f.bbb-conform-next"
	fi
}

# install FILE: puts FILE.bbb-conform-next in place, with FILE's owner and
# mode, and records it at once, so a switch that fails later is retried
# rather than taken for the server's own file. Returns 1 when FILE already
# held it; exits if it can't be written.
install() {
	f=$1
	next=$f.bbb-conform-next
	if cmp -s "$next" "$f"; then
		rm -f "$next"
		record "$f"
		return 1
	fi
	if ! { chown --reference="$f.bbb-conform-orig" "$next" &&
		chmod --reference="$f.bbb-conform-orig" "$next" &&
		mv "$next" "$f"; }; then
		echo "couldn't write $f" >&2
		exit 1
	fi
	record "$f"
}

# record FILE: notes what was written, or forgets the profile when FILE is
# the server's own again.
record() {
	f=$1
	if cmp -s "$f" "$f.bbb-conform-orig"; then
		rm -f "$f.bbb-conform-state" "$f.bbb-conform-orig"
	else
		printf '%s\n%s\n' "$NAME" "$(sum "$f")" >"$f.bbb-conform-state"
	fi
}

# akka-apps reads this one of bbb-web's settings at startup too.
strict() {
	grep -E '^clientSettingsOverrideStrictValidation=' "$F" 2>/dev/null | tail -n 1 || true
}

[ -f "$F" ] || : >"$F"
stage "$F" "# bbb-conform profile" "$OVERLAY"
akka=false
if [ -f "$A" ]; then
	stage "$A" "// bbb-conform profile" "$AKKA_OVERLAY"
	akka=true
elif [ -s "$AKKA_OVERLAY" ]; then
	rm -f "$F.bbb-conform-next"
	echo "profile $NAME sets akka-apps settings, but $A, which bbb-apps-akka reads them from, doesn't exist" >&2
	exit 1
fi

before=$(strict)
if install "$F" || ! systemctl is-active -q bbb-web; then
	: >"$WEB_PENDING"
fi
if $akka && install "$A"; then
	: >"$PENDING"
fi
[ "$(strict)" = "$before" ] || : >"$PENDING"

# Values are read at startup only. akka-apps goes first, so bbb-web's
# keepalive finds it.
web=false
if [ -e "$PENDING" ]; then
	systemctl restart bbb-apps-akka
	: >"$WEB_PENDING"
fi
if [ -e "$WEB_PENDING" ]; then
	web=true
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
	rm -f "$WEB_PENDING"
fi
if [ -e "$PENDING" ]; then
	# Healthy once it hears from bbb-web.
	waited=0
	until curl -fsS -m 5 -o /dev/null http://127.0.0.1:8901/healthz 2>/dev/null; do
		if [ "$waited" -ge 300 ]; then
			echo "akka-apps wasn't healthy within 300s of the restart" >&2
			journalctl -u bbb-apps-akka -n 30 --no-pager >&2 || true
			exit 1
		fi
		sleep 2
		waited=$((waited + 2))
	done
	rm -f "$PENDING"
	echo "bbb-apps-akka and bbb-web restarted with $NAME"
elif $web; then
	echo "bbb-web restarted with $NAME"
else
	echo "bbb-web already runs with $NAME"
fi
