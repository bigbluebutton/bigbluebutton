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

# Cleanup routine function
cleanup_routine() {
    while true; do
        # Check if the directory contains any files
        if [ "$(sudo ls -A /tmp/meteor-assets-nginx-cache/)" ]; then
	        echo "Cleaning up nginx cache"
            sudo bash -c "rm -rf /tmp/meteor-assets-nginx-cache/*"
        fi
        sleep 1
    done
}

# Starting the cleanup routine in the background
cleanup_routine &

# Capturing the PID of the cleanup routine
CLEANUP_PID=$!

# Function to kill the npm start and cleanup routine when the script exits
close_cleanup_routine() {
    echo "Cleaning up..."
    kill $CLEANUP_PID
    exit 0
}

# Trapping the EXIT signal to call the cleanup function
trap close_cleanup_routine EXIT

# Run meteor in the foreground to keep the script running
npm start

# If npm start exits, the script reaches this point and exits, triggering the cleanup trap
