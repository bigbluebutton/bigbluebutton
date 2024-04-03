#!/bin/bash -e

stopService bbb-graphql-actions || echo "bbb-graphql-actions could not be unregistered or stopped"
