#!/usr/bin/env bash
# Decides whether the presentation-conversion suite runs for this workflow run.
# Inputs (env): EVENT_NAME, HAS_LABEL (true/false), DISPATCH_JOBS, REF_NAME, BEFORE_SHA.
# Outputs ($GITHUB_OUTPUT): presentation_conversion=true|false, reason=label|paths|dispatch|release-push|unknown-base|none
set -euo pipefail

prefixes=(
  bbb-common-web/
  bbb-common-message/src/main/scala/org/bigbluebutton/common2/msgs/PresentationMsgs.scala
  bbb-common-message/src/main/scala/org/bigbluebutton/common2/msgs/PresentationPodsMsgs.scala
  bigbluebutton-web/
  build/packages-template/bbb-web/
  build/packages-template/bbb-libreoffice-docker/
  bbb-libreoffice/
  bigbluebutton-config/slides/
  akka-bbb-apps/src/main/scala/org/bigbluebutton/core/apps/presentationpod/
  akka-bbb-apps/src/main/scala/org/bigbluebutton/core/apps/presentation/
  akka-bbb-apps/src/main/scala/org/bigbluebutton/core/db/PresPresentationDAO.scala
  akka-bbb-apps/src/main/scala/org/bigbluebutton/core/db/PresPageDAO.scala
  bbb-graphql-server/bbb_schema.sql
  bigbluebutton-html5/imports/ui/components/presentation/presentation-toast/
  bigbluebutton-html5/imports/ui/components/actions-bar/media-area/media-sharing/presentation/
  bigbluebutton-tests/presentation-conversion/
  bigbluebutton-tests/playwright/core/media/
  .github/scripts/presentation-conversion-gate.sh
  .github/workflows/automated-tests.yml
)

decide() {
  echo "presentation_conversion=$1" >> "${GITHUB_OUTPUT:-/dev/stdout}"
  echo "reason=$2" >> "${GITHUB_OUTPUT:-/dev/stdout}"
  echo "presentation-conversion suite: run=$1 ($2)"
  exit 0
}

touches_conversion() {
  local f p
  while IFS= read -r f; do
    for p in "${prefixes[@]}"; do
      if [[ "$f" == "$p"* ]]; then
        echo "  changed: $f"
        return 0
      fi
    done
  done
  return 1
}

case "${EVENT_NAME:-}" in
  workflow_dispatch)
    [[ "${DISPATCH_JOBS:-all}" == "all" || "${DISPATCH_JOBS:-}" == "presentation-conversion" ]] && decide true dispatch
    decide false none
    ;;
  pull_request)
    [[ "${HAS_LABEL:-false}" == "true" ]] && decide true label
    if ! git rev-parse -q --verify HEAD^1 >/dev/null; then decide true unknown-base; fi
    touches_conversion < <(git diff --name-only HEAD^1 HEAD) && decide true paths
    decide false none
    ;;
  push)
    [[ "${REF_NAME:-}" == *-release ]] && decide true release-push
    if [[ -z "${BEFORE_SHA:-}" || "${BEFORE_SHA}" =~ ^0+$ ]] || ! git fetch -q --depth=1 origin "$BEFORE_SHA" 2>/dev/null; then
      decide true unknown-base
    fi
    touches_conversion < <(git diff --name-only "$BEFORE_SHA" HEAD) && decide true paths
    decide false none
    ;;
  *)
    decide false none
    ;;
esac
