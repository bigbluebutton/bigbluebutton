#!/bin/bash
if [ "$EUID" -ne 0 ]; then
	echo "Please run this script as root ( or with sudo )" ;
	exit 1;
fi;

cd "$(dirname "$0")"


# Install Postgresql
apt update
apt install postgresql postgresql-contrib -y
sudo -u postgres psql -c "alter user postgres password 'bbb_graphql'"
sudo -u postgres psql -c "drop database if exists bbb_graphql with (force)"
sudo -u postgres psql -c "create database bbb_graphql WITH TEMPLATE template0 LC_COLLATE 'C.UTF-8'"
sudo -u postgres psql -c "alter database bbb_graphql set timezone to 'UTC'"
sudo -u postgres psql -U postgres -d bbb_graphql -a -f bbb_schema.sql --set ON_ERROR_STOP=on
sudo -u postgres psql -c "drop database if exists hasura_app with (force)"
sudo -u postgres psql -c "create database hasura_app"

echo "Creating frontend in bbb_graphql"
DATABASE_FRONTEND_USER="bbb_frontend"
FRONT_USER_EXISTS=$(sudo -u postgres psql -U postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname = '$DATABASE_FRONTEND_USER'")
if [ "$FRONT_USER_EXISTS" = '1' ]
then
    echo "User $DATABASE_FRONTEND_USER already exists"
else
    sudo -u postgres psql -q -c "CREATE USER $DATABASE_FRONTEND_USER WITH PASSWORD '$DATABASE_FRONTEND_USER'"
    sudo -u postgres psql -q -c "GRANT CONNECT ON DATABASE bbb_graphql TO $DATABASE_FRONTEND_USER"
    sudo -u postgres psql -q -d bbb_graphql -c "REVOKE ALL ON ALL TABLES IN SCHEMA public FROM $DATABASE_FRONTEND_USER"
    sudo -u postgres psql -q -d bbb_graphql -c "GRANT USAGE ON SCHEMA public TO $DATABASE_FRONTEND_USER"
    echo "User $DATABASE_FRONTEND_USER created on database bbb_graphql"
fi

sudo -u postgres psql -q -d bbb_graphql -c "GRANT SELECT ON v_user_connection_auth TO $DATABASE_FRONTEND_USER"

echo "Postgresql installed!"


#Build Hasura
# https://github.com/hasura/graphql-engine/blob/master/server/CONTRIBUTING.md
# sudo apt install haskell-platform -y
# sudo apt-get install cabal-install -y
#wget https://golang.org/dl/go1.16.3.linux-amd64.tar.gz
#sudo sh -c "rm -rf /usr/local/go && tar -C /usr/local -xzf go1.16.3.linux-amd64.tar.gz"
#export PATH=$PATH:/usr/local/go/bin
#go version

# Configs nginx
cp ./graphql.nginx /usr/share/bigbluebutton/nginx
systemctl restart nginx

# Install Hasura graphql as service
#wget https://graphql-engine-cdn.hasura.io/server/latest/linux-amd64 -O /usr/local/bin/hasura-graphql-engine
#chmod +x /usr/local/bin/hasura-graphql-engine

#Hasura 2.29+ requires Ubuntu 22
git clone --branch v2.37.0 https://github.com/iMDT/hasura-graphql-engine.git
cat hasura-graphql-engine/hasura-graphql.part-a* > hasura-graphql
rm -rf hasura-graphql-engine/
chmod +x hasura-graphql
mv hasura-graphql /usr/local/bin/hasura-graphql-engine

apt-get install -y gnupg2 curl apt-transport-https ca-certificates libkrb5-3 libpq5 libnuma1 unixodbc-dev
cp ./hasura-config.env /etc/default/bbb-graphql-server
#Enable Console --Desenv only!!
sudo sed -i 's/HASURA_GRAPHQL_ENABLE_CONSOLE=false/HASURA_GRAPHQL_ENABLE_CONSOLE=true/' /etc/default/bbb-graphql-server

cp ./bbb-graphql-server.service /lib/systemd/system/bbb-graphql-server.service
systemctl enable bbb-graphql-server
systemctl start bbb-graphql-server

# Install Hasura CLI
curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash

# Apply BBB metadata in Hasura
hasura metadata apply --skip-update-check

echo ""
echo ""
echo "Bbb-graphql-server Installed!"
echo "http://$(hostname -f):8080/console"
