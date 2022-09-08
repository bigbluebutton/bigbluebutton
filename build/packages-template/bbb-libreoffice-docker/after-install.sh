#!/bin/bash -e

if ! which docker > /dev/null; then
	echo "#"
	echo "# Unable to install bbb-libreoffice-docker -- no docker available"
	echo "#"
	exit 0
fi

#if ! docker image inspect bbb-soffice > /dev/null 2>&1; then
	cd /usr/share/bbb-libreoffice
	echo "#"
	echo "# Building bbb-libreoffice docker image"
	echo "#"
	docker build -t bbb-soffice docker/
#fi


chmod +x /usr/share/bbb-libreoffice-conversion/convert-local.sh
chmod +x /usr/share/bbb-libreoffice-conversion/convert-remote.sh
chmod +x /usr/share/bbb-libreoffice-conversion/etherpad-export.sh


if [ ! -L /usr/share/bbb-libreoffice-conversion/convert.sh ]; then
	ln -s /usr/share/bbb-libreoffice-conversion/convert-local.sh /usr/share/bbb-libreoffice-conversion/convert.sh
fi

cat > /etc/sudoers.d/zzz-bbb-docker-libreoffice <<HERE
bigbluebutton ALL=(ALL) NOPASSWD: /usr/bin/docker run --rm --memory=1g --memory-swap=1g --network none --env=HOME=/tmp/ -w /tmp/ --user=[0-9][0-9][0-9][0-9][0-9] -v /tmp/bbb-soffice-bigbluebutton/tmp.[0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z]/\:/data/ -v /usr/share/fonts/\:/usr/share/fonts/\:ro --rm bbb-soffice sh -c timeout [0-9][0-9][0-9]s /usr/bin/soffice -env\:UserInstallation=file\:///tmp/ --convert-to pdf --outdir /data /data/file
etherpad ALL=(ALL) NOPASSWD: /usr/bin/docker run --rm --memory=1g --memory-swap=1g --network none --env=HOME=/tmp/ -w /tmp/ --user=[0-9][0-9][0-9][0-9][0-9] -v /tmp/bbb-soffice-etherpad/tmp.[0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z]/\:/data/ -v /usr/share/fonts/\:/usr/share/fonts/\:ro --rm bbb-soffice sh -c timeout [0-9][0-9][0-9]s /usr/bin/soffice -env\:UserInstallation=file\:///tmp/ --convert-to pdf --writer --outdir /data /data/file
etherpad ALL=(ALL) NOPASSWD: /usr/bin/docker run --rm --memory=1g --memory-swap=1g --network none --env=HOME=/tmp/ -w /tmp/ --user=[0-9][0-9][0-9][0-9][0-9] -v /tmp/bbb-soffice-etherpad/tmp.[0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z]/\:/data/ -v /usr/share/fonts/\:/usr/share/fonts/\:ro --rm bbb-soffice sh -c timeout [0-9][0-9][0-9]s /usr/bin/soffice -env\:UserInstallation=file\:///tmp/ --convert-to odt --writer --outdir /data /data/file
etherpad ALL=(ALL) NOPASSWD: /usr/bin/docker run --rm --memory=1g --memory-swap=1g --network none --env=HOME=/tmp/ -w /tmp/ --user=[0-9][0-9][0-9][0-9][0-9] -v /tmp/bbb-soffice-etherpad/tmp.[0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z]/\:/data/ -v /usr/share/fonts/\:/usr/share/fonts/\:ro --rm bbb-soffice sh -c timeout [0-9][0-9][0-9]s /usr/bin/soffice -env\:UserInstallation=file\:///tmp/ --convert-to doc --outdir /data /data/file
HERE

exit 0
