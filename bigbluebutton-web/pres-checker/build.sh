#!/usr/bin/env bash
set -e
gradle clean
gradle jar
cp build/libs/*.jar lib
