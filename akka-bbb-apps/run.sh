#!/usr/bin/env bash

sbt clean stage
sudo service bbb-apps-akka stop
cd target/universal/stage
./bin/bbb-apps-akka
