#!/bin/bash -e

stopService bbb-rap-resque-worker.service || echo "bbb-rap-resque-worker.service could not be unregistered or stopped"
stopService bbb-rap-starter.service || echo "bbb-rap-starter.service could not be unregistered or stopped"

