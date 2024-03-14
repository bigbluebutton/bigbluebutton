#!/bin/bash

PROTO_DIR="../bbb-common-grpc/src/main/proto"
OUT_DIR="./gen"
BASE_PACKAGE="github.com/bigbluebutton/bigbluebutton/bbb-core-api/gen"

mkdir -p ${OUT_DIR}

find "${PROTO_DIR}" -name "*.proto" -exec protoc \
    --proto_path="${PROTO_DIR}" \
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