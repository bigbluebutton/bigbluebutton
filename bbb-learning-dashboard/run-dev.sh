#!/usr/bin/env bash
cd "$(dirname "$0")"

for var in "$@"
do
    if [[ $var == --reset ]] ; then
    	echo "Performing a full reset..."
      rm -rf node_modules
    fi
done

if [ ! -d ./node_modules ] ; then
	npm install
fi

mkdir -p public/test/test

if [ -e public/test/test/learning_dashboard_data.json ]; then
	echo "Json found in public/test/test/learning_dashboard_data.json"
	echo ""
	tput setaf 2;
	echo "To test the Dashboard access:"
	echo "http://localhost:3000/learning-analytics-dashboard?meeting=test&report=test"
	echo ""
	tput sgr0
else
	echo "ERROR: Before running, copy a Dashboard data .json from a meeting and save in $(pwd)/public/test/test/learning_dashboard_data.json"
	echo "This file can be found in /var/bigbluebutton/learning-dashboard/\$meetingId/"
  exit 1
fi

npm start | cat
