#!/bin/bash

./local-build.sh
sudo mv bbb-graphql-middleware /usr/local/bin/bbb-graphql-middleware
sudo systemctl restart bbb-graphql-middleware
