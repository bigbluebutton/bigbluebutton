Learning Analytics Dashboard will be accessible through https://yourdomain/learning-analytics-dashboard

# Dev Instructions

## Prepare destination directory

```
mkdir /var/bigbluebutton/learning-dashboard
chown bigbluebutton /var/bigbluebutton/learning-dashboard/
```

## Build instructions

```
cd bbb-learning-dashboard
rm -r node_modules
npm install
npm run build
cp -r build/* /var/bigbluebutton/learning-dashboard
```

## Update nginx config

```
cp bbb-learning-dashboard/learning-dashboard.nginx /etc/bigbluebutton/nginx/
```
