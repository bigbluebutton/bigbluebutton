This document provides instructions for developers to setup their
environment and work on the upcoming BBB 1.1 (tentative release version).

## Install BBB 1.0

Make sure you have a working BBB 1.0 before you proceed with the instructions below.

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

### Install The Core Development Tools

```
sudo apt-get install git-core ant
```


### Install Gradle

```
cd ~/dev/tools
wget http://services.gradle.org/distributions/gradle-2.12-bin.zip
unzip gradle-2.12-bin.zip
ln -s gradle-2.12 gradle 
```

### Install Grails

```
cd ~/dev/tools
wget https://github.com/grails/grails-core/releases/download/v2.5.2/grails-2.5.2.zip
unzip grails-2.5.2.zip
ln -s grails-2.5.2 grails
```

### Install Maven

```
cd ~/dev/tools
wget apache.parentingamerica.com//maven/maven-3/3.3.3/binaries/apache-maven-3.3.3-bin.zip
unzip apache-maven-3.3.3-bin.zip
ln -s apache-maven-3.3.3 maven
```

### Install sbt

```
cd ~/dev/tools
wget https://dl.bintray.com/sbt/native-packages/sbt/0.13.9/sbt-0.13.9.tgz
tar zxvf sbt-0.13.9.tgz
```

In the next step, you need to get the Apache Flex 4.13.0 SDK package. 

**Note:** Even though we're downloading the Apache Flex 4.13.0 SDK, BigBlueButton is developed and built with Flex 3 compatibility mode enabled.

First, you need to download the SDK tarball from an Apache mirror site and then unpack it.

```
wget https://archive.apache.org/dist/flex/4.13.0/binaries/apache-flex-sdk-4.13.0-bin.tar.gz
tar xvfz apache-flex-sdk-4.13.0-bin.tar.gz
```

Once Flex SDK is unpacked, you need to download the Adobe Flex SDK.  We'll do this step manually in case the download fails (if it does, remove the incomplete file and issue the `wget` command again).

```
cd apache-flex-sdk-4.13.0-bin/
mkdir -p in/
wget http://download.macromedia.com/pub/flex/sdk/builds/flex4.6/flex_sdk_4.6.0.23201B.zip -P in/
```

Once the SDK has downloaded, we can use its `build.xml` script to automatically download the remaining third-party tools.

```
ant -f frameworks/build.xml thirdparty-downloads
```

After Flex downloads the remaining third-party tools, you need to modify their permissions.

```
sudo find ~/dev/tools/apache-flex-sdk-4.13.0-bin -type d -exec chmod o+rx '{}' \;
chmod 755 ~/dev/tools/apache-flex-sdk-4.13.0-bin/bin/*
sudo chmod -R +r ~/dev/tools/apache-flex-sdk-4.13.0-bin
```

Next, create a linked directory with a shortened name for easier referencing.

```
ln -s ~/dev/tools/apache-flex-sdk-4.13.0-bin ~/dev/tools/flex
```

The next step in setting up the Flex SDK environment is to download a Flex library for video.

```
cd ~/dev/tools/
mkdir -p apache-flex-sdk-4.13.0-bin/frameworks/libs/player/11.2
cd apache-flex-sdk-4.13.0-bin/frameworks/libs/player/11.2
wget http://fpdownload.macromedia.com/get/flashplayer/installers/archive/playerglobal/playerglobal11_2.swc
mv -f playerglobal11_2.swc playerglobal.swc
```

The last step to have a working Flex SDK is to configure it to work with playerglobal 11.2

```
cd ~/dev/tools/apache-flex-sdk-4.13.0-bin
sudo sed -i "s/11.1/11.2/g" frameworks/flex-config.xml
sudo sed -i "s/<swf-version>14<\/swf-version>/<swf-version>15<\/swf-version>/g" frameworks/flex-config.xml
sudo sed -i "s/{playerglobalHome}\/{targetPlayerMajorVersion}.{targetPlayerMinorVersion}/libs\/player\/11.2/g" frameworks/flex-config.xml
```

With the tools installed, you need to add a set of environment variables to your `.profile` to access these tools.

```
vi ~/.profile
```

Copy-and-paste the following text at bottom of `.profile`.

```

export GRAILS_HOME=$HOME/dev/tools/grails
export PATH=$PATH:$GRAILS_HOME/bin

export FLEX_HOME=$HOME/dev/tools/flex
export PATH=$PATH:$FLEX_HOME/bin

export GRADLE_HOME=$HOME/dev/tools/gradle
export PATH=$PATH:$GRADLE_HOME/bin

export SBT_HOME=$HOME/dev/tools/sbt
export PATH=$PATH:$SBT_HOME/bin 

export MAVEN_HOME=$HOME/dev/tools/mvn
export PATH=$PATH:$MAVEN_HOME/bin 


```

Reload your profile to use these tools (this will happen automatically when you next login).

```
source ~/.profile
```

Check that the tools are now in your path by running the following command.

```
$ mxmlc -version
Version 4.13.0 build 20140701
```

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

```
ant 
```

Build build a specific locale (en_US default)

```
ant locale
```

Equivalent to

```
ant locale -DLOCALE=en_US
```

To build all locales

```
ant locales
```

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

## Stop services


```
sudo /etc/init.d/bbb-red5 stop
sudo service bbb-apps-akka stop
sudo service bbb-fsesl-akka stop
```

Remove old `bbb-web` app from tomcat

```
sudo rm /var/lib/tomcat7/webapps/bigbluebutton.war
```

## Manually start services

### Run Red5

Open up a terminal.

```
cd /usr/share/red5
sudo -u red5 ./red5.sh
```

### Run Akka Apps

Open up another terminal.

```
cd ~/dev/bigbluebutton/akka-bbb-apps
sbt run
```

### Run Akka FSESL App

Open another terminal

```
cd ~/dev/bigbluebutton/akka-bbb-fsesl
sbt run
```

### Run bbb-web

```
cd ~/dev/bigbluebutton/bigbluebutton-web
```

Get the salt and BBB URL from `/var/lib/tomcat7/webapps/demo/bbb_api_conf.jsp`

Edit `grails-app/conf/bigbluebutton.properties` and change the following with
the salt and IP you got from above.

```
bigbluebutton.web.serverURL=http://192.168.74.128
securitySalt=856d5e0197b1aa0cf79897841142a5f6
```

Start bbb-web

```
gradle resolveDeps
grails clean
grails -Dserver.port=8888 run-war
```

If things started without errors, congrats! 






