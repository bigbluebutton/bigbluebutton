#!/usr/bin/env bash
# Ports one pull request merged into v4.0.x-develop to v4.1.x-develop: cherry-picks its change onto a
# sync/v4.1/pr-<N> branch and opens a pull request for it, which starts its own checks. Merging it is
# left to .github/scripts/sync-merge-green-port.sh. A port with conflicts opens as a draft with the
# "sync: needs maintainer" label; anything that cannot be ported is reported on the source pull
# request with the same label.
#
# Run by .github/workflows/sync-v4.0-into-v4.1.yml. Everything about the source pull request comes in
# through the environment and is only ever used quoted: nothing from it is evaluated or executed.
#
# Inputs (env):
#   GH_TOKEN          the SYNC_TOKEN secret (GitHub App or PAT): pushes, pull requests, comments
#   REPO              owner/name of this repository
#   SOURCE_PR_NUMBER, SOURCE_PR_TITLE, SOURCE_HEAD_REF, SOURCE_HEAD_REPO, SOURCE_AUTHOR
#   SOURCE_LABELS     JSON array with the label names of the source pull request
#   MERGE_SHA         merge_commit_sha of the source pull request
#   WORK_DIR          checkout of the target branch, with push credentials
#   RUN_URL           link to this workflow run
# Optional (env):
#   SOURCE_BRANCH (v4.0.x-develop), TARGET_BRANCH (v4.1.x-develop), GIT_REMOTE (origin)
set -euo pipefail

SOURCE_BRANCH=${SOURCE_BRANCH:-v4.0.x-develop}
TARGET_BRANCH=${TARGET_BRANCH:-v4.1.x-develop}
GIT_REMOTE=${GIT_REMOTE:-origin}
SOURCE_HEAD_REPO=${SOURCE_HEAD_REPO:-}
SOURCE_HEAD_REF=${SOURCE_HEAD_REF:-}
SOURCE_LABELS=${SOURCE_LABELS:-[]}

BOT_EMAIL='41898282+github-actions[bot]@users.noreply.github.com'
NEEDS_MAINTAINER='sync: needs maintainer'
SKIP_LABEL='no-sync-4.1'
# Pull requests that merge a whole line or release ("Merge v4.0.x-release (v4.0.4) into
# v4.0.x-develop", "Merge 4.0.0 rc.2 into ...", branch merge-v4.0.x-release-4.0.4-into-...) are not
# ported: their content reaches 4.1 through the merge-forward of the lines themselves. The title or
# branch has to read "Merge <version> ... into <version>", so "port pull requests merged into
# v4.0.x-develop" or "Fix Merge 4.0 compatibility handling" are not mistaken for one.
LINE_MERGE_RE='(^|[^[:alnum:]])[Mm]erge[ -]v?[0-9]+\.[0-9]+.*[ -]into[ -]v?[0-9]+\.[0-9]+'
LINE_BRANCH_RE='^v[0-9]+\.[0-9]+\.x-(release|develop)$'

: "${GH_TOKEN:?the SYNC_TOKEN secret is required}" "${REPO:?}" "${SOURCE_PR_NUMBER:?}" "${SOURCE_PR_TITLE?}"
: "${SOURCE_AUTHOR?}" "${MERGE_SHA:?}" "${WORK_DIR:?}" "${RUN_URL:?}"

N=$SOURCE_PR_NUMBER
SYNC_BRANCH="sync/v4.1/pr-$N"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

log() { printf '%s\n' "$*" >&2; }

summary() {
  if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then printf '%s\n' "$*" >> "$GITHUB_STEP_SUMMARY"; fi
  log "$*"
}

add_label() {
  local number=$1 name=$2
  jq -n --arg l "$name" '{labels: [$l]}' > "$TMP/labels.json"
  gh api "repos/$REPO/issues/$number/labels" --input "$TMP/labels.json" --silent ||
    log "could not add the label '$name' to #$number"
}

comment() {
  local number=$1 body=$2
  jq -n --arg b "$body" '{body: $b}' > "$TMP/comment.json"
  gh api "repos/$REPO/issues/$number/comments" --input "$TMP/comment.json" --silent ||
    log "could not comment on #$number"
}

# The change could not be ported: the source pull request carries the notice and the job fails, so
# the run shows up as failed.
fail_on_source() {
  local reason=$1
  comment "$N" "The automatic port of this change to \`$TARGET_BRANCH\` failed: $reason
A maintainer needs to port it by hand. Details: $RUN_URL"
  add_label "$N" "$NEEDS_MAINTAINER"
  summary "Failed: $reason"
  exit 1
}

# --- Should this pull request be ported? ---------------------------------------------------------

if jq -e --arg l "$SKIP_LABEL" 'index($l) != null' <<< "$SOURCE_LABELS" > /dev/null; then
  comment "$N" "Not ported to \`$TARGET_BRANCH\`: this pull request has the \`$SKIP_LABEL\` label."
  summary "Skipped: #$N has the '$SKIP_LABEL' label."
  exit 0
fi
if [[ $SOURCE_PR_TITLE =~ $LINE_MERGE_RE || $SOURCE_HEAD_REF =~ $LINE_MERGE_RE ]] ||
   { [ "$SOURCE_HEAD_REPO" = "$REPO" ] && [[ $SOURCE_HEAD_REF =~ $LINE_BRANCH_RE ]]; }; then
  comment "$N" "Not ported to \`$TARGET_BRANCH\` automatically: this pull request merges a whole line or release, which reaches \`$TARGET_BRANCH\` through the merge of the lines."
  summary "Skipped: #$N merges a whole line or release; it reaches $TARGET_BRANCH through the line merge."
  exit 0
fi
existing=$(gh api "repos/$REPO/pulls?state=open&head=${REPO%%/*}:$SYNC_BRANCH" --jq '.[0].number // empty')
if [ -n "$existing" ]; then
  summary "Skipped: the port of #$N is already open as #$existing."
  exit 0
fi

# --- Which commit does it bring? -----------------------------------------------------------------

cd "$WORK_DIR"
git config user.name 'github-actions[bot]'
git config user.email "$BOT_EMAIL"
git fetch --no-tags --quiet --depth=2 "$GIT_REMOTE" "$MERGE_SHA" "+refs/heads/$TARGET_BRANCH:refs/remotes/$GIT_REMOTE/$TARGET_BRANCH"

parents=$(git rev-list --parents -n 1 "$MERGE_SHA" | wc -w)
if [ "$parents" -ge 3 ]; then
  # Merge commit: port the change against the first parent, credited to the author of the pull
  # request's head commit (the merge commit's author is whoever pressed the button).
  mode=merge-commit
  pick_options=(-m 1)
  redo="git cherry-pick -x -m 1 $MERGE_SHA"
  author=$(git log -1 --format='%an <%ae>' "$MERGE_SHA^2")
  printf '%s (#%s)\n\n(cherry picked from commit %s)\n' "$SOURCE_PR_TITLE" "$N" "$MERGE_SHA" > "$TMP/message"
else
  # One parent: a squash, or the last commit of a rebase merge. The rebase case is not ported: its
  # other commits sit before this one on the source branch.
  pr_commits=$(gh api "repos/$REPO/pulls/$N" --jq '.commits')
  if [ "$pr_commits" -gt 1 ]; then
    if ! prev_prs=$(gh api "repos/$REPO/commits/$(git rev-parse "$MERGE_SHA~1")/pulls" --jq '.[].number'); then
      fail_on_source "could not tell from the GitHub API whether #$N was merged by rebase."
    fi
    if grep -qx "$N" <<< "$prev_prs"; then
      fail_on_source "#$N was merged by rebase, so its $pr_commits commits have to be ported by hand."
    fi
  fi
  mode=squash
  pick_options=()
  redo="git cherry-pick -x $MERGE_SHA"
  author=$(git log -1 --format='%an <%ae>' "$MERGE_SHA")
  original=$(git log -1 --format=%B "$MERGE_SHA")
  printf '%s\n\n(cherry picked from commit %s)\n' "$original" "$MERGE_SHA" > "$TMP/message"
fi
log "Porting #$N ($mode): $MERGE_SHA"

# --- Cherry-pick onto the sync branch ------------------------------------------------------------

git checkout --quiet -B "$SYNC_BRANCH" "$GIT_REMOTE/$TARGET_BRANCH"
conflicts=()
if ! git cherry-pick --no-commit "${pick_options[@]}" "$MERGE_SHA" > "$TMP/cherry-pick.log" 2>&1; then
  mapfile -t conflicts < <(git diff --name-only --diff-filter=U)
  if [ "${#conflicts[@]}" -eq 0 ]; then
    cat "$TMP/cherry-pick.log" >&2
    fail_on_source "the cherry-pick failed."
  fi
  # Conflicts are committed with their markers, so a maintainer can resolve them on the sync branch.
  git add -A
fi
cat "$TMP/cherry-pick.log" >&2

if git diff --cached --quiet; then
  if [ "${#conflicts[@]}" -gt 0 ]; then
    # A conflict that leaves nothing to commit (a deletion of a file that the target branch changed,
    # for example): there is no branch to open as a draft, so the source pull request gets the notice.
    # shellcheck disable=SC2016 # literal backticks: markdown code spans
    conflict_list=$(printf '`%s` ' "${conflicts[@]}")
    fail_on_source "the cherry-pick conflicted in ${conflict_list}and left no change to open a pull request with."
  fi
  comment "$N" "This change is already on \`$TARGET_BRANCH\`; nothing to port."
  summary "Nothing to port: #$N is already on $TARGET_BRANCH."
  exit 0
fi
git cherry-pick --quit 2> /dev/null || true
git commit --quiet --author="$author" -F "$TMP/message"

if ! git push --force --quiet "$GIT_REMOTE" "HEAD:refs/heads/$SYNC_BRANCH" 2> "$TMP/push.log"; then
  cat "$TMP/push.log" >&2
  fail_on_source "pushing the \`$SYNC_BRANCH\` branch was refused."
fi

# --- Open the sync pull request ------------------------------------------------------------------

title="[4.1] $SOURCE_PR_TITLE (#$N)"
title=${title:0:250}
draft=false
[ "${#conflicts[@]}" -eq 0 ] || draft=true
# shellcheck disable=SC2016 # literal backticks: markdown code spans
{
  printf 'Automatic port of #%s (by `%s`) from `%s` to `%s`.\n\n' "$N" "$SOURCE_AUTHOR" "$SOURCE_BRANCH" "$TARGET_BRANCH"
  printf -- '- Source commit: %s (%s)\n' "$MERGE_SHA" "$mode"
  printf -- '- Sync run: %s\n' "$RUN_URL"
  if [ "$draft" = true ]; then
    printf '\nThe cherry-pick had conflicts in these files. They are committed with their conflict markers:\n\n'
    printf -- '- `%s`\n' "${conflicts[@]}"
    printf '\nTo redo the port with a merge tool, start from `%s` and run:\n\n```\n%s\n```\n' "$TARGET_BRANCH" "$redo"
    printf '\nThis pull request needs a maintainer and is not merged automatically.\n'
  else
    printf '\nThis pull request is merged automatically once a run of `Automated tests` on its head has passed, every other check and commit status is green, and it is mergeable. Otherwise it stays open for a maintainer.\n'
  fi
} > "$TMP/body.md"
jq -n --arg title "$title" --rawfile body "$TMP/body.md" --arg head "$SYNC_BRANCH" --arg base "$TARGET_BRANCH" \
  --argjson draft "$draft" '{title: $title, body: $body, head: $head, base: $base, draft: $draft}' > "$TMP/pr.json"
if ! SYNC_PR=$(gh api "repos/$REPO/pulls" --input "$TMP/pr.json" --jq '.number'); then
  fail_on_source "the sync pull request for the \`$SYNC_BRANCH\` branch could not be opened."
fi
comment "$N" "Ported to \`$TARGET_BRANCH\` in #$SYNC_PR."
summary "Opened #$SYNC_PR ($mode) for #$N."

if [ "$draft" = true ]; then
  add_label "$SYNC_PR" "$NEEDS_MAINTAINER"
  comment "$N" "The port to \`$TARGET_BRANCH\` (#$SYNC_PR) has conflicts and needs a maintainer to resolve them."
  summary "Left open as draft: conflicts in ${conflicts[*]}"
fi
