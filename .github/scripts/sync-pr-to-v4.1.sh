#!/usr/bin/env bash
# Ports one pull request merged into v4.0.x-develop to v4.1.x-develop: cherry-picks its change onto a
# sync/v4.1/pr-<N> branch, opens a pull request for it, runs the automated tests on it and merges it
# when the tests pass and the pull request is mergeable. Anything else leaves the pull request open
# for a maintainer, with the reason in a comment and the "sync: needs maintainer" label.
#
# Run by .github/workflows/sync-v4.0-into-v4.1.yml. Everything about the source pull request comes in
# through the environment and is only ever used quoted: nothing from it is evaluated or executed.
#
# Inputs (env):
#   GH_TOKEN          token for the GitHub API (SYNC_TOKEN when the repository has one, else GITHUB_TOKEN)
#   TOKEN_KIND        "sync" (SYNC_TOKEN: pull requests start the CI themselves) or "github"
#   REPO              owner/name of this repository
#   SOURCE_PR_NUMBER, SOURCE_PR_TITLE, SOURCE_HEAD_REF, SOURCE_HEAD_REPO, SOURCE_AUTHOR
#   SOURCE_LABELS     JSON array with the label names of the source pull request
#   MERGE_SHA         merge_commit_sha of the source pull request
#   WORK_DIR          checkout of the target branch, with push credentials
#   RUN_URL           link to this workflow run
# Optional (env):
#   SOURCE_BRANCH (v4.0.x-develop), TARGET_BRANCH (v4.1.x-develop), CI_WORKFLOW (automated-tests.yml),
#   CI_DEADLINE_SECONDS (18000), PR_RUN_WINDOW_SECONDS (600), POLL_SECONDS (60), GIT_REMOTE (origin)
set -euo pipefail

SOURCE_BRANCH=${SOURCE_BRANCH:-v4.0.x-develop}
TARGET_BRANCH=${TARGET_BRANCH:-v4.1.x-develop}
CI_WORKFLOW=${CI_WORKFLOW:-automated-tests.yml}
CI_DEADLINE_SECONDS=${CI_DEADLINE_SECONDS:-18000}
PR_RUN_WINDOW_SECONDS=${PR_RUN_WINDOW_SECONDS:-600}
POLL_SECONDS=${POLL_SECONDS:-60}
GIT_REMOTE=${GIT_REMOTE:-origin}
SOURCE_HEAD_REPO=${SOURCE_HEAD_REPO:-}
SOURCE_HEAD_REF=${SOURCE_HEAD_REF:-}
SOURCE_LABELS=${SOURCE_LABELS:-[]}

BOT_EMAIL='41898282+github-actions[bot]@users.noreply.github.com'
NEEDS_MAINTAINER='sync: needs maintainer'
CONFLICT_LABEL='status: conflict'
SKIP_LABEL='no-sync-4.1'
# Pull requests that merge a whole line or release ("Merge v4.0.x-release (v4.0.4) into
# v4.0.x-develop", "Merge 4.0.0 rc.2 into ...", branch merge-v4.0.x-release-4.0.4-into-...) are not
# ported: their content reaches 4.1 through the merge-forward of the lines themselves. The title or
# branch has to read "Merge <version> ... into <version>", so "port pull requests merged into
# v4.0.x-develop" or "Fix Merge 4.0 compatibility handling" are not mistaken for one.
LINE_MERGE_RE='(^|[^[:alnum:]])[Mm]erge[ -]v?[0-9]+\.[0-9]+.*[ -]into[ -]v?[0-9]+\.[0-9]+'
LINE_BRANCH_RE='^v[0-9]+\.[0-9]+\.x-(release|develop)$'

: "${GH_TOKEN:?}" "${TOKEN_KIND:?}" "${REPO:?}" "${SOURCE_PR_NUMBER:?}" "${SOURCE_PR_TITLE?}" "${SOURCE_AUTHOR?}"
: "${MERGE_SHA:?}" "${WORK_DIR:?}" "${RUN_URL:?}"

N=$SOURCE_PR_NUMBER
SYNC_BRANCH="sync/v4.1/pr-$N"
DEADLINE=$(( $(date +%s) + CI_DEADLINE_SECONDS ))
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

log() { printf '%s\n' "$*" >&2; }

summary() {
  if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then printf '%s\n' "$*" >> "$GITHUB_STEP_SUMMARY"; fi
  log "$*"
}

ensure_label() {
  local name=$1 color=$2 description=$3
  gh api "repos/$REPO/labels/$(jq -rn --arg s "$name" '$s|@uri')" --silent 2>/dev/null && return 0
  gh api "repos/$REPO/labels" -f name="$name" -f color="$color" -f description="$description" --silent ||
    log "could not create the label '$name'"
}

add_label() {
  local number=$1 name=$2
  case $name in
    "$NEEDS_MAINTAINER") ensure_label "$name" d93f0b 'The automatic v4.0 to v4.1 sync needs a maintainer' ;;
    "$CONFLICT_LABEL") ensure_label "$name" b60205 'This pull request has conflicts' ;;
  esac
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

# The sync could not even produce its pull request (push, creation or merge refused): the source
# pull request carries the notice and the job fails, so the run shows up as failed.
fail_on_source() {
  local reason=$1
  comment "$N" "The automatic port of this change to \`$TARGET_BRANCH\` failed: $reason
A maintainer needs to port it by hand. Details: $RUN_URL"
  add_label "$N" "$NEEDS_MAINTAINER"
  summary "Failed: $reason"
  exit 1
}

# The sync pull request exists but cannot be merged automatically: it stays open for a maintainer.
leave_open() {
  local reason=$1
  comment "$SYNC_PR" "Not merged automatically: $reason
A maintainer needs to take a look. Details: $RUN_URL"
  comment "$N" "The port of this change to \`$TARGET_BRANCH\` (#$SYNC_PR) was not merged automatically: $reason"
  add_label "$SYNC_PR" "$NEEDS_MAINTAINER"
  summary "Left open: #$SYNC_PR, $reason"
  exit 0
}

# Glob of a GitHub paths filter (*, **, ?) to an anchored extended regex.
glob_to_regex() {
  local glob=$1 out='' c i=0
  while [ "$i" -lt "${#glob}" ]; do
    c=${glob:i:1}
    if [ "${glob:i:3}" = '**/' ]; then out+='(.*/)?'; i=$((i + 3)); continue; fi
    if [ "${glob:i:2}" = '**' ]; then out+='.*'; i=$((i + 2)); continue; fi
    case $c in
      '*') out+='[^/]*' ;;
      '?') out+='[^/]' ;;
      [.+^\$\(\)\|\{\}\[\]\\]) out+="\\$c" ;;
      *) out+=$c ;;
    esac
    i=$((i + 1))
  done
  printf '^%s$' "$out"
}

# True when every changed file is ignored by the pull_request paths-ignore of the CI workflow on the
# target branch: a pull request touching only those files never gets that run on its own.
only_paths_ignored() {
  local workflow="$WORK_DIR/.github/workflows/$CI_WORKFLOW" pattern file matched
  local -a regexes=()
  [ -f "$workflow" ] || return 1
  while IFS= read -r pattern; do
    [ -n "$pattern" ] || continue
    case $pattern in '!'*) return 1 ;; esac
    regexes+=("$(glob_to_regex "$pattern")")
  done < <(yq '.on.pull_request.paths-ignore[]' "$workflow" 2>/dev/null || true)
  [ "${#regexes[@]}" -gt 0 ] || return 1
  while IFS= read -r file; do
    matched=false
    for pattern in "${regexes[@]}"; do
      if [[ $file =~ $pattern ]]; then matched=true; break; fi
    done
    [ "$matched" = true ] || return 1
  done < "$TMP/changed-files"
  return 0
}

time_left() { [ "$(date +%s)" -lt "$DEADLINE" ]; }

dispatch_ci() {
  local response run_id
  response=$(gh api -X POST "repos/$REPO/actions/workflows/$CI_WORKFLOW/dispatches" \
    -f ref="$SYNC_BRANCH" -f 'inputs[jobs]=all' -F return_run_details=true) || return 1
  run_id=$(jq -r '.workflow_run_id // empty' <<< "$response")
  while [ -z "$run_id" ] && time_left; do
    sleep "$POLL_SECONDS"
    run_id=$(gh api "repos/$REPO/actions/workflows/$CI_WORKFLOW/runs?event=workflow_dispatch&head_sha=$HEAD_SHA" \
      --jq '.workflow_runs[0].id // empty' || true)
  done
  printf '%s' "$run_id"
}

find_pull_request_run() {
  gh api "repos/$REPO/actions/workflows/$CI_WORKFLOW/runs?event=pull_request&head_sha=$HEAD_SHA" \
    --jq '.workflow_runs[0].id // empty'
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
# An open sync pull request means an earlier run got that far. It is resumed (tests and merge) only
# when it is exactly what an earlier run left: not a draft, no maintainer label, and every commit on
# its branch made by this workflow. Anything else stays with the maintainers; a second pull request
# is never opened.
resume=false
gh api "repos/$REPO/pulls?state=open&head=${REPO%%/*}:$SYNC_BRANCH" --jq '.[0] // {}' > "$TMP/existing.json"
existing=$(jq -r '.number // empty' "$TMP/existing.json")
if [ -n "$existing" ]; then
  if jq -e --arg a "$NEEDS_MAINTAINER" --arg b "$CONFLICT_LABEL" \
       '(.draft | not) and ([.labels[].name] | index($a) == null and index($b) == null)' "$TMP/existing.json" > /dev/null &&
     gh api "repos/$REPO/compare/$TARGET_BRANCH...$SYNC_BRANCH" > "$TMP/compare.json" &&
     jq -e --arg email "$BOT_EMAIL" '(.ahead_by > 0) and (.ahead_by == (.commits | length))
       and all(.commits[]; .commit.committer.email == $email)' "$TMP/compare.json" > /dev/null; then
    resume=true
    SYNC_PR=$existing
    HEAD_SHA=$(jq -r '.head.sha' "$TMP/existing.json")
    jq -r '.files[].filename' "$TMP/compare.json" > "$TMP/changed-files"
    if ! gh api --paginate "repos/$REPO/issues/$N/comments" --jq '.[].body' | grep -qF "in #$SYNC_PR."; then
      comment "$N" "Ported to \`$TARGET_BRANCH\` in #$SYNC_PR."
    fi
    summary "Resuming #$SYNC_PR, the port of #$N left by an earlier run."
  else
    summary "Skipped: the port of #$N is already open as #$existing and is in the hands of a maintainer."
    exit 0
  fi
fi

if [ "$resume" = false ]; then
  # --- Which commits does it bring? ----------------------------------------------------------------

  cd "$WORK_DIR"
  git config user.name 'github-actions[bot]'
  git config user.email "$BOT_EMAIL"

  pr_commits=$(gh api "repos/$REPO/pulls/$N" --jq '.commits')
  depth=$(( pr_commits + 1 ))
  [ "$depth" -ge 2 ] || depth=2
  git fetch --no-tags --quiet --depth="$depth" "$GIT_REMOTE" "$MERGE_SHA" "+refs/heads/$TARGET_BRANCH:refs/remotes/$GIT_REMOTE/$TARGET_BRANCH"

  parents=$(git rev-list --parents -n 1 "$MERGE_SHA" | wc -w)
  parents=$(( parents - 1 ))
  mode=squash
  note=''
  draft=false
  pick=("$MERGE_SHA")
  if [ "$parents" -ge 2 ]; then
    mode=merge-commit
    pick=(-m 1 "$MERGE_SHA")
  elif [ "$pr_commits" -gt 1 ]; then
    if ! prev_prs=$(gh api "repos/$REPO/commits/$(git rev-parse "$MERGE_SHA~1")/pulls" --jq '.[].number'); then
      fail_on_source "could not tell from the GitHub API whether #$N was merged by rebase."
    fi
    if grep -qx "$N" <<< "$prev_prs"; then
      # Merged by rebase: the pull request's commits sit one after the other on the source branch.
      mode=rebase
      range=()
      for sha in $(git rev-list --reverse "$MERGE_SHA~$pr_commits..$MERGE_SHA"); do
        if ! gh api "repos/$REPO/commits/$sha/pulls" --jq '.[].number' | grep -x "$N" > /dev/null; then
          mode=rebase-unverified
          break
        fi
        range+=("$sha")
      done
      if [ "$mode" = rebase ]; then
        pick=("${range[@]}")
      else
        draft=true
        note="#$N was merged by rebase with $pr_commits commits, but not all of the last $pr_commits commits on \`$SOURCE_BRANCH\` belong to it, so only its last commit was ported. A maintainer needs to check what is missing."
      fi
    fi
  fi
  log "Porting #$N ($mode): ${pick[*]}"

  # --- Cherry-pick onto the sync branch ------------------------------------------------------------

  git checkout --quiet -B "$SYNC_BRANCH" "$GIT_REMOTE/$TARGET_BRANCH"
  conflicts=()
  export GIT_EDITOR=true
  if ! git cherry-pick -x "${pick[@]}" > "$TMP/cherry-pick.log" 2>&1; then
    # Keep going through the whole list; conflicts are committed with their markers so a maintainer
    # can resolve them on the sync branch.
    rounds=0
    while [ -e "$(git rev-parse --git-path CHERRY_PICK_HEAD)" ] || [ -e "$(git rev-parse --git-path sequencer)" ]; do
      rounds=$((rounds + 1))
      if [ "$rounds" -gt 1000 ]; then
        cat "$TMP/cherry-pick.log" >&2
        fail_on_source "the cherry-pick did not complete."
      fi
      mapfile -t unmerged < <(git diff --name-only --diff-filter=U)
      if [ "${#unmerged[@]}" -gt 0 ]; then
        conflicts+=("${unmerged[@]}")
        git add -A
        if git cherry-pick --continue >> "$TMP/cherry-pick.log" 2>&1; then break; fi
        continue
      fi
      # Nothing unmerged: the commit is already on the target branch.
      if git cherry-pick --skip >> "$TMP/cherry-pick.log" 2>&1; then break; fi
    done
    if [ "$rounds" -eq 0 ]; then
      # Failed without leaving a cherry-pick in progress: not a conflict.
      cat "$TMP/cherry-pick.log" >&2
      fail_on_source "the cherry-pick failed."
    fi
  fi
  cat "$TMP/cherry-pick.log" >&2

  mapfile -t conflicts < <(printf '%s\n' "${conflicts[@]+"${conflicts[@]}"}" | sed '/^$/d' | sort -u)
  if [ -z "$(git rev-list "$GIT_REMOTE/$TARGET_BRANCH..HEAD")" ]; then
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
  if [ "$mode" = rebase ] && [ "${#conflicts[@]}" -eq 0 ] &&
     [ "$(git rev-list --count "$GIT_REMOTE/$TARGET_BRANCH..HEAD")" -gt 1 ]; then
    # The tests started by dispatch decide what to run from HEAD^1..HEAD only, so a rebase port goes
    # in as one commit that lists the commits it brings.
    {
      printf '%s (#%s)\n\n' "$SOURCE_PR_TITLE" "$N"
      for sha in "${pick[@]}"; do
        git log -1 --format='- %s%n  (cherry picked from commit %H)' "$sha"
      done
    } > "$TMP/squash-message"
    git reset --quiet --soft "$GIT_REMOTE/$TARGET_BRANCH"
    git commit --quiet --author="$(git log -1 --format='%an <%ae>' "$MERGE_SHA")" -F "$TMP/squash-message"
  fi
  git diff --name-only "$GIT_REMOTE/$TARGET_BRANCH" HEAD > "$TMP/changed-files"
  HEAD_SHA=$(git rev-parse HEAD)
  [ "${#conflicts[@]}" -eq 0 ] || draft=true

  if ! git push --force --quiet "$GIT_REMOTE" "HEAD:refs/heads/$SYNC_BRANCH" 2> "$TMP/push.log"; then
    cat "$TMP/push.log" >&2
    reason="pushing the \`$SYNC_BRANCH\` branch was refused."
    # shellcheck disable=SC2016 # literal backticks of git's message
    if grep -q 'without `workflows` permission' "$TMP/push.log"; then
      reason="the change touches \`.github/workflows/\`, and the token of this workflow may not push workflow changes. A \`SYNC_TOKEN\` secret with that permission lets the sync handle these changes."
    fi
    fail_on_source "$reason"
  fi

  # --- Open the sync pull request ------------------------------------------------------------------

  title="[4.1] $SOURCE_PR_TITLE (#$N)"
  title=${title:0:250}
  {
    # shellcheck disable=SC2016 # literal backticks: markdown code spans
    printf 'Automatic port of #%s (by `%s`) from `%s` to `%s`.\n\n' "$N" "$SOURCE_AUTHOR" "$SOURCE_BRANCH" "$TARGET_BRANCH"
    printf -- '- Source commit: %s (%s)\n' "$MERGE_SHA" "$mode"
    printf -- '- Sync run: %s\n' "$RUN_URL"
    if [ "${#conflicts[@]}" -gt 0 ]; then
      printf '\nThe cherry-pick had conflicts in these files. They are committed with their conflict markers and need to be resolved on this branch:\n\n'
      # shellcheck disable=SC2016
      printf -- '- `%s`\n' "${conflicts[@]}"
    fi
    if [ -n "$note" ]; then printf '\n%s\n' "$note"; fi
    if [ "$draft" = true ]; then
      printf '\nThis pull request needs a maintainer and is not merged automatically.\n'
    else
      printf '\nThis pull request is merged automatically when the automated tests pass and it is mergeable; otherwise it stays open for a maintainer.\n'
    fi
  } > "$TMP/body.md"
  jq -n --arg title "$title" --rawfile body "$TMP/body.md" --arg head "$SYNC_BRANCH" --arg base "$TARGET_BRANCH" \
    --argjson draft "$draft" '{title: $title, body: $body, head: $head, base: $base, draft: $draft}' > "$TMP/pr.json"
  if ! SYNC_PR=$(gh api "repos/$REPO/pulls" --input "$TMP/pr.json" --jq '.number'); then
    fail_on_source "the sync pull request for the \`$SYNC_BRANCH\` branch could not be opened."
  fi
  comment "$N" "Ported to \`$TARGET_BRANCH\` in #$SYNC_PR."
  summary "Opened #$SYNC_PR ($mode) for #$N."

  if [ "${#conflicts[@]}" -gt 0 ]; then
    add_label "$SYNC_PR" "$CONFLICT_LABEL"
    add_label "$SYNC_PR" "$NEEDS_MAINTAINER"
    comment "$N" "The port to \`$TARGET_BRANCH\` (#$SYNC_PR) has conflicts and needs a maintainer to resolve them."
    summary "Left open as draft: conflicts in ${conflicts[*]}"
    exit 0
  fi
  if [ "$draft" = true ]; then
    add_label "$SYNC_PR" "$NEEDS_MAINTAINER"
    comment "$N" "The port to \`$TARGET_BRANCH\` (#$SYNC_PR) is incomplete and needs a maintainer: $note"
    summary "Left open as draft: $note"
    exit 0
  fi
fi

# --- Automated tests -----------------------------------------------------------------------------

paths_ignored=false
if only_paths_ignored; then paths_ignored=true; fi
log "Changed files all in the CI paths-ignore: $paths_ignored"
run_id=''
if [ "$TOKEN_KIND" != sync ] || [ "$paths_ignored" = true ]; then
  # Pull requests opened with GITHUB_TOKEN start no workflow, and the pull_request trigger skips
  # changes that only touch ignored paths: start the tests explicitly.
  run_id=$(dispatch_ci) || leave_open "the automated tests could not be started."
else
  window_end=$(( $(date +%s) + PR_RUN_WINDOW_SECONDS ))
  run_id=$(find_pull_request_run || true)
  while [ -z "$run_id" ] && [ "$(date +%s)" -lt "$window_end" ] && time_left; do
    sleep "$POLL_SECONDS"
    run_id=$(find_pull_request_run || true)
  done
  if [ -z "$run_id" ]; then
    log "No pull_request run of $CI_WORKFLOW appeared; starting one."
    run_id=$(dispatch_ci) || leave_open "the automated tests could not be started."
  fi
fi
[ -n "$run_id" ] || leave_open "the automated tests run did not appear in time."
ci_url="https://github.com/$REPO/actions/runs/$run_id"
log "Waiting for $ci_url"

# The polls below tolerate failed API calls: a run that was just started can answer 404 for a moment.
conclusion=''
while time_left; do
  if info=$(gh api "repos/$REPO/actions/runs/$run_id" --jq '"\(.status) \(.conclusion // "")"'); then
    read -r status conclusion <<< "$info" || true
    [ "$status" = completed ] && break
  fi
  conclusion=''
  sleep "$POLL_SECONDS"
done
[ -n "$conclusion" ] || leave_open "the automated tests ($ci_url) did not finish in time."
[ "$conclusion" = success ] || leave_open "the automated tests ended in \`$conclusion\` ($ci_url)."

# Every check run and commit status on the head commit, not only that run: never green with none or
# with some pending. Check suites without runs (an app that never reported, a workflow waiting for
# approval) have no check run and do not count. Statuses are read first and check runs after them,
# so the check runs are the later snapshot; every page of check runs is read, and a list shorter
# than the reported total is read again.
checks_ok=false
while time_left; do
  if ! gh api "repos/$REPO/commits/$HEAD_SHA/status" > "$TMP/status.json" ||
     ! gh api --paginate "repos/$REPO/commits/$HEAD_SHA/check-runs?per_page=100" > "$TMP/check-pages.json"; then
    sleep "$POLL_SECONDS"; continue
  fi
  jq -s '{total_count: .[0].total_count, check_runs: [.[].check_runs[]]}' "$TMP/check-pages.json" > "$TMP/checks.json"
  total=$(jq '.total_count' "$TMP/checks.json")
  listed=$(jq '.check_runs | length' "$TMP/checks.json")
  if [ "$listed" -ne "$total" ]; then
    log "Read $listed of $total check runs; reading them again."
    sleep "$POLL_SECONDS"; continue
  fi
  pending=$(jq '[.check_runs[] | select(.status != "completed")] | length' "$TMP/checks.json")
  failed=$(jq -r '[.check_runs[] | select(.status == "completed" and (.conclusion | IN("success", "neutral", "skipped") | not)) | .name] | join(", ")' "$TMP/checks.json")
  # The combined state covers every status context; the list on the page (30 at most) only names them.
  status_count=$(jq '.total_count' "$TMP/status.json")
  status_state=$(jq -r '.state' "$TMP/status.json")
  [ -z "$failed" ] || leave_open "these checks did not pass: $failed."
  if [ "$status_count" -gt 0 ] && { [ "$status_state" = failure ] || [ "$status_state" = error ]; }; then
    failed_statuses=$(jq -r '[.statuses[] | select(.state == "failure" or .state == "error") | .context] | join(", ")' "$TMP/status.json")
    leave_open "the commit statuses ended in \`$status_state\` (${failed_statuses:-see the commit})."
  fi
  statuses_done=false
  if [ "$status_count" -eq 0 ] || [ "$status_state" = success ]; then statuses_done=true; fi
  if [ "$total" -gt 0 ] && [ "$pending" -eq 0 ] && [ "$statuses_done" = true ]; then checks_ok=true; break; fi
  sleep "$POLL_SECONDS"
done
[ "$checks_ok" = true ] || leave_open "the checks did not finish in time."

# --- Merge check ---------------------------------------------------------------------------------

mergeable=null
echo '{}' > "$TMP/sync-pr.json"
while time_left; do
  if gh api "repos/$REPO/pulls/$SYNC_PR" > "$TMP/sync-pr.json"; then
    mergeable=$(jq -r '.mergeable' "$TMP/sync-pr.json")
  fi
  [ "$mergeable" != null ] && break
  sleep "$POLL_SECONDS"
done
state=$(jq -r '.mergeable_state' "$TMP/sync-pr.json")
if jq -e --arg l "$CONFLICT_LABEL" '[.labels[].name] | index($l) != null' "$TMP/sync-pr.json" > /dev/null; then
  leave_open "it has the '$CONFLICT_LABEL' label."
fi
# mergeable_state "unstable" only says that some check is not green, and the checks were verified
# above; it is also what an empty check suite leaves behind (pull requests opened with GITHUB_TOKEN
# get an "action_required" suite without runs). Conflicts, branch protection or a stale base still
# keep the pull request open.
case $state in clean | unstable | has_hooks) state_ok=true ;; *) state_ok=false ;; esac
if [ "$mergeable" != true ] || [ "$state_ok" != true ]; then
  leave_open "the merge check is not green (mergeable: $mergeable, state: $state)."
fi

# The merge answer is the confirmation; the pull request is read again only when that answer is
# missing or not a confirmed merge.
merged=$(gh api -X PUT "repos/$REPO/pulls/$SYNC_PR/merge" -f merge_method=merge -f sha="$HEAD_SHA" --jq '.merged' || true)
if [ "$merged" != true ]; then
  merged=$(gh api "repos/$REPO/pulls/$SYNC_PR" --jq '.merged' || true)
fi
if [ "$merged" != true ]; then
  comment "$SYNC_PR" "The tests passed, but merging this pull request was refused. A maintainer needs to merge it. Details: $RUN_URL"
  add_label "$SYNC_PR" "$NEEDS_MAINTAINER"
  fail_on_source "merging the sync pull request #$SYNC_PR was refused."
fi
summary "Merged #$SYNC_PR into $TARGET_BRANCH."
