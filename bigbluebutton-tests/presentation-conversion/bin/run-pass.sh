#!/usr/bin/env bash
# Runs one profile: applies it (restarting bbb-web if needed), uploads its fixtures and checks the results.
# Extra arguments go to `playwright test`.
set -uo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] && { set -a; . ./.env; set +a; }
profile=${1:-defaults}
shift || true
export PC_PROFILE=$profile
export PC_RUN_ID=${PC_RUN_ID:-$(date -u +%Y%m%dT%H%M%SZ)}
mkdir -p "results/$profile"
rm -f "results/$profile/status"
if ! bin/apply-profile.sh "$profile"; then
  echo setup-failed > "results/$profile/status"
  exit 3
fi
npx playwright test "$@"
rc=$?
echo "$rc" > "results/$profile/status"
cp -f "work/$PC_RUN_ID/$profile/collected.json" "results/$profile/" 2>/dev/null || true
if [ "$profile" != defaults ]; then
  echo "run-pass: profile $profile is still active on this server; bin/restore-profile.sh puts bbb-web.properties back" >&2
fi
exit $rc
