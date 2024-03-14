#!/bin/bash -e

case "$1" in
  configure|upgrade|1|2)

    TARGET=/usr/local/bigbluebutton/bbb-webhooks/config/default.yml

    cp /usr/local/bigbluebutton/bbb-webhooks/config/default.example.yml $TARGET
    chmod 644 $TARGET
    chown bigbluebutton:bigbluebutton $TARGET

    BBB_HOST=$(bbb-conf --secret | grep -F URL: | sed 's#^.*://##; s#/.*##')
    BBB_SECRET=$(bbb-conf --secret | grep -F Secret: | sed 's/.*Secret: //')

    yq e -i  ".bbb.sharedSecret  = \"$BBB_SECRET\"" $TARGET
    yq e -i  ".bbb.serverDomain = \"$BBB_HOST\"" $TARGET
    yq e -i  '.bbb.auth2_0 = true' $TARGET
    yq e -i  '.modules."../out/webhooks/index.js".config.getRaw = false' $TARGET
    yq e -i  '.log.filename = "/var/log/bbb-webhooks/bbb-webhooks.log"' $TARGET

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

