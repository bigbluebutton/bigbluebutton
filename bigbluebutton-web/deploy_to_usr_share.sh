#!/usr/bin/env bash
cd "$(dirname "$0")"
sudo service bbb-web stop
./build.sh

grails assemble
mkdir -p exploded && cd exploded
jar -xvf ../build/libs/bigbluebutton-0.10.0.war

if [ ! -d /usr/share/bbb-web-old ] ; then
	sudo cp -R /usr/share/bbb-web /usr/share/bbb-web-old
	echo "A backup was saved in /usr/share/bbb-web-old"
else
	echo "A backup in /usr/share/bbb-web-old already exists. Skipping.."
fi
sudo rm -rf /usr/share/bbb-web/assets/ /usr/share/bbb-web/META-INF/ /usr/share/bbb-web/org/ /usr/share/bbb-web/WEB-INF/
sudo cp -R . /usr/share/bbb-web/
sudo chown bigbluebutton:bigbluebutton /usr/share/bbb-web
sudo chown -R bigbluebutton:bigbluebutton /usr/share/bbb-web/assets/ /usr/share/bbb-web/META-INF/ /usr/share/bbb-web/org/ /usr/share/bbb-web/WEB-INF/
echo ''
echo ''
echo '----------------'
echo 'bbb-web updated'

cd ..
sudo rm -r exploded
sudo service bbb-web start

echo 'starting service bbb-web'

