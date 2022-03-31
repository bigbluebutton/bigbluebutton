#!/usr/bin/env bash
cd "$(dirname "$0")"
sudo service bbb-web stop
./build.sh

grails assemble
mkdir exploded && cd exploded
jar -xvf ../build/libs/bigbluebutton-0.10.0.war
cp ../run-prod.sh .
sudo cp -R /usr/share/bbb-web /usr/share/bbb-web-old
sudo rm -rf /usr/share/bbb-web/assets/ /usr/share/bbb-web/META-INF/ /usr/share/bbb-web/org/ /usr/share/bbb-web/run-prod.sh  /usr/share/bbb-web/WEB-INF/
sudo cp -R . /usr/share/bbb-web/
sudo chown bigbluebutton:bigbluebutton /usr/share/bbb-web
sudo chown -R bigbluebutton:bigbluebutton /usr/share/bbb-web/assets/ /usr/share/bbb-web/META-INF/ /usr/share/bbb-web/org/ /usr/share/bbb-web/run-prod.sh /usr/share/bbb-web/WEB-INF/
echo ''
echo ''
echo '----------------'
echo 'bbb-web updated'

cd ..
sudo rm -r exploded
sudo service bbb-web start

echo 'starting service bbb-web'