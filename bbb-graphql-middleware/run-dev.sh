#!/bin/bash

eval "$(sudo cat /etc/default/bbb-graphql-server-admin-pass | grep HASURA_GRAPHQL_ADMIN_SECRET | sed 's/^/export /')"
sudo systemctl stop bbb-graphql-middleware
go run cmd/bbb-graphql-middleware/main.go  --signal SIGTERM
