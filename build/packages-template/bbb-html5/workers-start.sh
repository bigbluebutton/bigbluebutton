#!/bin/bash
# Start parallel nodejs processes for bbb-html5. Number varies on restrictions file bbb-html5-with-roles.conf

source /usr/share/meteor/bundle/bbb-html5-with-roles.conf

if [ -f /etc/bigbluebutton/bbb-html5-with-roles.conf ]; then
  source /etc/bigbluebutton/bbb-html5-with-roles.conf
fi

MIN_NUMBER_OF_BACKEND_PROCESSES=1
MAX_NUMBER_OF_BACKEND_PROCESSES=4

MIN_NUMBER_OF_FRONTEND_PROCESSES=0 # 0 means each nodejs process handles both front and backend roles
MAX_NUMBER_OF_FRONTEND_PROCESSES=8


# Start backend nodejs processes
if ((NUMBER_OF_BACKEND_NODEJS_PROCESSES >= MIN_NUMBER_OF_BACKEND_PROCESSES && NUMBER_OF_BACKEND_NODEJS_PROCESSES <= MAX_NUMBER_OF_BACKEND_PROCESSES)); then
  for ((i = 1 ; i <= NUMBER_OF_BACKEND_NODEJS_PROCESSES ; i++)); do
    systemctl start bbb-html5-backend@$i
  done
fi


# Start frontend nodejs processes
if ((NUMBER_OF_FRONTEND_NODEJS_PROCESSES >= MIN_NUMBER_OF_FRONTEND_PROCESSES && NUMBER_OF_FRONTEND_NODEJS_PROCESSES <= MAX_NUMBER_OF_FRONTEND_PROCESSES)); then
  if ((NUMBER_OF_FRONTEND_NODEJS_PROCESSES == 0)); then
    echo 'Need to modify bbb-html5.nginx to ensure backend IPs are used'
  fi
  for ((i = 1 ; i <= NUMBER_OF_FRONTEND_NODEJS_PROCESSES ; i++)); do
    systemctl start bbb-html5-frontend@$i
  done
fi

