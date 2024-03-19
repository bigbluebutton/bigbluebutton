#!/usr/bin/env bash

sudo systemctl stop bbb-html5 mongod

cd "$(dirname "$0")"

for var in "$@"
do
    if [[ $var == --reset ]] ; then
    	echo "Performing Meteor reset..."
        rm -rf node_modules
		meteor reset
    fi
done

meteor npm ci

npm start
