# Akka Http: BigBlueButton Meeting API

## Usage

# Update the nginx config

# on bbb-install
# sudo cp ./build/packages-template/bbb-html5/sip.nginx /usr/share/bigbluebutton/nginx/
# sudo cp ./build/packages-template/bbb-webrtc-sfu/webrtc-sfu.nginx /usr/share/bigbluebutton/nginx/

sudo sed -i "s/\/bigbluebutton\/connection\/checkAuthorization/\/api\/connection\/checkAuthorization/g" /usr/share/bigbluebutton/nginx/sip.nginx
sudo sed -i "s/\/bigbluebutton\/connection\/checkAuthorization/\/api\/connection\/checkAuthorization/g" /usr/share/bigbluebutton/nginx/webrtc-sfu.nginx
cd ~/src
sudo cp ./bbb-meeting-api/bbb-meeting-api.nginx /usr/share/bigbluebutton/nginx/
sudo systemctl restart nginx

# To run locally (at `0.0.0.0:8080/api`):
./run-dev.sh


# To compile
1. Compile the app: `sbt compile stage`
2. Run: `./target/universal/stage/bin`

## Tests
Run the tests: `sbt test`
