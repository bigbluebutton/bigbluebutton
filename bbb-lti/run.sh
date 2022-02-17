#!/usr/bin/env bash
rm -rf libs
grails clean
grails compile
exec grails prod run-app --port 8181
