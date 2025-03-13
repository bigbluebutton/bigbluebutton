#!/bin/bash

set -eu

# Defines the git remote used to fetch the branches and tags
REMOTE="origin"

while [ $# -gt 0 ]; do
  if [ "$1" = "--remote" -o "$1" = "-remote" -o "$1" = "-r" ]; then
    REMOTE_OVERRIDE="${2}"
    if [ -z "$REMOTE_OVERRIDE" ]; then
      echo
      echo "    No remote was given, using '$REMOTE' to fetch branches and tags"
      echo
      exit 0
    fi
    shift; shift
    continue
  fi

  usage
  exit 1
done

# Build the docs for these tags (the last tag of old major releases)
# We build the docs for historical reasons. The branch no longer exists
# since the release is no longer supported/maintained.
TAGS=(
  v2.5.20
)

# Build the docs only for these release branches
BRANCHES=(
  v2.6.x-release
  v2.7.x-release
  v3.0.x-release
)

git fetch --all
git fetch --tags
current_branch=$(git rev-parse --abbrev-ref HEAD)

for tag in "${TAGS[@]}"; do

  if [ "$tag" != "$current_branch" ]; then
    git fetch "$REMOTE" "$tag"
  fi

  git checkout "$tag"
  if [ -f docusaurus.config.js ]; then
    version=${tag:1:3}-legacy
    echo "Adding documentation for $version"
    npm run docusaurus docs:version "${version}"
  else
    echo "Warning: branch/tag $(version) does not contain a docusaurus.config.js!"
  fi

done

for branch in "${BRANCHES[@]}"; do

  if [ "$branch" != "$current_branch" ]; then
    git fetch "$REMOTE" "$branch":"$branch"
  fi

  git checkout "$branch"
  if [ -f docusaurus.config.js ]; then
    version=${branch:1:3}
    echo "Adding documentation for $version"
    npm run docusaurus docs:version "${version}"
  else
    echo "Warning: branch $(branch) does not contain a docusaurus.config.js!"
  fi

done

git checkout "$current_branch"
