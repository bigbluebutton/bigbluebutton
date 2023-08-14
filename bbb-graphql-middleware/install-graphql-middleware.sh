#!/bin/bash
if [ "$EUID" -ne 0 ]; then
	echo "Please run this script as root ( or with sudo )" ;
	exit 1;
fi;

cd "$(dirname "$0")"

#Install Go
#sudo apt install golang -y
GO_VERSION=1.20.6
wget --no-verbose https://dl.google.com/go/go${GO_VERSION}.linux-amd64.tar.gz \
  && tar -xzf go${GO_VERSION}.linux-amd64.tar.gz \
  && ln -s ${PWD}/go/bin/go /usr/bin/go \
  && rm go${GO_VERSION}.linux-amd64.tar.gz

go version

# Build Graphql Middleware
./local-build.sh
mv bbb-graphql-middleware /usr/local/bin/bbb-graphql-middleware

# Create service bbb-graphql-middleware
cp ./bbb-graphql-middleware-config.env /etc/default/bbb-graphql-middleware
cp ./bbb-graphql-middleware.service /lib/systemd/system/bbb-graphql-middleware.service
systemctl enable bbb-graphql-middleware
systemctl start bbb-graphql-middleware


# Set nginx location
cp ./graphql.nginx /usr/share/bigbluebutton/nginx
systemctl restart nginx


echo ""
echo ""
echo "Bbb-graphql-middleware Installed!"
