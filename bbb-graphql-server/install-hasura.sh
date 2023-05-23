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
sudo -u postgres psql -c "drop database if exists bbb_graphql"
sudo -u postgres psql -c "create database bbb_graphql"
sudo -u postgres psql -U postgres -d bbb_graphql -a -f bbb_schema.sql --set ON_ERROR_STOP=on
sudo -u postgres psql -c "drop database if exists hasura_app"
sudo -u postgres psql -c "create database hasura_app"

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

git clone --branch v2.23.0 https://github.com/iMDT/hasura-graphql-engine.git
cat hasura-graphql-engine/hasura-graphql.part-a* > hasura-graphql
rm -rf hasura-graphql-engine/
chmod +x hasura-graphql
mv hasura-graphql /usr/local/bin/hasura-graphql-engine

apt-get install -y gnupg2 curl apt-transport-https ca-certificates libkrb5-3 libpq5 libnuma1 unixodbc-dev libmariadb-dev-compat mariadb-client-10.3
cp ./hasura-config.env /etc/default/bbb-graphql-server
#Enable Console --Desenv only!!
sudo sed -i 's/HASURA_GRAPHQL_ENABLE_CONSOLE=false/HASURA_GRAPHQL_ENABLE_CONSOLE=true/' /etc/default/bbb-graphql-server

cp ./bbb-graphql-server.service /lib/systemd/system/bbb-graphql-server.service
systemctl enable bbb-graphql-server
systemctl start bbb-graphql-server

# Install Hasura CLI
curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash

# Apply BBB metadata in Hasura
/usr/local/bin/hasura metadata apply

echo ""
echo ""
echo "Bbb-graphql-server Installed!"
echo "http://$(hostname -f):8080/console"
