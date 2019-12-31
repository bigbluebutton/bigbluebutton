#!/bin/bash

sed -i "s/docker.bigbluebutton.com/$SERVER_DOMAIN/" /etc/nginx/sites-enabled/bigbluebutton

exec "$@"