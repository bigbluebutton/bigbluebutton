#!/bin/sh
# Switch bbb-web on a packaged BigBlueButton server to a config profile, and
# back. A profile is an overlay in ../bbb-web/profiles/NAME.properties: its
# settings are appended to /etc/bigbluebutton/bbb-web.properties, where the
# last value of a key wins, and bbb-web is restarted.
#
#   profile.sh NAME      apply a profile
#   profile.sh default   restore the server's own file
#   profile.sh status    print the profile in force
#
# BBB_EXEC says how to reach the server, as root:
#   local                  this machine is the server
#   docker exec -i bbb40   a container
#   ssh root@host          another machine
# Without it the script exits 77, which bbb-conform reads as "this server
# can't be switched" and skips the profile's cases.
set -eu

here=$(cd "$(dirname "$0")" && pwd)
name=${1:-}
case $name in
	'' | *[!a-z0-9-]*)
		echo "usage: profile.sh NAME|default|status (NAME: lower-case letters, digits and dashes)" >&2
		exit 2
		;;
esac
if [ -z "${BBB_EXEC:-}" ]; then
	echo "BBB_EXEC is not set, so the server can't be switched: set it to local, \"docker exec -i <container>\" or \"ssh root@<host>\"" >&2
	exit 77
fi
overlay=/dev/null
case $name in
	default | status) ;;
	*)
		overlay=$here/../bbb-web/profiles/$name.properties
		if [ ! -f "$overlay" ]; then
			echo "no profile $name: $overlay doesn't exist" >&2
			exit 2
		fi
		;;
esac

# One script goes to the server on stdin, with the overlay in it, so the
# same thing works locally, in a container and over ssh.
{
	printf 'NAME=%s\n' "$name"
	echo "OVERLAY=\$(mktemp)"
	echo "trap 'rm -f \"\$OVERLAY\"' EXIT"
	echo "cat > \"\$OVERLAY\" <<'BBB_CONFORM_OVERLAY'"
	cat "$overlay"
	echo "BBB_CONFORM_OVERLAY"
	cat "$here/profile-remote.sh"
} | if [ "$BBB_EXEC" = local ]; then sh -s; else $BBB_EXEC sh -s; fi
