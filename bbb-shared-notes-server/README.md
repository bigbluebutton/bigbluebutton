Set up instructions:

Copy nginx file:
`sudo cp hocuspocus.nginx /usr/share/bigbluebutton/nginx/`

Create a settings file
`cp src/config/settings.json.template src/config/settings.json`

Run the server:
```
npm install
./run-dev.sh
```

Restart nginx:
`sudo systemctl restart nginx`
