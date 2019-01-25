#!/usr/bin/env bash
gradle clean
gradle resolveDeps
grails clean
grails prod run-app