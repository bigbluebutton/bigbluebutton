#!/usr/bin/env bash

sbt clean stage
sudo service bbb-vertx-akka stop
cd target/universal/stage
./bin/bbb-vertx-akka
