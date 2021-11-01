#!/bin/bash -e

stopService bbb-webrtc-sfu || echo "bbb-webrtc-sfu could not be registered or started"
stopService kurento-media-server || echo "kurento-media-server could not be registered or started"

