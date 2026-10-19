#!/usr/bin/env bash
# Runs bbb-config's daily cleanup (/etc/cron.daily/bigbluebutton, rendered by the entrypoint)
# at start and then once a day, as cron.daily does on bare metal. The script removes old
# presentations, stale recorder files, logs and the raw data of published recordings; its
# messages go to the container log. A failed run is logged and retried the next day.
set -uo pipefail

INTERVAL_SECONDS=86400

trap 'exit 0' TERM INT

while :; do
    echo "recording-cleanup: running /etc/cron.daily/bigbluebutton"
    # bash, as its #! line says: the rendered copy is on a tmpfs, which Docker mounts noexec.
    bash /etc/cron.daily/bigbluebutton
    echo "recording-cleanup: /etc/cron.daily/bigbluebutton exited with status $?"
    sleep "$INTERVAL_SECONDS" &
    wait $!
done
