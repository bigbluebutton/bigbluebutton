#!/usr/bin/env bash

sbt clean stage
sudo service bbb-transcode-akka stop
cd target/universal/stage
./bin/bbb-transcode-akka
