#!/usr/bin/env bash

# Stopping services
sudo systemctl stop bbb-html5 mongod

cd "$(dirname "$0")"

# Handling arguments
for var in "$@"; do
    if [[ $var == --reset ]]; then
        echo "Performing Meteor reset..."
        rm -rf node_modules
        meteor reset
    fi
done

# Installing dependencies if node_modules is not present
if [ ! -d ./node_modules ]; then
    meteor npm i
fi

# Run meteor in the foreground to keep the script running
npm start

# If npm start exits, the script reaches this point and exits, triggering the cleanup trap
