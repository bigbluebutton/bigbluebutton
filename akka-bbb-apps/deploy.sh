#!/usr/bin/env bash
cd "$(dirname "$0")"

sudo service bbb-apps-akka stop
sbt debian:packageBin
sudo dpkg -i target/bbb-apps-akka_*.deb
echo ''
echo ''
echo '----------------'
echo 'bbb-apps-akka updated'

sudo service bbb-apps-akka start
echo 'starting service bbb-apps-akka'
