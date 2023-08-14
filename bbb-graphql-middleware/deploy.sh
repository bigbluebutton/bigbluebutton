#!/bin/bash

./local-build.sh
mv bbb-graphql-middleware /usr/local/bin/bbb-graphql-middleware
systemctl restart bbb-graphql-middleware
