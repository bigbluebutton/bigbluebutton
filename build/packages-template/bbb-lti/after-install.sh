#!/bin/bash -e

escape_quotes() {
    cat <<EOF | sed -e "s/'/\\\\'/g"
$1
EOF
}

change_var_value () {
  sed -i "s<^\(${2}\).*<\1=${3}<" $1;
}


bbb_new_properties() {
  #
  # Setup lti-config.properties for bbb-lti
  #
  HOST=$(cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties | sed -n '/^bigbluebutton.web.serverURL/{s/.*\///;p}')

  sed -i "s/^bigbluebuttonURL=.*/bigbluebuttonURL=$PROTOCOL:\/\/$HOST\/bigbluebutton/g" \
    /usr/share/bbb-lti/WEB-INF/classes/lti-config.properties

  sed -i "s/^ltiEndPoint=.*/ltiEndPoint=$HOST/g" \
    /usr/share/bbb-lti/WEB-INF/classes/lti-config.properties

  BBB_SECRET=$(cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties | grep securitySalt | cut -d= -f2);
  change_var_value /usr/share/bbb-lti/WEB-INF/classes/lti-config.properties bigbluebuttonSalt $BBB_SECRET

  HASH="$RANDOM$(date +%s)$$$RANDOM"
  LTI_SECRET=$(echo $HASH | md5sum | md5sum | sed 's/  -//')

  sed -i "s/^ltiConsumers=bbb:.*/ltiConsumers=bbb:$LTI_SECRET/g" \
        /usr/share/bbb-lti/WEB-INF/classes/lti-config.properties
}


lti_config() {
  #
  # We need for Tomcat to deploy the web app
  #

  #
  # At this point. /var/tmp/lti.war holds the newer version of bbb-lti
  # but it's not deployed yet
  #

  if [ -f /tmp/lti-config.properties ]; then
    VARS=$(cat /tmp/bigbluebutton-lti.properties | grep = | grep -v \# | sed -e "s/ //g" -e "s/=.*/ /g" | tr -d '\n')
    for v in $VARS ; do
      old_val=$(cat /tmp/bigbluebutton-lti.properties | tr -d '\r' | sed -n "/^${v}[# ]*=[ ]*/{s/${v}[ ]*=[ ]*//;p}" )
      sed -i "s|^$v=.*|$v=$old_val|" /usr/share/bbb-lti/WEB-INF/classes/lti-config.properties
    done
    mv -f /tmp/lti-config.properties /tmp/lti-config.properties_
  else
    bbb_new_properties
  fi

  if [[ ! -L /usr/share/bbb-lti/logs && -d /usr/share/bbb-lti/logs ]]; then  # remove old directory (if exists)
    rm -rf /usr/share/bbb-lti/logs
  fi

  if [ ! -L /usr/share/bbb-lti/logs ]; then  # create symbolic link
    ln -s /var/log/bigbluebutton /usr/share/bbb-lti/logs
  fi

  touch /var/log/bigbluebutton/bbb-lti.log
  chown bigbluebutton:bigbluebutton /var/log/bigbluebutton/bbb-lti.log

  startService bbb-lti.service || echo "bbb-lti.service could not be registered or started"
}

case "$1" in
  configure|upgrade|0|1)

    lti_config
    ;;

    abort-upgrade|abort-remove|abort-deconfigure)
    ;;

  *)
    echo "postinst called with unknown argument \`$1'" >&2
    exit 1
    ;;
esac

