#!/bin/bash -e

stopService bbb-shared-notes-server || echo "bbb-shared-notes-server could not be unregistered or stopped"
stopService bbb-shared-notes-conversion.socket || echo "bbb-shared-notes-conversion socket could not be unregistered or stopped"
