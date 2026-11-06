#!/bin/sh
# Tier 1 mirrors parts of the packages by hand: install scripts, units,
# Depends lists, the LibreOffice converter. copies.sha256 holds a hash of
# each source as Tier 1 last followed it. This warns about each one that
# has changed since, so the mirror can be checked; it doesn't fail, since
# most changes to those files don't matter to Tier 1. In GitHub Actions,
# the warnings are annotations on the run.
#
#   check-copies.sh           warn about sources that changed
#   check-copies.sh --update  record the sources as they are now, once
#                             Tier 1 follows them
set -eu
here=$(cd "$(dirname "$0")" && pwd)
repo=$(git -C "$here" rev-parse --show-toplevel)
list=$here/copies.sha256
cd "$repo"
if [ "${1:-}" = --update ]; then
	tmp=$(mktemp)
	awk '{print $2}' "$list" | xargs sha256sum > "$tmp"
	mv "$tmp" "$list"
	exit 0
fi
changed=$(sha256sum --check --quiet "$list" 2>/dev/null | sed -n 's/: FAILED.*$//p' || true)
for f in $changed; do
	msg="$f changed since Tier 1 last followed it: check the stack still mirrors it (bigbluebutton-tests/api-conformance/env), then run env/tier1/check-copies.sh --update"
	if [ "${GITHUB_ACTIONS:-}" = true ]; then
		echo "::warning title=Tier 1 copies::$msg"
	else
		echo "warning: $msg" >&2
	fi
done
