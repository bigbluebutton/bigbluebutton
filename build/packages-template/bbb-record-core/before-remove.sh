#!/bin/bash -e

stopService bbb-record-core.timer || echo "bbb-record-core could not be unregistered or stopped"

