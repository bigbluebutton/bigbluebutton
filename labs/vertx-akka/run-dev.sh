#!/usr/bin/env bash

rm -rf src/main/resources
cp -R src/universal/conf src/main/resources
sbt run

