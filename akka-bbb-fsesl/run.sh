#!/usr/bin/env bash

sbt clean stage
sudo service bbb-fsesl-akka stop
cd target/universal/stage
./bin/bbb-fsesl-akka
