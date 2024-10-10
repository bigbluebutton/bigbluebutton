#!/usr/bin/env bash
set -e

gradle clean
gradle resolveDeps
grails clean

