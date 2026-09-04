#!/bin/bash

# Define the directories and package
PROTO_DIR="../bbb-common-grpc/src/main/proto"
OUT_DIR="./gen"
BASE_PACKAGE="github.com/bigbluebutton/bigbluebutton/bbb-api/gen"
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
    --go_opt=Mcommon/breakout_info.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/breakout_settings.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/create_meeting_settings.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/created_meeting_info.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/duration_info.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/duration_settings.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/error.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/group_settings.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/lock_settings.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/meeting_data.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/meeting_info.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/meeting_running.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/meeting_settings.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/metadata_settings.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/pagination_request_data.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/pagination_response_data.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/participant_info.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/password_settings.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/plugin_manifest.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/plugin_settings.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/record_settings.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/system_settings.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/user.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/user_settings.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/voice_bridge_in_use.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/voice_data.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/voice_settings.proto=${BASE_PACKAGE}/common \
    --go_opt=Mcommon/welcome_settings.proto=${BASE_PACKAGE}/common \
    --go_opt=Mmeeting/create_meeting_request.proto=${BASE_PACKAGE}/meeting \
    --go_opt=Mmeeting/create_meeting_response.proto=${BASE_PACKAGE}/meeting \
    --go_opt=Mmeeting/get_meetings_stream_request.proto=${BASE_PACKAGE}/meeting \
    --go_opt=Mmeeting/list_meetings_request.proto=${BASE_PACKAGE}/meeting \
    --go_opt=Mmeeting/list_meetings_response.proto=${BASE_PACKAGE}/meeting \
    --go_opt=Mmeeting/meeting_info_request.proto=${BASE_PACKAGE}/meeting \
    --go_opt=Mmeeting/meeting_info_response.proto=${BASE_PACKAGE}/meeting \
    --go_opt=Mmeeting/meeting_running_request.proto=${BASE_PACKAGE}/meeting \
    --go_opt=Mmeeting/meeting_running_response.proto=${BASE_PACKAGE}/meeting \
    --go_opt=Mmeeting/service.proto=${BASE_PACKAGE}/meeting \
    --go_opt=Mmeeting/voice_bridge_in_use_request.proto=${BASE_PACKAGE}/meeting \
    --go_opt=Mmeeting/voice_bridge_in_use_response.proto=${BASE_PACKAGE}/meeting \
    --go-grpc_out="${OUT_DIR}" \
    --go-grpc_opt=paths=source_relative \
    --go-grpc_opt=Mcommon/breakout_info.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/breakout_settings.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/create_meeting_settings.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/created_meeting_info.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/duration_info.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/duration_settings.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/error.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/group_settings.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/lock_settings.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/meeting_data.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/meeting_info.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/meeting_running.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/meeting_settings.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/metadata_settings.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/pagination_request_data.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/pagination_response_data.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/participant_info.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/password_settings.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/plugin_manifest.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/plugin_settings.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/record_settings.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/system_settings.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/user.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/user_settings.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/voice_bridge_in_use.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/voice_data.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/voice_settings.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mcommon/welcome_settings.proto=${BASE_PACKAGE}/common \
    --go-grpc_opt=Mmeeting/create_meeting_request.proto=${BASE_PACKAGE}/meeting \
    --go-grpc_opt=Mmeeting/create_meeting_response.proto=${BASE_PACKAGE}/meeting \
    --go-grpc_opt=Mmeeting/get_meetings_stream_request.proto=${BASE_PACKAGE}/meeting \
    --go-grpc_opt=Mmeeting/list_meetings_request.proto=${BASE_PACKAGE}/meeting \
    --go-grpc_opt=Mmeeting/list_meetings_response.proto=${BASE_PACKAGE}/meeting \
    --go-grpc_opt=Mmeeting/meeting_info_request.proto=${BASE_PACKAGE}/meeting \
    --go-grpc_opt=Mmeeting/meeting_info_response.proto=${BASE_PACKAGE}/meeting \
    --go-grpc_opt=Mmeeting/meeting_running_request.proto=${BASE_PACKAGE}/meeting \
    --go-grpc_opt=Mmeeting/meeting_running_response.proto=${BASE_PACKAGE}/meeting \
    --go-grpc_opt=Mmeeting/service.proto=${BASE_PACKAGE}/meeting \
    --go-grpc_opt=Mmeeting/voice_bridge_in_use_request.proto=${BASE_PACKAGE}/meeting \
    --go-grpc_opt=Mmeeting/voice_bridge_in_use_response.proto=${BASE_PACKAGE}/meeting \
    '{}' \;