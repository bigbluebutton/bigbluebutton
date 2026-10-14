#!/usr/bin/env bash
cd "$(dirname "$0")"

for var in "$@"
do
    if [[ $var == --build ]] ; then
       echo "Performing a full re-build..."
       cd ../bbb-common-web
       ./deploy.sh
       cd ../bigbluebutton-web/
    fi
done

sudo service bbb-web stop
./build.sh

./gradlew clean assemble

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

# Grails 8 never finishes starting when the exploded war is launched with the old
# classpath (-cp WEB-INF/lib/*:/:WEB-INF/classes/:.): install the packaged unit, which
# launches with -cp . (see build/packages-template/bbb-web/bbb-web.service).
UNIT=../build/packages-template/bbb-web/bbb-web.service
if ! cmp -s "$UNIT" /lib/systemd/system/bbb-web.service ; then
	sudo cp "$UNIT" /lib/systemd/system/bbb-web.service
	sudo systemctl daemon-reload
	echo 'bbb-web.service replaced with the one from build/packages-template/bbb-web'
fi
if systemctl cat bbb-web | grep -q -- '-cp WEB-INF/lib/\*' ; then
	echo 'ERROR: the active bbb-web unit still launches with the old classpath (an override under /etc/systemd/system?).'
	echo 'bbb-web on Grails 8 never binds its port that way. Change the override to "-cp ." and run:'
	echo '  sudo systemctl daemon-reload && sudo service bbb-web start'
	exit 1
fi

sudo service bbb-web start

echo 'starting service bbb-web'
