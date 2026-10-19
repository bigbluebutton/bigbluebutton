#!/usr/bin/env bash
# Sample entrypoint for docker/tests/uid/check.sh (see Dockerfile).
set -euo pipefail
# shellcheck source=docker/lib/entrypoint-lib.sh
source /usr/local/lib/bbb/entrypoint-lib.sh

bbb_init "$@"
set -- "${BBB_ARGS[@]}"
[ "$#" -gt 0 ] || set -- java -version

bbb_default UID_SAMPLE_VALUE example

if [ "${BBB_UID_SAMPLE_BROKEN:-0}" = 1 ]; then
    # Broken on purpose: assumes a writable home directory.
    mkdir -p "${HOME:-/}/.uid-sample"
fi

dest="$(bbb_path /etc/bigbluebutton/uid-sample.conf)"
bbb_write_shell_vars "$dest" UID_SAMPLE_VALUE

bbb_exec "$@"
