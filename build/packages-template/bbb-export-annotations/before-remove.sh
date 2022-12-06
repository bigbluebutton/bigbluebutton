#!/bin/bash -e

stopService bbb-export-annotations || echo "bbb-export-annotations could not be unregistered or stopped"
