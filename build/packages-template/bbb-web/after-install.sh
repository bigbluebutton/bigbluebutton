#!/bin/bash -e

escape_quotes() {
    cat <<EOF | sed -e "s/'/\\\\'/g"
$1
EOF
}

bbb_new_properties() {
	#
	# Setup bigbluebutton.properties for bbb-web
	#
 sed -i "s/bigbluebutton.web.serverURL=http:\/\/.*/bigbluebutton.web.serverURL=http:\/\/$IP/g" \
         $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties

 sed -i "s/screenshareRtmpServer=.*/screenshareRtmpServer=$IP/g" \
         $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties
}

bbb_config() {
	bbb_new_properties
	
  #
  # Now update the API examples
	#
	SECRET=$(openssl rand -base64 32 | sed 's/=//g' | sed 's/+//g' | sed 's/\///g')

	HOST=$(cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties | sed -n '/^bigbluebutton.web.serverURL/{s/.*\///;p}')

  sed -i "s/securitySalt=.*/securitySalt=$SECRET/g" \
     $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties

	#
	# Update the placementsThreshold and imageTagThreshold
	sed -i 's/placementsThreshold=8000/placementsThreshold=800/g' $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties
	sed -i 's/imageTagThreshold=8000/imageTagThreshold=800/g'     $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties

	#
	# Fix links in welcome text
	sed -i 's#<a href="event:http://www.bigbluebutton.org/html5">#<a href="https://www.bigbluebutton.org/html5" target="_blank">#g' \
		$SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties

	sed -i 's#<a href="http://docs.bigbluebutton.org/" target="_blank">#<a href="https://docs.bigbluebutton.org/" target="_blank">#g' \
		$SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties

  if [ ! -L /usr/share/bigbluebutton/nginx/web.nginx ]; then
    ln -s /usr/share/bigbluebutton/nginx/web /usr/share/bigbluebutton/nginx/web.nginx
  fi

  if [[ ! -L /usr/share/bbb-web/logs && -d /usr/share/bbb-web/logs ]]; then  # remove old directory (if exists)
    rm -rf /usr/share/bbb-web/logs
  fi

  if [ ! -L /usr/share/bbb-web/logs ]; then  # create symbolic link
    ln -s /var/log/bigbluebutton /usr/share/bbb-web/logs
  fi
  chown bigbluebutton:bigbluebutton /var/log/bigbluebutton
  touch /var/log/bigbluebutton/bbb-web.log
  chown bigbluebutton:bigbluebutton /var/log/bigbluebutton/bbb-web.log

  update-java-alternatives -s java-1.17.0-openjdk-amd64

  # Restart bbb-web to deploy new 
  startService bbb-web.service || echo "bbb-web.service could not be registered or started"
}

case "$1" in
  configure|upgrade|1|2)
  	bbb_config
    ;;

    abort-upgrade|abort-remove|abort-deconfigure)

    ;;

    *)
      echo "## postinst called with unknown argument \`$1'" >&2
    ;;
esac

# dh_installdeb will replace this with shell code automatically
# generated by other debhelper scripts.

exit 0


