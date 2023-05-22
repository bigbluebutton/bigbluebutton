#!/bin/bash
nodemon --exec go run cmd/bbb-graphql-middleware/main.go  --signal SIGTERM
