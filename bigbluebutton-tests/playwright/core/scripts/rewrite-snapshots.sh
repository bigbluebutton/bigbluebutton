#!/bin/bash

# Save string of folders containg reference snapshots files
folders_string=$(find . -type d -name "*js-snapshots" -printf "%h\n" | sort | uniq | tr -d './' | tr '\n' ' ')

# Find folders
folders=$(find . -type d -name "*js-snapshots")

# Delete folders
for folder in $folders
do
  rm -r "$folder"
done

echo "Running test suites: $folders_string"
# Run the test suites for these deleted folders
npm test $folders_string -- --project=chromium
