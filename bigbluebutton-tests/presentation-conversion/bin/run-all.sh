#!/usr/bin/env bash
# Runs the defaults and every profile, restores bbb-web.properties and writes results/summary.md.
# PC_PROFILES="defaults tight-limits" limits the profiles. Exit code: 0 pass, 1 regression, 2 a profile could not run.
set -uo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] && { set -a; . ./.env; set +a; }
export PC_RUN_ID=${PC_RUN_ID:-$(date -u +%Y%m%dT%H%M%SZ)}
profiles=${PC_PROFILES:-"defaults rasterize-all low-thresholds tight-limits office-precheck"}
rm -rf results
mkdir -p results
trap 'bin/restore-profile.sh' EXIT
for p in $profiles; do
  echo "=== profile $p"
  bin/run-pass.sh "$p" "$@"
done
bin/restore-profile.sh
trap - EXIT
npx tsx src/cli/summarize.ts
