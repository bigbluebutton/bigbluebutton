#!/bin/bash

#Clear cached .jar from bigbluebutton-web
scriptDir=$(dirname -- "$(readlink -f -- "$BASH_SOURCE")")
rm -rf  $scriptDir/../bigbluebutton-web/lib/bbb-common-web*

#Publish new bbb-common-web .jar
sbt clean publish publishLocal
