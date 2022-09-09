#!/bin/bash
#
# I cribbed this from .github/workflows/automated-tests.yml

# Generate CA
cd /home/ubuntu
mkdir ca
cd ca
openssl rand -base64 48 > bbb-dev-ca.pass
# has to be world readable for getcert cgi script to read it
# chmod 600 bbb-dev-ca.pass ;
openssl genrsa -des3 -out bbb-dev-ca.key -passout file:bbb-dev-ca.pass 2048
# again, has to be world readable for cgi script
chmod a+r bbb-dev-ca.key
openssl req -x509 -new -nodes -key bbb-dev-ca.key -sha256 -days 1460 -passin file:bbb-dev-ca.pass -out bbb-dev-ca.crt -subj "/C=CA/ST=BBB/L=BBB/O=BBB/OU=BBB/CN=BBB-DEV" ;

sudo cp bbb-dev-ca.crt /var/www/html
