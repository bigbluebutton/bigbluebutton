#!/bin/bash
#
# I cribbed this from .github/workflows/automated-tests.yml

# Generate SSL Certificate Authority in /ca (if it doesn't exist)

if [[ ! -r /opt/ca/bbb-dev-ca.key ]]; then
    cd /opt/ca
    openssl genrsa -out bbb-dev-ca.key 2048
    # has to be world readable for getcert cgi script to read it
    chmod a+r bbb-dev-ca.key
    openssl req -x509 -new -nodes -key bbb-dev-ca.key -sha256 -days 1460 -out bbb-dev-ca.crt -subj "/C=CA/ST=BBB/L=BBB/O=BBB/OU=BBB/CN=BBB-DEV" ;
fi

sudo cp /opt/ca/bbb-dev-ca.crt /var/www/html
