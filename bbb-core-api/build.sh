#! /bin/bash

# This script requires the Go plugins for protoc these can be installed with the following commands:
# go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
# go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Add the plugins to you path:
# export GOPATH=$HOME/go
# export PATH=$PATH:$GOPATH/bin

PROTO_DIR="../bbb-common-grpc/src/main/proto"
OUT_DIR="./gen"

mkdir -p ${OUT_DIR}

find "${PROTO_DIR}" -name "*.proto" -exec protoc \
    --proto_path="${PROTO_DIR}" \
    --go_out="${OUT_DIR}" \
    --go_opt=paths=source_relative \
    --go-grpc_out="${OUT_DIR}" \
    --go-grpc_opt=paths=source_relative '{}' \;