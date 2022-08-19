#!/usr/bin/env bash
cd "$(dirname "$0")"

sudo service bbb-meeting-api stop
sbt debian:packageBin
sudo dpkg -i target/bbb-meeting-api_*.deb
echo ''
echo ''
echo '----------------'
echo 'bbb-meeting-api updated'

sudo service bbb-meeting-api start
echo 'starting service bbb-meeting-api'