#!/bin/bash -e

stopService livekit-server || echo "livekit-server could not be unregistered or stopped"
stopService livekit-sip || echo "livekit-sip could not be unregistered or stopped"

