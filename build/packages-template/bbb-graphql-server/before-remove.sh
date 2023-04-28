#!/bin/bash -e

stopService bbb-graphql-server || echo "bbb-graphql-server could not be unregistered or stopped"
