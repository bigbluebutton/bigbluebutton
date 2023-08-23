#!/bin/bash -e

case "$1" in
  configure|upgrade|1|2)

  fc-cache -f


  #It's necessary to stop services that access the database before dropping it
  AKKA_APPS_STATUS=$(systemctl is-active "bbb-apps-akka")
  GRAPHQL_SERVER_STATUS=$(systemctl is-active "bbb-graphql-server")
  if [ "$AKKA_APPS_STATUS" = "active" ]; then
    echo "Stopping Akka-apps"
    sudo systemctl stop bbb-apps-akka
  fi
  if [ "$GRAPHQL_SERVER_STATUS" = "active" ]; then
    echo "Stopping Hasura"
    sudo systemctl stop bbb-graphql-server
  fi

  sudo -u postgres psql -c "alter user postgres password 'bbb_graphql'"

  #Create database hasura_app which will be used by Hasura (bbb-graphql-server)
  DATABASE_HASURA="hasura_app"
  DB_EXISTS=$(sudo -u postgres psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DATABASE_HASURA'")
  if [ "$DB_EXISTS" = '1' ]
  then
      echo "Database $DATABASE_HASURA already exists"
  else
      sudo -u postgres psql -c "create database $DATABASE_HASURA"
      echo "Database $DATABASE_HASURA created"
  fi

  #Create database bbb_graphql and its tables
  DATABASE_BBB_GRAPHQL="bbb_graphql"
  sudo -u postgres psql -c "drop database if exists $DATABASE_BBB_GRAPHQL"
  sudo -u postgres psql -c "create database $DATABASE_BBB_GRAPHQL"
  sudo -u postgres psql -c "alter database $DATABASE_BBB_GRAPHQL set timezone to 'UTC'" #Using UTC to make it easier to sync time between server and client
  sudo -u postgres psql -U postgres -d $DATABASE_BBB_GRAPHQL -a -f /usr/share/bbb-graphql-server/bbb_schema.sql --set ON_ERROR_STOP=on
  echo "Database $DATABASE_BBB_GRAPHQL created"

  if [ "$AKKA_APPS_STATUS" = "active" ]; then
    echo "Starting Hasura"
    sudo systemctl start bbb-graphql-server
  fi
  if [ "$GRAPHQL_SERVER_STATUS" = "active" ]; then
    echo "Starting Akka-apps"
    sudo systemctl start bbb-apps-akka
  fi

  echo "Postgresql configured"

  if [ ! -f /.dockerenv ]; then
    systemctl enable bbb-graphql-server.service
    systemctl daemon-reload
    startService bbb-graphql-server || echo "bbb-graphql-server service could not be registered or started"

    # Apply BBB metadata in Hasura
    cd /usr/share/bbb-graphql-server
    /usr/local/bin/hasura/hasura metadata apply
    cd ..
    rm -rf /usr/share/bbb-graphql-server/metadata
  fi

  ;;

  abort-upgrade|abort-remove|abort-deconfigure)
  ;;

  *)
    echo "postinst called with unknown argument \`$1'" >&2
    exit 1
  ;;
esac
