#!/bin/bash

set -eu

# Build the docs only for these release branches
BRANCHES=(
  v2.5.x-release
  v2.6.x-release
  # v2.7.x-release
)
REMOTE="origin"

git fetch --all
current_branch=$(git rev-parse --abbrev-ref HEAD)

for branch in "${BRANCHES[@]}"; do

  if [ "$branch" != "$current_branch" ]; then
    git fetch "$REMOTE" "$branch":"$branch"
  fi

  git checkout "$branch"
  if [ -f docusaurus.config.js ]; then
    version=${branch:1:3}
    echo "Adding documentation for $version"
    yarn docusaurus docs:version "${version}"
  else
    echo "Warning: branch $(branch) does not contain a docusaurus.config.js!"
  fi

done

git checkout "$current_branch"
