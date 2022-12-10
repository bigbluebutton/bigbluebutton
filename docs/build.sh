#!/bin/bash

git branch -r | grep '/v' | while read -r version; do
  branch=${version##*/}
  remote=${version%/*}
  git fetch $remote $branch:$branch
done

git branch | sed -n 's/^.*v\(.*\).x-release/\1/p' \
  | while read -r version; do

  if [ -f docusaurus.config.js ]; then
    echo "Adding documentation for $version"
    git checkout "v${version}.x-release"
    npm run docusaurus docs:version "${version}"
  fi

done

git checkout develop
npm start
