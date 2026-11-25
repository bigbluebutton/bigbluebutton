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

# A switch that stops before install leaves no staged copy behind: it can
# hold the salt. The overlays are profile.sh's, whose trap this replaces.
trap 'rm -f "$F.bbb-conform-next" "$A.bbb-conform-next" "$F.bbb-conform-state.next" "$A.bbb-conform-state.next" "$OVERLAY" "$AKKA_OVERLAY"' EXIT
trap 'exit 1' HUP INT TERM

if [ "$NAME" = status ]; then
	if [ -f "$F.bbb-conform-state" ]; then sed -n 1p "$F.bbb-conform-state"; else echo default; fi
	exit 0
fi

# stage FILE MARK EXTRA: writes what FILE is to hold to FILE.bbb-conform-next:
# the server's own file, kept as FILE.bbb-conform-orig while a profile is in
# force, then, for a profile, "MARK NAME" and EXTRA's settings. A profile's
# mark goes into bbb-web.properties even when it has no settings, and into
# bbb-apps-akka.conf only with settings. FILE.bbb-conform-state holds the
# profile's name and the sha256 of what was written, then, while install
# puts it in place, the sha256 of what it replaces: a file that is neither
# was edited since, and is refused rather than overwritten.
stage() {
	f=$1 mark=$2 extra=$3
	state=$f.bbb-conform-state orig=$f.bbb-conform-orig
	if [ -f "$state" ] && ! sed -n 2,3p "$state" | grep -qxF "$(sum "$f")"; then
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
	# Readable by root alone until install gives it the file's own mode
	# (a leftover would keep its own).
	rm -f "$f.bbb-conform-next"
	(umask 077 && cat "$orig" >"$f.bbb-conform-next")
	if [ "$NAME" != default ] && { [ "$f" = "$F" ] || [ -s "$extra" ]; }; then
		printf '\n%s %s\n' "$mark" "$NAME" >>"$f.bbb-conform-next"
		cat "$extra" >>"$f.bbb-conform-next"
	fi
}

# install FILE MARKER: puts FILE.bbb-conform-next in place, with FILE's
# owner and mode, so a switch that fails later is retried rather than taken
# for the server's own file. MARKER, the restart FILE's service then owes,
# and the state, naming both the new FILE and the one it replaces, are
# written first: a switch that stops before the mv or after it finds FILE
# as recorded on the next run, and still restarts the service. A FILE that
# already held it is only recorded. Exits if FILE can't be written.
install() {
	f=$1 marker=$2
	next=$f.bbb-conform-next
	if cmp -s "$next" "$f"; then
		rm -f "$next"
		record "$f"
		return 0
	fi
	if ! { : >"$marker" &&
		set_state "$f" "$NAME" "$(sum "$next")" "$(sum "$f")" &&
		chown --reference="$f.bbb-conform-orig" "$next" &&
		chmod --reference="$f.bbb-conform-orig" "$next" &&
		mv "$next" "$f"; }; then
		echo "couldn't write $f" >&2
		exit 1
	fi
	record "$f"
}

# record FILE: notes what was written, now that it is in place, or forgets
# the profile when FILE is the server's own again.
record() {
	f=$1
	if cmp -s "$f" "$f.bbb-conform-orig"; then
		rm -f "$f.bbb-conform-state" "$f.bbb-conform-orig"
	else
		set_state "$f" "$NAME" "$(sum "$f")"
	fi
}

# set_state FILE LINE...: replaces FILE's state with LINEs as a whole, so a
# switch that stops while writing it leaves the old state or the new one.
set_state() {
	s=$1.bbb-conform-state
	shift
	printf '%s\n' "$@" >"$s.next" && mv "$s.next" "$s"
}

# strict FILE: the one of bbb-web's settings akka-apps reads at startup too
# (SystemConfiguration.scala), read as java.util.Properties reads it. Lines
# end at LF, CR or CRLF. One that ends in an odd number of backslashes goes
# on into the next, without that line's leading blanks. Blank lines are
# skipped, and so are comments: a line whose first character, blanks
# aside, is # or ! is one, unless it continues a line that has text
# already. Keys and values have their escapes decoded, and the key's last
# value counts: true when it says true in any case once trimmed. A
# malformed \uxxxx in any key or value fails the load, which akka-apps
# takes as false. NUL is read as \001, which Java treats alike here. Prints
# unknown if awk fails.
strict() {
	tr '\000' '\001' <"$1" | LC_ALL=C awk '
	# natural LINE: a line as written; line holds what came before it, when
	# the lines before went on into it.
	function natural(s) {
		sub(/^[ \t\f]+/, "", s)
		if (line == "" && s ~ /^[#!]/) return
		match(s, /\\+$/)
		if (RLENGTH > 0 && RLENGTH % 2) { line = line substr(s, 1, length(s) - 1); return }
		s = line s
		line = ""
		if (s != "") logical(s)
	}
	function logical(s,   n, i, c, esc, from, sep) {
		n = length(s); from = n + 1; sep = 0; esc = 0
		for (i = 1; i <= n; i++) {
			c = substr(s, i, 1)
			if (!esc && (c == "=" || c == ":")) { from = i + 1; sep = 1; break }
			if (!esc && (c == " " || c == "\t" || c == "\f")) { from = i + 1; break }
			esc = (c == "\\") ? !esc : 0
		}
		for (; from <= n; from++) {
			c = substr(s, from, 1)
			if (c == " " || c == "\t" || c == "\f") continue
			if (sep || (c != "=" && c != ":")) break
			sep = 1
		}
		# Every key and value is decoded: a malformed escape fails the load.
		if (decode(substr(s, 1, i - 1)) == key) val = decode(substr(s, from))
		else decode(substr(s, from))
	}
	function decode(s,   out, n, i, c, h, k, d) {
		if (!index(s, "\\")) return s
		out = ""; n = length(s)
		for (i = 1; i <= n; i++) {
			c = substr(s, i, 1)
			if (c == "\\") {
				c = substr(s, ++i, 1)
				if (c == "u") {
					if (i + 4 > n) { bad = 1; return "" }
					h = 0
					for (k = 1; k <= 4; k++) {
						d = index("0123456789abcdef", tolower(substr(s, i + k, 1)))
						if (!d) { bad = 1; return "" }
						h = h * 16 + d - 1
					}
					i += 4
					# Only ASCII matters here: \001 stands in for NUL, \200 for the rest.
					c = h == 0 ? "\001" : h < 128 ? sprintf("%c", h) : "\200"
				} else if (c == "t") c = "\t"
				else if (c == "r") c = "\r"
				else if (c == "n") c = "\n"
				else if (c == "f") c = "\f"
			}
			out = out c
		}
		return out
	}
	BEGIN {
		key = "clientSettingsOverrideStrictValidation"
		# What String.trim drops, NUL aside.
		for (i = 1; i <= 32; i++) low = low sprintf("%c", i)
	}
	{
		# A CR before the LF is part of a CRLF; any other ends a line too.
		sub(/\r$/, "")
		n = split($0, part, "\r")
		if (!n) natural("")
		for (i = 1; i <= n; i++) natural(part[i])
	}
	END {
		if (line != "") logical(line)
		if (bad) val = ""
		while (val != "" && index(low, substr(val, 1, 1))) val = substr(val, 2)
		while (val != "" && index(low, substr(val, length(val), 1))) val = substr(val, 1, length(val) - 1)
		print (tolower(val) == "true" ? "true" : "false")
	}' || echo unknown
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

# Each restart marker is made before the file it is for changes. A setting
# strict couldn't read counts as changed.
s=$(strict "$F.bbb-conform-next")
[ "$s" != unknown ] && [ "$s" = "$(strict "$F")" ] || : >"$PENDING"
install "$F" "$WEB_PENDING"
systemctl is-active -q bbb-web || : >"$WEB_PENDING"
if $akka; then
	install "$A" "$PENDING"
fi

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
