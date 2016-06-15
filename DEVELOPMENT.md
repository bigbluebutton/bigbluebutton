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

export MAVEN_HOME=$HOME/dev/tools/maven
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
git clone https://github.com/bigbluebutton/red5-parent.git
cd red5-parent/
git checkout snapshot-mar-30-2016
mvn install
```

Build red5-io

```
cd ~/dev
git clone https://github.com/bigbluebutton/red5-io.git
cd red5-io
git checkout snapshot-mar-30-2016
./bbb-build.sh
```

Build red5-server-common

```
cd ~/dev
git clone https://github.com/bigbluebutton/red5-server-common.git
cd red5-server-common
git checkout snapshot-mar-30-2016
./bbb-build.sh
```

Build red5-server

```
cd ~/dev
git clone https://github.com/bigbluebutton/red5-server.git
cd red5-server
git checkout snapshot-mar-30-2016
./build-red5.sh

# Deploy red5, this will copy the new red5 to /usr/share
# and modify the symlink you created above.

./deploy-red5.sh
```

# Developing the client


# Client Development
With the development environment checked out and the code cloned, we are ready to start developing!

This section will walk you through making a simple change to the BigBlueButton client.

## Setting up the environment

The first thing you need to do is to copy the template `config.xml` file to the build directory for the client.

```
cd ~/dev/bigbluebutton/
cp bigbluebutton-client/resources/config.xml.template bigbluebutton-client/src/conf/config.xml
```

The `config.xml` file is one of the first files loaded by the BigBlueButton client when it connects to the server.  The `config.xml` file tells BigBlueButton client how to load the remaining components (such as chat module, deskshare module, video conf module, etc.) and sets a number of configuration parameters for each component.  The `config.xml` specifies the hostname (or IP address) for loading each component.

Let's look at the first ten lines of the `config.xml` file you just copied.

```
$ head -n 10 bigbluebutton-client/src/conf/config.xml
<?xml version="1.0" ?>
<config>
    <localeversion suppressWarning="false">0.9.0</localeversion>
    <version>VERSION</version>
    <help url="http://HOST/help.html"/>
    <javaTest url="http://HOST/testjava.html"/>
    <porttest host="HOST" application="video/portTest" timeout="10000"/>    
    <bwMon server="HOST" application="video/bwTest"/>
    <application uri="rtmp://HOST/bigbluebutton" host="http://HOST/bigbluebutton/api/enter"/>
    <language userSelectionEnabled="true" />
```

You will see the word `HOST` where there would be configured hostname/IP address.  You need to change the text `HOST` to the IP address (or hostname) of your BigBlueButton server.  For example, if the IP address of your BigBlueButton server is `192.168.1.145`, then using the following command you can easily substitute all occurrences of `HOST` with `192.168.1.145`.

Note: Don't copy-and-paste the following command as-is: the address `192.168.1.145` is likely not the correct IP address (or hostname) for your BigBlueButton server.  Substitute the IP address (or hostname) for your BigBlueButton server.

```
sed -i s/HOST/192.168.1.145/g bigbluebutton-client/src/conf/config.xml
```

After you've done the above command, take a quick look at the file and ensure all instances of `HOST` are properly replaced with the IP address (or hostname) of your BigBlueButton server.

The `config.xml` is ultimately loaded by the BigBlueButton client when a user joins a session on the server.  

Later on, when you deploy your modified client to the BigBlueButton server, there will be two BigBlueButton clients on your server: your modified BigBlueButton client and the default BigBlueButton packaged client (again, this is good as you can switch back and forth). However, the BigBlueButton configuration command `sudo bbb-conf ` only modifies the packaged BigBlueButton client and you will need to mirror any changes to the packaged config.xml to the secondary client's config.xml.

Next, you need to setup nginx to redirect calls to the client towards your development version. If you don't already have nginx client development file at `/etc/bigbluebutton/nginx/client_dev`, create one with the following command.

**NOTE:** Make sure to replace "firstuser" with your own username if it's different.

```
echo "
location /client/BigBlueButton.html {
	root /home/firstuser/dev/bigbluebutton/bigbluebutton-client;
	index index.html index.htm;
	expires 1m;
}

# BigBlueButton Flash client.
location /client {
	root /home/firstuser/dev/bigbluebutton/bigbluebutton-client;
	index index.html index.htm;
}
" | sudo tee /etc/bigbluebutton/nginx/client_dev 
```

Check the contents to ensure it matches below.

Again, make sure you change `/home/firstuser` to match your home directory.

```
$ cat /etc/bigbluebutton/nginx/client_dev

location /client/BigBlueButton.html {
	root /home/firstuser/dev/bigbluebutton/bigbluebutton-client;
	index index.html index.htm;
	expires 1m;
}

# BigBlueButton Flash client.
location /client {
	root /home/firstuser/dev/bigbluebutton/bigbluebutton-client;
	index index.html index.htm;
}
```

These rules tell nginx where to find the BigBlueButton client.  Currently, nginx is using the rules with the default BigBlueButton client through a symbolic link.

```
$ ls -al /etc/bigbluebutton/nginx/client.nginx
lrwxrwxrwx 1 root root 31 2013-05-05 15:44 /etc/bigbluebutton/nginx/client.nginx -> /etc/bigbluebutton/nginx/client
```

Modify this symbolic link so it points to the development directory for your BigBlueButton client.

```
sudo ln -f -s /etc/bigbluebutton/nginx/client_dev /etc/bigbluebutton/nginx/client.nginx
```

Check that the modifications are in place.

```
$ ls -al /etc/bigbluebutton/nginx/client.nginx
lrwxrwxrwx 1 root root 35 2013-05-05 21:07 /etc/bigbluebutton/nginx/client.nginx -> /etc/bigbluebutton/nginx/client_dev
```

Now we need to restart nginx so our changes take effect.

```
$ sudo service nginx restart
Restarting nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
configuration file /etc/nginx/nginx.conf test is successful nginx.
```

Now, when you launch the BigBlueButton client, nginx will serve the client from your development directory.  Next, we need to rebuild the client.

## Building the client
Let's now build the client.  Note we're going to build and run the client to make sure it works before making any changes to the source.

First, we'll build the locales (language translation files).  If you are not modifying the locales, you only need to do this once.

```
cd ~/dev/bigbluebutton/bigbluebutton-client
```

Build build a specific locale (en_US default)

```
ant locale -DLOCALE=en_US
```

To build all locales

```
ant locales
```

This will take about 10 minutes (depending on the speed of your computer).  Next, let's build the client

```
ant
```

This will create a build of the BigBlueButton client in the `/home/firstuser/dev/bigbluebutton/bigbluebutton-client/client` directory.


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

Turn off red5 service

```
sudo service bbb-red5 stop
```

You need to make `red5/webapps` writeable. Otherwise, you will get a permission error when you try to deploy into Red5.

```
sudo chmod -R 777 /usr/share/red5/webapps
```

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






