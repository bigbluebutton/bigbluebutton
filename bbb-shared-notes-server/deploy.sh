sudo cp hocuspocus.nginx /usr/share/bigbluebutton/nginx/hocuspocus.nginx
sudo systemctl restart nginx

# npm ci
cd hocuspocus-server
node dist/index.js

