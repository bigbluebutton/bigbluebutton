#! /bin/bash

echo "This script requires the Go plugins for protoc. These can be installed with the following commands:"
echo "go install google.golang.org/protobuf/cmd/protoc-gen-go@latest"
echo "go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest"
echo "Then add ~/go/bin to your PATH to run them."

PROTO_DIR="../bbb-common-grpc/src/main/proto"
OUT_DIR="./gen"

mkdir -p ${OUT_DIR}

find "${PROTO_DIR}" -name "*.proto" -exec protoc \
    --proto_path="${PROTO_DIR}" \
    --go_out="${OUT_DIR}" \
    --go_opt=paths=source_relative \
    --go-grpc_out="${OUT_DIR}" \
    --go-grpc_opt=paths=source_relative '{}' \;