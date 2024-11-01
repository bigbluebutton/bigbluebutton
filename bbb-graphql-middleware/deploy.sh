#!/bin/bash

./local-build.sh
sudo mv bbb-graphql-middleware /usr/bin/bbb-graphql-middleware
sudo systemctl restart bbb-graphql-middleware
