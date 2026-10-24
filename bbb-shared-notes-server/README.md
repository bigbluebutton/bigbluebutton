### Set up instructions:

Copy nginx file:
`sudo cp hocuspocus.nginx /usr/share/bigbluebutton/nginx/`

Run the server:
```
npm install
./run-dev.sh
```

Restart nginx:
`sudo systemctl restart nginx`

### Running the tests

```
npm install
npm test
```

### General features

To upload an initial content use the `/create` parameter `sharedNotesInitialContentJsonUrl` and send an URL that points to the initial content
