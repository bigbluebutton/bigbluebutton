#!/bin/bash
set -e -x

go_version=$(go version)

# Extract the version number
version_number=$(echo $go_version | awk '{print $3}' | cut -d "o" -f 2)

# Check if the version starts with 1.22
if [[ ! $version_number == 1.22* ]]; then
  echo "Installing Go 1.22"
  sudo rm -rf /usr/local/go
  wget https://go.dev/dl/go1.22.5.linux-amd64.tar.gz
  sudo tar -C /usr/local -xzf go1.22.5.linux-amd64.tar.gz
  export PATH=$PATH:/usr/local/go/bin
  source ~/.bashrc
  rm go1.22.5.linux-amd64.tar.gz
fi


go version

sudo apt-get install protobuf-compiler -y
sudo go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
sudo go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

cd "$(dirname "$0")"

#export PATH=$PATH:$(go env GOPATH)/bin
sudo ./proto-gen.sh

sudo go get google.golang.org/grpc@v1.64.0
sudo go mod tidy

sudo cp core-api.nginx /usr/share/bigbluebutton/nginx
sudo cp ../build/packages-template/bbb-graphql-middleware/graphql.nginx /usr/share/bigbluebutton/nginx
sudo cp ../bigbluebutton-web/bbb-web.nginx /usr/share/bigbluebutton/nginx/web
sudo cp ../build/packages-template/bbb-graphql-middleware/bbb-graphql-middleware-config.env /etc/default/bbb-graphql-middleware
sudo cp ../build/packages-template/bbb-graphql-server/hasura-config.env /etc/default/bbb-graphql-server
sudo ../bbb-graphql-server/update_graphql_data.sh
sudo systemctl restart nginx bbb-graphql-middleware

sudo cp ../akka-bbb-apps/src/universal/conf/application.conf /usr/share/bbb-apps-akka/conf/application.conf

mkdir -p /tmp/meteor-assets-nginx-cache