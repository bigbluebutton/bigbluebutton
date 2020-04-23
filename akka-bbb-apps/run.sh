#!/usr/bin/env bash

sbt clean stage
sudo service bbb-apps-akka stop
cd target/universal/stage
exec ./bin/bbb-apps-akka
