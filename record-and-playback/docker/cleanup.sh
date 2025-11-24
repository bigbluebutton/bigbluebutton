#!/bin/bash

#
# How N days back to keep files
# hardcoded to 5 days atm, could be made configurable
#
history=5

echo "Starting cleanup routine with the following settings: ENABLE_RECORDING=${ENABLE_RECORDING}, REMOVE_OLD_RECORDING=${REMOVE_OLD_RECORDING}, RECORDING_MAX_AGE_DAYS=${RECORDING_MAX_AGE_DAYS}."

while :
do

  # delete presentations older than N days
  find /var/bigbluebutton/ -maxdepth 1 -type d -name "*-[0-9]*" -mtime +$history -exec rm -rf '{}' +

  # delete recordings older than $RECORDING_MAX_AGE_DAYS
  if [ "$ENABLE_RECORDING" == true ] && [ "$REMOVE_OLD_RECORDING" == true ]; then
    /usr/local/bigbluebutton/core/scripts/bbb-remove-old-recordings
  fi
  
  sleep 30m
done