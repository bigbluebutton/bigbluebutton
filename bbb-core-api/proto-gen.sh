#!/bin/bash

# Define the directories and package
PROTO_DIR="../bbb-common-grpc/src/main/proto"
OUT_DIR="./gen"
BASE_PACKAGE="github.com/bigbluebutton/bigbluebutton/bbb-core-api/gen"
PROTOC_GEN_GO_PATH="$HOME/go/bin/protoc-gen-go"
PROTOC_GEN_GO_GRPC_PATH="$HOME/go/bin/protoc-gen-go-grpc"

# Create the output directory if it doesn't exist
mkdir -p ${OUT_DIR}

# Find all .proto files in the PROTO_DIR and generate Go code
find "${PROTO_DIR}" -name "*.proto" -exec protoc \
    --proto_path="${PROTO_DIR}" \
    --plugin=protoc-gen-go=${PROTOC_GEN_GO_PATH} \
    --plugin=protoc-gen-go-grpc=${PROTOC_GEN_GO_GRPC_PATH} \
    --go_out="${OUT_DIR}" \
    --go_opt=paths=source_relative \
    --go_opt=Mcommon/error.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/meeting.proto=${BASE_PACKAGE}/common \
    --go_opt=Mbbb-core/bbb-core.proto=${BASE_PACKAGE}/bbbcore \
    --go-grpc_out="${OUT_DIR}" \
    --go-grpc_opt=paths=source_relative \
    --go-grpc_opt=Mcommon/error.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/meeting.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mbbb-core/bbb-core.proto=${BASE_PACKAGE}/bbbcore \
    '{}' \;