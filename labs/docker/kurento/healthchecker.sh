#!/bin/bash

[[ "$(curl -w '%{http_code}' -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Host: 127.0.0.1:8888" -H "Origin: 127.0.0.1" http://127.0.0.1:8888/kurento)" == 500 ]] && exit 0 || exit 1
