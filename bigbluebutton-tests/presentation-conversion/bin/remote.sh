#!/usr/bin/env bash
# Development loop from a workstation: sync the suite (and the repository files its fixtures reference) to a BBB
# server, run a command there, then pull back results/, playwright-report/ and goldens/. Example:
#   bin/remote.sh bigbluebutton@bbb.example.com bin/run-pass.sh defaults
set -uo pipefail
cd "$(dirname "$0")/.."
host=${1:?usage: bin/remote.sh user@host <command...>}
shift
root=${PC_REMOTE_DIR:-presentation-conversion-src}
suite=bigbluebutton-tests/presentation-conversion
excludes=(--exclude node_modules --exclude work --exclude results --exclude playwright-report --exclude test-results --exclude blob-report --exclude .env)
ssh "$host" "mkdir -p $root/$suite" || exit 3
rsync -a --delete "${excludes[@]}" ./ "$host:$root/$suite/" || exit 3
npx tsx src/cli/files.ts | rsync -a --files-from=- ../.. "$host:$root/" || exit 3
ssh "$host" "cd $root/$suite && { cmp -s package-lock.json node_modules/.package-lock.json 2>/dev/null || npm ci --no-audit --no-fund --loglevel=error; } && $*"
rc=$?
rsync -a "$host:$root/$suite/goldens/" goldens/
rsync -a --delete "$host:$root/$suite/results/" results/ 2>/dev/null
rsync -a --delete "$host:$root/$suite/playwright-report/" playwright-report/ 2>/dev/null
exit $rc
