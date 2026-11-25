#!/usr/bin/env bash
# Merges the green sync pull requests opened by sync-pr-to-v4.1.sh. Every open pull request from a
# sync/v4.1/pr-<N> branch into v4.1.x-develop that is not a draft and has no "sync: needs maintainer"
# label is merged when:
#   - a run of the Automated tests workflow on its head commit has passed (a port that only touches
#     docs or locale files gets no such run, so it waits for a maintainer even if the lint checks
#     that run on every pull request are green);
#   - every check run and the combined commit status on its head commit are green;
#   - it is mergeable.
# A pull request with anything red gets a comment and the label, and is not looked at again. One
# still waiting for something is left alone until the next run. After a merge the sync branch is
# deleted. Nothing waits: the workflow runs it on a schedule and when the tests finish.
#
# Run by .github/workflows/sync-v4.1-merge-green-ports.yml, which is off by default and runs only
# with the repository variable SYNC_V41_AUTO_MERGE=true.
#
# Inputs (env):
#   GH_TOKEN          the SYNC_TOKEN secret: a merge made with it starts the push workflows of the
#                     target branch, which a merge made with GITHUB_TOKEN would not
#   REPO              owner/name of this repository
#   RUN_URL           link to this workflow run
# Optional (env):
#   TARGET_BRANCH (v4.1.x-develop), CI_WORKFLOW (automated-tests.yml)
set -euo pipefail

TARGET_BRANCH=${TARGET_BRANCH:-v4.1.x-develop}
CI_WORKFLOW=${CI_WORKFLOW:-automated-tests.yml}
NEEDS_MAINTAINER='sync: needs maintainer'
SYNC_PREFIX='sync/v4.1/pr-'

: "${GH_TOKEN:?the SYNC_TOKEN secret is required}" "${REPO:?}" "${RUN_URL:?}"

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

log() { printf '%s\n' "$*" >&2; }

summary() {
  if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then printf '%s\n' "$*" >> "$GITHUB_STEP_SUMMARY"; fi
  log "$*"
}

comment() {
  local number=$1 body=$2
  jq -n --arg b "$body" '{body: $b}' > "$TMP/comment.json"
  gh api "repos/$REPO/issues/$number/comments" --input "$TMP/comment.json" --silent ||
    log "could not comment on #$number"
}

add_label() {
  local number=$1 name=$2
  jq -n --arg l "$name" '{labels: [$l]}' > "$TMP/labels.json"
  gh api "repos/$REPO/issues/$number/labels" --input "$TMP/labels.json" --silent ||
    log "could not add the label '$name' to #$number"
}

# leave_open <sync pr> <source pr> <reason>: hand the pull request to a maintainer.
leave_open() {
  local pr=$1 source=$2 reason=$3
  comment "$pr" "Not merged automatically: $reason
A maintainer needs to take a look. Details: $RUN_URL"
  comment "$source" "The port of this change to \`$TARGET_BRANCH\` (#$pr) was not merged automatically: $reason"
  add_label "$pr" "$NEEDS_MAINTAINER"
  summary "Left open: #$pr, $reason"
}

# evaluate <sync pr> <head sha> <source pr>: merge, hand over or leave for the next run.
evaluate() {
  local pr=$1 head=$2 source=$3 run status conclusion

  # The latest Automated tests run on this exact head commit.
  if ! gh api "repos/$REPO/actions/workflows/$CI_WORKFLOW/runs?head_sha=$head&per_page=1" > "$TMP/runs.json"; then
    log "#$pr: could not read the $CI_WORKFLOW runs; trying again next time."
    return 0
  fi
  run=$(jq -r '.workflow_runs[0].html_url // empty' "$TMP/runs.json")
  status=$(jq -r '.workflow_runs[0].status // empty' "$TMP/runs.json")
  conclusion=$(jq -r '.workflow_runs[0].conclusion // empty' "$TMP/runs.json")
  if [ -z "$run" ]; then
    log "#$pr: no $CI_WORKFLOW run on $head; it waits for a maintainer or for the run."
    return 0
  fi
  if [ "$status" != completed ]; then
    log "#$pr: $CI_WORKFLOW still running ($run)."
    return 0
  fi
  if [ "$conclusion" != success ]; then
    leave_open "$pr" "$source" "the automated tests ended in \`$conclusion\` ($run)."
    return 0
  fi

  # Every check run (all pages; a list shorter than the total is read again next time) and the
  # combined commit status, which covers every context.
  if ! gh api "repos/$REPO/commits/$head/status" > "$TMP/status.json" ||
     ! gh api --paginate "repos/$REPO/commits/$head/check-runs?per_page=100" > "$TMP/check-pages.json"; then
    log "#$pr: could not read the checks; trying again next time."
    return 0
  fi
  jq -s '{total_count: .[0].total_count, check_runs: [.[].check_runs[]]}' "$TMP/check-pages.json" > "$TMP/checks.json"
  local total listed pending failed status_count status_state
  total=$(jq '.total_count' "$TMP/checks.json")
  listed=$(jq '.check_runs | length' "$TMP/checks.json")
  if [ "$listed" -ne "$total" ] || [ "$total" -eq 0 ]; then
    log "#$pr: read $listed of $total check runs; trying again next time."
    return 0
  fi
  failed=$(jq -r '[.check_runs[] | select(.status == "completed" and (.conclusion | IN("success", "neutral", "skipped") | not)) | .name] | join(", ")' "$TMP/checks.json")
  pending=$(jq '[.check_runs[] | select(.status != "completed")] | length' "$TMP/checks.json")
  status_count=$(jq '.total_count' "$TMP/status.json")
  status_state=$(jq -r '.state' "$TMP/status.json")
  if [ -n "$failed" ]; then
    leave_open "$pr" "$source" "these checks did not pass: $failed."
    return 0
  fi
  if [ "$status_count" -gt 0 ] && { [ "$status_state" = failure ] || [ "$status_state" = error ]; }; then
    local contexts
    contexts=$(jq -r '[.statuses[] | select(.state == "failure" or .state == "error") | .context] | join(", ")' "$TMP/status.json")
    leave_open "$pr" "$source" "the commit statuses ended in \`$status_state\` (${contexts:-see the commit})."
    return 0
  fi
  if [ "$pending" -gt 0 ] || { [ "$status_count" -gt 0 ] && [ "$status_state" != success ]; }; then
    log "#$pr: checks still running."
    return 0
  fi

  # Merge check. mergeable_state "unstable" only says that some check is not green, which was
  # verified above; it is also what an empty check suite leaves behind.
  if ! gh api "repos/$REPO/pulls/$pr" > "$TMP/pr.json"; then
    log "#$pr: could not read the pull request; trying again next time."
    return 0
  fi
  local mergeable state
  mergeable=$(jq -r '.mergeable' "$TMP/pr.json")
  state=$(jq -r '.mergeable_state' "$TMP/pr.json")
  if [ "$mergeable" = null ] || [ "$state" = unknown ]; then
    log "#$pr: GitHub has not computed the merge state yet."
    return 0
  fi
  case $state in clean | unstable | has_hooks) ;; *) mergeable=false ;; esac
  if [ "$mergeable" != true ]; then
    leave_open "$pr" "$source" "the merge check is not green (state: $state)."
    return 0
  fi

  # The merge answer is the confirmation; the pull request is read again only when it is missing.
  local merged
  merged=$(gh api -X PUT "repos/$REPO/pulls/$pr/merge" -f merge_method=merge -f sha="$head" --jq '.merged' || true)
  if [ "$merged" != true ]; then
    merged=$(gh api "repos/$REPO/pulls/$pr" --jq '.merged' || true)
  fi
  if [ "$merged" != true ]; then
    leave_open "$pr" "$source" "merging it was refused."
    return 0
  fi
  summary "Merged #$pr into $TARGET_BRANCH."
  comment "$source" "The port of this change to \`$TARGET_BRANCH\` (#$pr) was merged."

  # Delete the sync branch and read it back.
  local branch=$SYNC_PREFIX$source
  if gh api -X DELETE "repos/$REPO/git/refs/heads/$branch" --silent &&
     ! gh api "repos/$REPO/git/ref/heads/$branch" --silent 2> /dev/null; then
    log "#$pr: deleted $branch."
  else
    log "#$pr: could not delete $branch."
  fi
}

gh api --paginate "repos/$REPO/pulls?state=open&base=$TARGET_BRANCH&per_page=100" \
  --jq ".[] | select(.head.repo.full_name == \"$REPO\" and (.head.ref | startswith(\"$SYNC_PREFIX\")))
             | select((.draft | not) and ([.labels[].name] | index(\"$NEEDS_MAINTAINER\") == null))
             | [.number, .head.sha, (.head.ref | ltrimstr(\"$SYNC_PREFIX\"))] | @tsv" > "$TMP/candidates.tsv"
count=$(wc -l < "$TMP/candidates.tsv")
log "Sync pull requests to look at: $count"
while IFS=$'\t' read -r pr head source; do
  [[ $source =~ ^[0-9]+$ ]] || continue
  evaluate "$pr" "$head" "$source"
done < "$TMP/candidates.tsv"
