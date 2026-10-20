#!/usr/bin/env bash
# Restores the bbb-web.properties saved by bin/apply-profile.sh and restarts bbb-web if it differs.
set -euo pipefail
cd "$(dirname "$0")/.."
backup=work/bbb-web.properties.orig
props=${PC_BBB_WEB_PROPERTIES:-/etc/bigbluebutton/bbb-web.properties}
[ -f "$backup" ] || { echo "restore-profile: nothing to restore"; exit 0; }
if [ -f "$backup.absent" ]; then
  if sudo -n test -f "$props"; then
    sudo -n rm -f "$props"
    PC_ALLOW_RESTART=1 sudo -n systemctl restart bbb-web
  fi
else
  PC_ALLOW_RESTART=1 bin/apply-profile.sh defaults
fi
sudo -n cat "$props" 2>/dev/null | cmp -s - "$backup" || [ -f "$backup.absent" ] || { echo "restore-profile: $props differs from the backup" >&2; exit 1; }
rm -f "$backup" "$backup.absent"
echo "restore-profile: $props restored"
