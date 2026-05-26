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
    REMOTE="$REMOTE_OVERRIDE"
    shift; shift
    continue
  fi
  exit 1
done

# Remove directories and files related to previous build (otherwise it would crash).
echo Removing directories and files from previous builds
if [ -d versioned_docs ]; then
  rm -rf versioned_docs
fi
if [ -d versioned_sidebars ]; then
  rm -rf versioned_sidebars
fi
if [ -f versions.json ]; then
  rm versions.json
fi

# Build the docs only for these release branches
BRANCHES=(
  v2.5.x-release
  v2.6.x-release
  v2.7.x-release
  v3.0.x-release
  v4.0.x-release
)

git fetch "$REMOTE"
current_branch=$(git rev-parse --abbrev-ref HEAD)

# Store the current static/img directory
mkdir -p static/img
cp -r static/img /tmp/base_img

for branch in "${BRANCHES[@]}"; do

  if [ "$branch" != "$current_branch" ]; then
    git fetch "$REMOTE" "$branch":"$branch"
  fi

  git checkout "$branch"
  if [ -f docusaurus.config.js ]; then
    version=${branch:1:3}
    echo "Adding documentation for $version"
    npm run docusaurus docs:version "${version}"
    # Copy static assets from this version
    if [ -d static/img ]; then
      cp -rn static/img/* /tmp/base_img/ 2>/dev/null || true
    fi
  else
    echo "Warning: branch $(branch) does not contain a docusaurus.config.js!"
  fi

done

git checkout "$current_branch"

# Restore all collected static assets
cp -r /tmp/base_img/* static/img/
rm -rf /tmp/base_img
