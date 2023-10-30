#!/bin/bash -e

stopService bbb-graphql-actions-adapter-server || echo "bbb-graphql-actions-adapter-server could not be unregistered or stopped"
