#!/usr/bin/env bash
cd "$(dirname "$0")"

for var in "$@"
do
    if [[ $var == --reset ]] ; then
    	echo "Performing a full reset..."
      rm -rf node_modules
    fi
done

# Check for missing dependencies
if [ ! -d ./node_modules ] || ! npm ls --depth=0 > /dev/null 2>&1; then
  echo "Running npm install..."
  npm install
fi

npm run build
sudo cp -r build/* /var/bigbluebutton/learning-dashboard
sudo cp learning-dashboard.nginx /usr/share/bigbluebutton/nginx/learning-dashboard.nginx
sudo systemctl restart nginx
echo ''
echo ''
echo '----------------'
echo 'bbb-learning-dashboard updated'
