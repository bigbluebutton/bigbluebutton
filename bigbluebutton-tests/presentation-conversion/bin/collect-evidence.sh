#!/usr/bin/env bash
# Copies what the server produced for every fixture with a regression into evidence/, for the CI artifact.
# Private fixtures are never copied: their renders would end up in a downloadable artifact.
set -euo pipefail
cd "$(dirname "$0")/.."
summary=results/summary.json
[ -f "$summary" ] || { echo "collect-evidence: no $summary"; exit 0; }
rm -rf evidence && mkdir -p evidence
node -e '
  const s = require("./results/summary.json");
  const seen = new Set();
  for (const r of s.regressions) {
    const key = r.profile + "/" + r.fixture;
    if (!seen.has(key)) { seen.add(key); console.log(s.runId + "\t" + r.profile + "\t" + r.fixture); }
  }' | while IFS=$'\t' read -r run profile fixture; do
  if [ -n "$(find fixtures/private -name "$fixture.yaml" -print -quit 2>/dev/null)" ]; then
    echo "collect-evidence: $fixture is private, skipped"
    continue
  fi
  src="work/$run/$profile/fixtures/$fixture"
  [ -d "$src" ] && mkdir -p "evidence/$profile" && cp -a "$src" "evidence/$profile/"
done
du -sh evidence 2>/dev/null || true
