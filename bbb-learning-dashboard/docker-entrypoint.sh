#!/bin/sh

# This script modifies the Nginx configuration to set the number of workers dynamically,
# based on the environment variable BBB_PLAYBACK_NGINX_WORKERS.

: "${BBB_LEARNING_DASHBOARD_NGINX_WORKERS:=1}"

sed -i "s/worker_processes\s*\([0-9]\+\|auto\);/worker_processes ${BBB_LEARNING_DASHBOARD_NGINX_WORKERS};/" /etc/nginx/nginx.conf

exec "$@"
