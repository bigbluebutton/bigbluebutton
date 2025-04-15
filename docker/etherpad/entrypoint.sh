#!/bin/sh
echo $ETHERPAD_API_KEY > /tmp/apikey
pnpm run prod --apikey /tmp/apikey
