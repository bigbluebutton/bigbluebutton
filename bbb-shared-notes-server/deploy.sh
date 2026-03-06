#!/usr/bin/env bash

cd "$(dirname "$0")"

# sudo systemctl stop bbb-shared-notes-server.service

echo "Npm version:"
npm -v
echo "Node version:"
node -v

# wkhtmltopdf is required
sudo apt update
sudo apt install wkhtmltopdf -y

# Create directory for fpm to process
sudo mkdir -p /usr/share/bbb-shared-notes-server
sudo mkdir -p /usr/share/bbb-shared-notes-server/config
sudo mkdir -p /usr/share/bigbluebutton/nginx

# Build shared-notes-server
npm ci --no-progress
npm run build

mv dist/index.js dist/bbb-shared-notes-server.js
sudo cp -r dist/* /usr/share/bbb-shared-notes-server
sudo cp blocknote_schema.sql /usr/share/bbb-shared-notes-server
sudo cp package.json /usr/share/bbb-shared-notes-server
sudo cp package-lock.json /usr/share/bbb-shared-notes-server

# Copy config directory with all config files
sudo cp -r config /usr/share/bbb-shared-notes-server/

sudo cp -r node_modules /usr/share/bbb-shared-notes-server

# Copy script to run commands through `system-run --user`
sudo cp run-in-systemd.sh /usr/share/bbb-shared-notes-server

# Set nginx location
sudo cp ../build/packages-template/bbb-shared-notes-server/bbb-shared-notes-server.nginx /usr/share/bigbluebutton/nginx

# Set database
  # make sure postgres can read this directory
  sudo chmod 755 /usr/share/bbb-shared-notes-server/ -R

export LANGUAGE="en_US.UTF-8"
export LC_ALL="en_US.UTF-8"

  # Create user blocknote_app@blocknote_app (for blocknote metadata)
  sudo runuser -u postgres -- psql -tc "SELECT 1 FROM pg_roles WHERE rolname='blocknote_app'" | grep -q 1 || \
    sudo runuser -u postgres -- psql -c "CREATE USER blocknote_app WITH PASSWORD 'blocknote_app'"

  HASURA_DATABASE_NAME="blocknote_app"
  sudo runuser -u postgres -- psql -q -c "DROP DATABASE IF EXISTS $HASURA_DATABASE_NAME WITH (FORCE);"
  sudo runuser -u postgres -- psql -q -c "CREATE DATABASE $HASURA_DATABASE_NAME OWNER blocknote_app;"

sudo runuser -u postgres -- psql -U postgres -d $HASURA_DATABASE_NAME -q -f /usr/share/bbb-shared-notes-server/blocknote_schema.sql --set ON_ERROR_STOP=on


# Set service
# mkdir -p /usr/lib/systemd/system
sudo cp ../build/packages-template/bbb-shared-notes-server/bbb-shared-notes-server.service /usr/lib/systemd/system
sudo systemctl enable bbb-shared-notes-server.service
sudo systemctl daemon-reload
sudo systemctl restart nginx
sudo systemctl restart bbb-shared-notes-server.service
