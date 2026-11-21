#!/usr/bin/env bash
# Takes the profile block written by bin/apply-profile.sh out of bbb-web.properties again, restarting bbb-web, and
# deletes the copy of the file that bin/apply-profile.sh kept in work/. The rest of the live file stays as it is.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] && { set -a; . ./.env; set +a; }
backup=work/bbb-web.properties.orig
props=${PC_BBB_WEB_PROPERTIES:-/etc/bigbluebutton/bbb-web.properties}
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
# stdin without the profile block, written to $1 and ending in a newline unless empty, as bin/apply-profile.sh builds it
without_block() {
  sed '/^# pc-profile-begin/,/^# pc-profile-end/d' > "$1"
  if [ -s "$1" ] && [ -n "$(tail -c1 "$1")" ]; then echo >> "$1"; fi
}
if sudo -n test -f "$props"; then sudo -n cat "$props"; fi > "$tmp/live"
if grep -q '^# pc-profile-begin' "$tmp/live"; then
  PC_ALLOW_RESTART=1 bin/apply-profile.sh defaults
  echo "restore-profile: $props restored"
else
  echo "restore-profile: nothing to restore"
fi
if [ -f "$backup" ]; then
  without_block "$tmp/now" < "$tmp/live"
  without_block "$tmp/before" < "$backup"
  if ! cmp -s "$tmp/now" "$tmp/before"; then
    echo "restore-profile: $props was changed outside the suite since it first applied a profile; those changes were kept"
  fi
  rm -f "$backup" "$backup.absent"
fi
