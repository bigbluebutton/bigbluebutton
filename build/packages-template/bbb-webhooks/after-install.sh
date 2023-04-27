#!/bin/bash -e

case "$1" in
  configure|upgrade|1|2)

    TARGET=/usr/local/bigbluebutton/bbb-webhooks/config/default.yml

    cp /usr/local/bigbluebutton/bbb-webhooks/config/default.example.yml $TARGET
    chmod 644 $TARGET
    chown bigbluebutton:bigbluebutton $TARGET

    BBB_SECRET=$(cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties | grep securitySalt | cut -d= -f2)
    BBB_HOST=$(cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties | sed -n '/^bigbluebutton.web.serverURL/{s/.*\///;p}')

    yq e -i  ".bbb.sharedSecret  = \"$BBB_SECRET\"" $TARGET
    yq e -i  ".bbb.serverDomain = \"$BBB_HOST\"" $TARGET
    yq e -i  '.bbb.auth2_0 = true' $TARGET
    yq e -i  '.server.port = 3005' $TARGET
    yq e -i  '.hooks.getRaw = false' $TARGET

    cd /usr/local/bigbluebutton/bbb-webhooks
    mkdir -p node_modules

    npm config set unsafe-perm true
    npm rebuild || true

    mkdir -p /var/log/bbb-webhooks/
    touch /var/log/bbb-webhooks/bbb-webhooks.log
    chown -R bigbluebutton:bigbluebutton /usr/local/bigbluebutton/bbb-webhooks /var/log/bbb-webhooks/

    reloadService nginx
    startService bbb-webhooks || echo "bbb-webhooks could not be registered or started"

  ;;

  abort-upgrade|abort-remove|abort-deconfigure)

  ;;

  *)
    echo "postinst called with unknown argument \`$1'" >&2
    exit 1
  ;;
esac

