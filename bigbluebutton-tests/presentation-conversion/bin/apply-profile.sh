#!/usr/bin/env bash
# Puts profiles/<name>.properties on top of the server's bbb-web.properties and restarts bbb-web when that changes it.
# The profile goes into a marked block, rebuilt from the live file on every call, so edits made outside the suite stay.
# The first call also keeps a copy of the file in work/ for recovery by hand; nothing writes that copy back.
# bin/restore-profile.sh takes the block out again.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] && { set -a; . ./.env; set +a; }
profile=${1:?usage: bin/apply-profile.sh <profile>}
overlay=profiles/$profile.properties
props=${PC_BBB_WEB_PROPERTIES:-/etc/bigbluebutton/bbb-web.properties}
backup=work/bbb-web.properties.orig
[ -f "$overlay" ] || { echo "apply-profile: no such profile: $profile" >&2; exit 2; }
mkdir -p work
if [ ! -f "$backup" ]; then
  if sudo -n test -f "$props"; then sudo -n cat "$props" > "$backup"; else : > "$backup"; touch "$backup.absent"; fi
fi
live=$(mktemp)
desired=$(mktemp)
trap 'rm -f "$live" "$desired"' EXIT
if sudo -n test -f "$props"; then sudo -n cat "$props"; fi > "$live"
sed '/^# pc-profile-begin/,/^# pc-profile-end/d' "$live" > "$desired"
body=$(grep -vE '^[[:space:]]*(#|$)' "$overlay" || true)
if [ -n "$body" ]; then
  # a file without a final newline would otherwise get the marker glued onto its last property
  if [ -s "$desired" ] && [ -n "$(tail -c1 "$desired")" ]; then echo >> "$desired"; fi
  printf '# pc-profile-begin %s\n%s\n# pc-profile-end\n' "$profile" "$body" >> "$desired"
fi
if cmp -s "$live" "$desired"; then
  echo "apply-profile: $profile is already active"
  exit 0
fi
if [ "${PC_ALLOW_RESTART:-0}" != 1 ]; then
  foreign=$(npx tsx src/cli/meetings.ts) || { echo "apply-profile: cannot list meetings" >&2; exit 3; }
  if [ -n "$foreign" ]; then
    echo "apply-profile: not restarting bbb-web, these meetings were not created by the suite:" >&2
    echo "$foreign" >&2
    echo "apply-profile: set PC_ALLOW_RESTART=1 to restart anyway" >&2
    exit 3
  fi
fi
if [ ! -s "$desired" ] && [ -f "$backup.absent" ]; then
  sudo -n rm -f "$props"
  echo "apply-profile: removed $props, which held only the profile block and did not exist before the suite; restarting bbb-web"
else
  if sudo -n test -f "$props"; then sudo -n cp "$desired" "$props"; else sudo -n install -m 0644 "$desired" "$props"; fi
  echo "apply-profile: $profile written to $props, restarting bbb-web"
fi
sudo -n systemctl restart bbb-web
url=$(npx tsx -e "import('./src/env').then(e => console.log(e.loadTarget().apiBase))")
for _ in $(seq 1 120); do
  if curl -sk --max-time 5 "$url" | grep -q '<returncode>SUCCESS</returncode>'; then echo "apply-profile: bbb-web answers again"; exit 0; fi
  sleep 2
done
echo "apply-profile: bbb-web did not come back within 240 s" >&2
exit 4
