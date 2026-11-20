#!/usr/bin/env bash
# Writes goldens from what the server produces now: bin/bless.sh <profile> [--from-reference] [fixture-id ...] [--playwright-option ...]
# --from-reference takes the poppler render of the uploaded PDF instead, for fixtures whose current output is wrong.
# Review the result in playwright-report/<profile> before committing goldens/.
set -uo pipefail
cd "$(dirname "$0")/.."
profile=${1:-defaults}
shift || true
from=actual
ids=()
extra=()
for a in "$@"; do
  case $a in
    --from-reference) from=reference ;;
    --*) extra+=("$a") ;;
    *) ids+=("$a") ;;
  esac
done
export PC_BLESS=1 PC_BLESS_FROM=$from
if [ ${#ids[@]} -gt 0 ]; then PC_FIXTURES=$(IFS=,; echo "${ids[*]}"); export PC_FIXTURES; fi
bin/run-pass.sh "$profile" --update-snapshots=changed "${extra[@]}"
