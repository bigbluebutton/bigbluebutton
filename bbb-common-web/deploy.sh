#!/bin/bash

#Publish new bbb-common-web .jar
sbt clean update publish publishLocal
