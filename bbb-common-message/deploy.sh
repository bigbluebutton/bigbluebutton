#!/bin/bash
set -e

#Publish new common-message .jar
sbt clean
# rm -r target/ project/target/ project/project/
sbt publish publishLocal
