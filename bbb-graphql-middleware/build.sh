#!/bin/bash
CGO_ENABLED=0 go build -o bbb-graphql-middleware cmd/bbb-graphql-middleware/main.go
echo "Build of bbb-graphql-middleware finished"
