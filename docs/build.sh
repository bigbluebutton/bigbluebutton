#!/bin/bash

curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt install -y yarn
yarn set version berry
yarn install

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
    yarn docusaurus docs:version "${version}"
  fi

done

git checkout develop
npm start
