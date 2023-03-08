#!/bin/bash
if [ "$EUID" -ne 0 ]; then
	echo "Please run this script as root ( or with sudo )" ;
	exit 1;
fi;

cd "$(dirname "$0")"

# sudo apt -y install postgresql postgresql-contrib postgresql-client postgresql-client-common
# sudo -u postgres psql -c "SELECT version();"
# sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'bigbluebutton';"

# psql -U postgres -d myDataBase -a -f myInsertFile


# Install Postgresql
sudo apt update
sudo apt install postgresql postgresql-contrib -y
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'bigbluebutton'"
sudo -u postgres psql -c "create database bigbluebutton"
sudo -u postgres psql -U postgres -d bigbluebutton -a -f bbb_schema.sql
sudo -u postgres psql -c "create database hasura_app"

echo "Postgresql installed!"



# sudo vi /etc/postgresql/12/main/postgresql.conf
# 	listen_addresses = '*'

# sudo vi /etc/postgresql/12/main/pg_hba.conf
# 	host    all             all              0.0.0.0/0                       md5
# 	host    all             all              ::/0                            md5


# sudo docker run --name hasura --rm --net=host -itd -e HASURA_GRAPHQL_DATABASE_URL=postgres://postgres:bigbluebutton@bbb26.bbbvm.imdt.com.br:5432/hasura_app -e HASURA_GRAPHQL_ENABLE_CONSOLE=true -e HASURA_GRAPHQL_LIVE_QUERIES_MULTIPLEXED_REFETCH_INTERVAL=100 hasura/graphql-engine:v2.20.0



# Install Hasura graphql
wget https://graphql-engine-cdn.hasura.io/server/latest/linux-amd64 -O /usr/local/bin/hasura-graphql-engine
chmod +x /usr/local/bin/hasura-graphql-engine
apt-get install -y gnupg2 curl apt-transport-https ca-certificates libkrb5-3 libpq5 libnuma1 unixodbc-dev libmariadb-dev-compat mariadb-client-10.3


cp ./hasura-config.env /etc/default/bbb-graphql-server

cp ./bbb-graphql-server.service /lib/systemd/system/bbb-graphql-server.service

sudo systemctl enable bbb-graphql-server
sudo systemctl start bbb-graphql-server

# Install Hasura CLI
curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash

# Apply BBB metadata in Hasura
/usr/local/bin/hasura metadata apply

echo ""
echo ""
echo "Bbb-graphql-server Installed!"
echo "http://bbb26.bbbvm.imdt.com.br:8080/console"

# /usr/local/bin/hasura-graphql-engine serve

# hasura init bbb-graphql --endpoint http://localhost:8080

# deb http://apt.postgresql.org/pub/repos/apt focal-pgdg main" > /etc/apt/sources.list.d/pgdg.list   && curl -s https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -   && apt-get -y update   && apt-get install -y     postgresql-client-14   && find /usr/bin -name 'pg*' -not -path '/usr/bin/pg_dump' -delete

