## Install OpenJDK 8

```
sudo add-apt-repository ppa:openjdk-r/ppa
sudo apt-get update
sudo apt-get install openjdk-8-jdk
```

Change the default jre. Choose Java 8.

```
sudo update-alternatives --config java
```

Change the default jdk. Choose Jdk8

```
sudo update-alternatives --config javac
```

## Environment Variables

Edit `~/.profile` and change `JAVA_HOME`

```
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
```

Save the file and refresh environment vars.

```
source ~/.profile
```

## Update Development Tools

### Install Gradle

Install gradle-2.12

### Install Grails

Install grails-2.5.2

### Install Maven

Install apache-maven-3.3.3

Edit ```~/.profile``` to point to the above versions

## Setup Red5

```
cd /usr/share

# Make a backup of the deployed red5

sudo mv red5 red5-orig

# Symlink red5 to old red5

sudo ln -s red5-orig red5
```

## Build Red5

Build red5-parent 

```
cd ~/dev
git clone git@github.com:bigbluebutton/red5-parent.git
cd red5-parent/
git checkout snapshot-mar-30-2016
mvn install
```

Build red5-io

```
cd ~/dev/tools
git clone git@github.com:bigbluebutton/red5-io.git
cd red5-io
./bbb-build.sh
```

Build red5-server-common

```
cd ~/dev/tools
git clone git@github.com:bigbluebutton/red5-server-common.git
cd red5-server-common
./bbb-build.sh
```

Build red5-server

```
cd ~/dev/tools
git clone git@github.com:bigbluebutton/red5-server.git
cd red5-server
./build-red5.sh

# Deploy red5, this will copy the new red5 to /usr/share
# and modify the symlink you created above.

./deploy.sh
```

## Build client

```
# Copy config.xml.template
cd ~/dev/tools/bigbluebutton/bigbluebutton-client
cp resources/config.xml.template src/conf/config.xml
```

Edit `config.xml`. Remove deskshare and leave screenshare module.
Make sure that you have replaced `HOST` with you BBB IP.

## Setup nginx

Create file `/etc/bigbluebutton/nginx/screenshare.nginx` and add the following:

```
# Handle desktop sharing.  Forwards
# requests to Red5 on port 5080.
location /screenshare {
  proxy_pass         http://127.0.0.1:5080;
  proxy_redirect     default;
  proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
  client_max_body_size       10m;
  client_body_buffer_size    128k;
  proxy_connect_timeout      90;
  proxy_send_timeout         90;
  proxy_read_timeout         90;
  proxy_buffer_size          4k;
  proxy_buffers              4 32k;
  proxy_busy_buffers_size    64k;
  proxy_temp_file_write_size 64k;
  include    fastcgi_params;
}
```

Restart nginx

```
sudo service nginx restart
```

## Build BBB Red5 Applications

### Build common-message

```
cd ~/dev/bigbluebutton/bbb-common-message/
sbt publish
sbt publishLocal
```

### Build bbb-apps

```
cd ~/dev/bigbluebutton/bigbluebutton-apps/
gradle resolveDeps
gradle clean war deploy
```

### Build bbb-voice

```
cd ~/dev/bigbluebutton/bbb-voice
```

Edit `src/main/webapp/WEB-INF/bigbluebutton-sip.properties`
Make sure the IP addresses point to yout BBB server.

```
bbb.sip.app.ip=192.168.74.128

# The ip and port of the FreeSWITCH server
freeswitch.ip=192.168.74.128
```

```
gradle resolveDeps
gradle clean war deploy
```

### Build bbb-video

```
cd ~/dev/bigbluebutton/bbb-video/
gradle resolveDeps
gradle clean war deploy
```

### Build bbb-screenshare

```
cd ~/dev/bigbluebutton/bbb-screenshare/app
```

Edit `src/main/webapp/WEB-INF/screenshare.properties`
Make sure the following points to your BBB server.

```
streamBaseUrl=rtmp://192.168.74.128/screenshare
jnlpUrl=http://192.168.74.128/screenshare
jnlpFile=http://192.168.74.128/screenshare/screenshare.jnlp
```

Build and deploy

```
./deploy.sh
```



