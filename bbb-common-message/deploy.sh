#!/bin/bash
set -e

#Publish new common-message .jar
# rm -r target/ project/target/ project/project/
sbt publish publishLocal
