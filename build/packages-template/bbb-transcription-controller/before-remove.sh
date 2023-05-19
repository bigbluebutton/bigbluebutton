#!/bin/bash -e

stopService bbb-transcription-controller || echo "bbb-transcription-controller could not be unregistered or stopped"
