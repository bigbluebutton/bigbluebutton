#!/bin/bash

sudo systemctl stop bbb-graphql-middleware
set -a # Automatically export all variables
source /etc/default/bbb-graphql-middleware
set +a # Stop automatically exporting
go run cmd/bbb-graphql-middleware/main.go  --signal SIGTERM
