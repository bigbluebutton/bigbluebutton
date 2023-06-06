Learning Analytics Dashboard will be accessible through https://yourdomain/learning-analytics-dashboard

# Dev Instructions

## Prepare destination directory

```
mkdir -p /var/bigbluebutton/learning-dashboard
chown bigbluebutton /var/bigbluebutton/learning-dashboard/
```

## Build instructions

```
# verify we are in the bbb-learning-dashboard directory ~/src/bbb-learning-dashboard
pwd

if [ -d node_modules ]; then rm -r node_modules; fi
npm install
npm run build
cp -r build/* /var/bigbluebutton/learning-dashboard
```

## Update nginx config

```
cp learning-dashboard.nginx /usr/share/bigbluebutton/nginx/
```
