#!/bin/bash

sudo systemctl stop bbb-graphql-middleware
set -a # Automatically export all variables
source ./bbb-graphql-middleware-config.env
set +a # Stop automatically exporting
go run cmd/bbb-graphql-middleware/main.go  --signal SIGTERM
