#!/bin/bash -e

stopService bbb-graphql-middleware || echo "bbb-graphql-middleware could not be unregistered or stopped"
