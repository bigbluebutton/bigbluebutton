#!/usr/bin/env bash
cd "$(dirname "$0")"

if [ $(whoami) != 'bigbluebutton' ]; then
	echo "Run run-dev.sh inside the container"
	exit 1
fi

for var in "$@"
do
    if [[ $var == --reset ]] ; then
    	echo "Performing a full reset..."
      sudo rm -rf build
      sudo rm -rf node_modules
    fi
done

# Check for missing dependencies
if [ ! -d ./node_modules ] || ! npm ls --depth=0 > /dev/null 2>&1; then
  echo "Running npm install..."
  npm install
fi

BBB_URL=$(bbb-conf --secret | grep '^ *URL:' | cut -d' ' -f6 | sed 's|/bigbluebutton/||')

if [ -e public/test/test/learning_dashboard_data.json ]; then
	echo "Json found in public/test/test/learning_dashboard_data.json"
	echo ""
	tput setaf 2;
	echo "To test the Dashboard using the mock json:"
	echo "${BBB_URL}/learning-analytics-dashboard/?meeting=test&report=test"
	echo ""
	tput sgr0
fi

tput setaf 2;
echo "Dashboard address:"
echo "${BBB_URL}/learning-analytics-dashboard/"
echo ""
tput sgr0

sudo cp learning-dashboard-dev.nginx /usr/share/bigbluebutton/nginx/learning-dashboard.nginx
sudo systemctl restart nginx

PORT=3100 WDS_SOCKET_PORT=443 WDS_SOCKET_PATH=learning-analytics-dashboard/ws npm start | cat
