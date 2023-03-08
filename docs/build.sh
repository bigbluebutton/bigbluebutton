#!/bin/bash

set -eu

git fetch --all
current_branch=$(git rev-parse --abbrev-ref HEAD)

git branch --remotes | grep '/v' | while read -r version; do
  branch=${version##*/}
  remote=${version%/*}
  if [ "$branch" != "$current_branch" ]; then
    git fetch "$remote" "$branch":"$branch"
  fi
done


git branch | sed --quiet 's/^.*v\(.*\).x-release/\1/p' \
  | while read -r version; do

  git checkout "v${version}.x-release"
  if [ -f docusaurus.config.js ]; then
    echo "Adding documentation for $version"
    yarn docusaurus docs:version "${version}"
  fi

done

git checkout "$current_branch"
