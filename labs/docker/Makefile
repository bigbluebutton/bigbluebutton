SHELL=/bin/bash

# build options
BUILD_VERSION?=0.0.0
BUILD_TAG_PREFIX?=
BUILD_REVISION=`git rev-parse --short HEAD`
BUILD_DIR_BASE=`git rev-parse --git-dir`/..
TAG_REVISION=0

all: release

image:
	-cd $(DIR) && docker build -t $(BUILD_TAG_PREFIX)$(BUILD_TAG):$(BUILD_VERSION) $(BUILD_ARGS) .
	if [ "$(TAG_REVISION)" == "1" ]; then \
		docker tag $(BUILD_TAG_PREFIX)$(BUILD_TAG):$(BUILD_VERSION) $(BUILD_TAG_PREFIX)$(BUILD_TAG):$(BUILD_REVISION) ; \
	fi

release:
	make image DIR=$(BUILD_DIR_BASE)/labs/docker/sbt BUILD_TAG=sbt BUILD_VERSION=0.13.8
	make image DIR=$(BUILD_DIR_BASE)/bbb-common-message BUILD_TAG=bbb-common-message BUILD_VERSION=latest BUILD_ARGS="--build-arg COMMON_VERSION=0.0.1-SNAPSHOT"
	make image DIR=$(BUILD_DIR_BASE)/bbb-common-web BUILD_TAG=bbb-common-web BUILD_VERSION=latest BUILD_ARGS="--build-arg COMMON_VERSION=0.0.1-SNAPSHOT"
	make image DIR=$(BUILD_DIR_BASE)/bbb-fsesl-client BUILD_TAG=bbb-fsesl-client BUILD_VERSION=latest BUILD_ARGS="--build-arg COMMON_VERSION=0.0.1-SNAPSHOT"
	make image DIR=$(BUILD_DIR_BASE)/akka-bbb-apps BUILD_TAG=bbb-apps-akka BUILD_VERSION=latest BUILD_ARGS="--build-arg COMMON_VERSION=0.0.1-SNAPSHOT" TAG_REVISION=1
	make image DIR=$(BUILD_DIR_BASE)/akka-bbb-fsesl BUILD_TAG=bbb-fsesl-akka BUILD_VERSION=latest BUILD_ARGS="--build-arg COMMON_VERSION=0.0.1-SNAPSHOT" TAG_REVISION=1
	make image DIR=$(BUILD_DIR_BASE)/bigbluebutton-web BUILD_TAG=bbb-web BUILD_VERSION=latest BUILD_ARGS="--build-arg COMMON_VERSION=0.0.1-SNAPSHOT" TAG_REVISION=1
	make image DIR=$(BUILD_DIR_BASE)/bigbluebutton-html5 BUILD_TAG=bbb-html5 BUILD_VERSION=latest TAG_REVISION=1
	make image DIR=$(BUILD_DIR_BASE)/labs/bbb-webrtc-sfu BUILD_TAG=bbb-webrtc-sfu BUILD_VERSION=latest TAG_REVISION=1
	make image DIR=$(BUILD_DIR_BASE)/bbb-webhooks BUILD_TAG=bbb-webhooks BUILD_VERSION=latest TAG_REVISION=1
	make image DIR=$(BUILD_DIR_BASE)/labs/docker/kurento BUILD_TAG=kurento BUILD_VERSION=latest TAG_REVISION=1
	make image DIR=$(BUILD_DIR_BASE)/labs/docker/freeswitch BUILD_TAG=bbb-freeswitch BUILD_VERSION=latest TAG_REVISION=1
	make image DIR=$(BUILD_DIR_BASE)/labs/docker/nginx BUILD_TAG=nginx BUILD_VERSION=latest TAG_REVISION=1
	make image DIR=$(BUILD_DIR_BASE)/labs/docker/nginx-dhp BUILD_TAG=nginx-dhp BUILD_VERSION=latest TAG_REVISION=1
	make image DIR=$(BUILD_DIR_BASE)/labs/docker/coturn BUILD_TAG=coturn BUILD_VERSION=latest TAG_REVISION=1
	make image DIR=$(BUILD_DIR_BASE)/bbb-lti BUILD_TAG=bbb-lti BUILD_VERSION=latest TAG_REVISION=1
