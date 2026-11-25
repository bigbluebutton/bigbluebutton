#!/bin/bash
set -e

#Publish new bbb-common-web .jar
# rm -r target/ project/target/ project/project/ lib_managed/
sbt update publish publishLocal
