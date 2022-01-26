#!/bin/bash

# sudo systemctl stop bbb-html5
meteor reset
if [ -d "node_modules" ]; then
   rm -r node_modules/
fi

meteor npm i
npm start


