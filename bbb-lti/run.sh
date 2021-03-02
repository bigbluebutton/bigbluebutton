#!/usr/bin/env bash
rm -rf libs
grails clean
grails compile
grails prod run-app --port 8181
