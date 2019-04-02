SHELL=/bin/bash

# in order to build images for bigbluebutton/bigbluebutton-docker, run:
# IMAGE_ACCOUNT=bigbluebutton IMAGE_REPO=bigbluebutton-docker make release

# build options
BUILD_REVISION=`git rev-parse --short HEAD`
BUILD_DIR_BASE=`git rev-parse --git-dir`/..
BUILD_VERSION?=
BUILD_IMAGE=0
IMAGE_ACCOUNT?=
IMAGE_REPO?=
IMAGE_TAG?=latest
TAG_REVISION?=0

all: release

image:
	-cd $(DIR) && docker build -t $(IMAGE_NAME):$(IMAGE_TAG) $(BUILD_ARGS) .
	if [ "$(BUILD_IMAGE)" == "0" ]; then \
		if [ "$(IMAGE_ACCOUNT)" != "" ]; then \
			if [ "$(IMAGE_REPO)" != "" ]; then \
				docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(IMAGE_ACCOUNT)/$(IMAGE_REPO):$(IMAGE_NAME); \
				docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(IMAGE_ACCOUNT)/$(IMAGE_REPO):$(IMAGE_NAME)-$(IMAGE_TAG); \
				if [ "$(TAG_REVISION)" == "1" ]; then \
					docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(IMAGE_ACCOUNT)/$(IMAGE_REPO):$(IMAGE_NAME)-$(BUILD_REVISION); \
				fi \
			fi \
		else \
			if [ "$(IMAGE_REPO)" != "" ]; then \
				docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(IMAGE_REPO):$(IMAGE_NAME); \
				docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(IMAGE_REPO):$(IMAGE_NAME)-$(IMAGE_TAG); \
				if [ "$(TAG_REVISION)" == "1" ]; then \
					docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(IMAGE_REPO):$(IMAGE_NAME)-$(BUILD_REVISION); \
				fi \
			else \
				if [ "$(TAG_REVISION)" == "1" ]; then \
					docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(IMAGE_NAME):$(BUILD_REVISION); \
				fi \
			fi \
		fi \
	fi

release:
	make image DIR=$(BUILD_DIR_BASE)/labs/docker/sbt IMAGE_NAME=sbt IMAGE_TAG=0.13.8 BUILD_IMAGE=1
	make image DIR=$(BUILD_DIR_BASE)/bbb-common-message IMAGE_NAME=bbb-common-message BUILD_ARGS="--build-arg COMMON_VERSION=0.0.1-SNAPSHOT" BUILD_IMAGE=1
	make image DIR=$(BUILD_DIR_BASE)/bbb-common-web IMAGE_NAME=bbb-common-web BUILD_ARGS="--build-arg COMMON_VERSION=0.0.1-SNAPSHOT" BUILD_IMAGE=1
	make image DIR=$(BUILD_DIR_BASE)/bbb-fsesl-client IMAGE_NAME=bbb-fsesl-client BUILD_ARGS="--build-arg COMMON_VERSION=0.0.1-SNAPSHOT" BUILD_IMAGE=1
	make image DIR=$(BUILD_DIR_BASE)/akka-bbb-apps IMAGE_NAME=bbb-apps-akka BUILD_ARGS="--build-arg COMMON_VERSION=0.0.1-SNAPSHOT"
	make image DIR=$(BUILD_DIR_BASE)/akka-bbb-fsesl IMAGE_NAME=bbb-fsesl-akka BUILD_ARGS="--build-arg COMMON_VERSION=0.0.1-SNAPSHOT"
	make image DIR=$(BUILD_DIR_BASE)/bigbluebutton-web IMAGE_NAME=bbb-web BUILD_ARGS="--build-arg COMMON_VERSION=0.0.1-SNAPSHOT"
	make image DIR=$(BUILD_DIR_BASE)/bigbluebutton-html5 IMAGE_NAME=bbb-html5
	make image DIR=$(BUILD_DIR_BASE)/labs/bbb-webrtc-sfu IMAGE_NAME=bbb-webrtc-sfu
	make image DIR=$(BUILD_DIR_BASE)/bbb-webhooks IMAGE_NAME=bbb-webhooks
	make image DIR=$(BUILD_DIR_BASE)/labs/docker/kurento IMAGE_NAME=bbb-kurento
	make image DIR=$(BUILD_DIR_BASE)/labs/docker/freeswitch IMAGE_NAME=bbb-freeswitch
	make image DIR=$(BUILD_DIR_BASE)/labs/docker/nginx IMAGE_NAME=bbb-nginx
	make image DIR=$(BUILD_DIR_BASE)/labs/docker/coturn IMAGE_NAME=bbb-coturn
	make image DIR=$(BUILD_DIR_BASE)/bbb-lti IMAGE_NAME=bbb-lti
