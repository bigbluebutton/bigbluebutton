#!/usr/bin/env bash

sbt clean stage
#sudo service bbb-meeting-api stop
cd target/universal/stage
exec ./bin/bbb-meeting-api
