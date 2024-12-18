#!/bin/bash

sudo systemctl stop bbb-graphql-middleware
go run cmd/bbb-graphql-middleware/main.go  --signal SIGTERM
