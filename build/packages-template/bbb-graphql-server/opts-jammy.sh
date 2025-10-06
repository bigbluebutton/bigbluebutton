#!/bin/bash

. ./opts-global.sh

OPTS="$OPTS -d postgresql-14,postgresql-contrib,gnupg2,curl,apt-transport-https,ca-certificates,libkrb5-3,libpq5,libnuma1,unixodbc-dev -t deb"
