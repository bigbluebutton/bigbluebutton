This document provides instructions for developers to setup their
environment and work on the upcoming BBB 2.0 (tentative release version).

## Install BBB 1.1

Follow the (install instructions)[http://docs.bigbluebutton.org/install/install.html] for 1.1.

Make sure you have a working BBB 1.1 before you proceed with the instructions below.

## Setup development environment

Setup your development environment following these (instructions)[http://docs.bigbluebutton.org/dev/setup.html]

## Checkout development branch

Checkout the development branch `move-java-classes-from-bbb-web-to-bbb-common-web` from this (repository)[https://github.com/ritzalam/bigbluebutton]

Open nine (9) terminal windows so you will dedicate one window for each bbb-component. 
You can name them client, bbb-apps, apps-common, red5, akka-apps, akka-fsesl, bbb-web, common-web, and messages.


## Building the client

On you bbb-client terminal, run the following commands.

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


## Build BBB Red5 Applications

On your red5 terminal, turn off red5 service

```
sudo systemctl stop red5
```

You need to make `red5/webapps` writeable. Otherwise, you will get a permission error when you try to deploy into Red5.

```
sudo chmod -R 777 /usr/share/red5/webapps
```

### Build common-message

On your message terminal, run the following commands. Other components depends on this, so build this first.


```
cd ~/dev/bigbluebutton/bbb-common-message/
sbt clean

sbt publish
sbt publishLocal
```

### Build bbb-apps

We've split bbb-apps into bbb-apps-common and bigbluebutton-apps. We need to build bbb-apps-common first.

On your apps-common terminal, build the bbb-apps-common component.

```
cd ~/dev/bigbluebutton/bbb-apps-common/

# Force updating of bbb-commons-message
sbt clean

# Build and share library
sbt publish publishLocal
```

On your bbb-apps terminal, run the following commands.

```
cd ~/dev/bigbluebutton/bigbluebutton-apps/

# To make sure the lib folder is clean of old dependencies especially if you've used this
# dev environment for BBB 1.1, delete the contents of the lib directory. You can only to
# do once.
rm lib/*

# Force updating dependencies (bbb-apps-common)
gradle clean

gradle resolveDeps
gradle war deploy
```

## Manually start services

### Run Red5

On your red5 terminal, start red5.

```
cd /usr/share/red5
sudo -u red5 ./red5.sh
```

### Run Akka Apps

On your akka-apps terminal, start akka-apps

```
cd ~/dev/bigbluebutton/akka-bbb-apps

# To make sure the lib folder is clean of old dependencies especially if you've used this
# dev environment for BBB 1.1, delete the contents of the lib directory. You can only to
# do once.
rm lib_managed/*

# We need to stop the existing packaged akka-apps
sudo systemctl stop bbb-apps-akka

# Now we can run our own
sbt clean
sbt run
```

### Run Akka FSESL App

On your akka-fsesl terminal, start akka-fsesl

```
cd ~/dev/bigbluebutton/akka-bbb-fsesl

# To make sure the lib folder is clean of old dependencies especially if you've used this
# dev environment for BBB 1.1, delete the contents of the lib directory. You can only to
# do once.
rm lib_managed/*

# We need to stop the existing packaged akka-fsesl
sudo systemctl stop bbb-fsesl-akka

# Now we can run our own
sbt clean
sbt run
```

### Build bbb-web

We've split up bbb-web into bbb-common-web and bigbluebutton-web. We need to build
bbb-common-web first.

On your common-web terminal, run these commands


```
cd ~/dev/bigbluebutton/bbb-common-web/

# To make sure the lib folder is clean of old dependencies especially if you've used this
# dev environment for BBB 1.1, delete the contents of the lib directory. You can only to
# do once.
rm lib_managed/*

# Force updating of dependencies especially bbb-commons-message
sbt clean
sbt publish publishLocal
```


### Run bbb-web


First we need to remove the old `bbb-web` app from tomcat to avoid duplicate messages

```
sudo cp /var/lib/tomcat7/webapps/bigbluebutton.war /var/lib/tomcat7/webapps/bigbluebutton.war-packaged
sudo rm -r /var/lib/tomcat7/webapps/bigbluebutton
```

On your bbb-web terminal, start bbb-web

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

# To make sure the lib folder is clean of old dependencies especially if you've used this
# dev environment for BBB 1.1, delete the contents of the lib directory. You can only to
# do once.
rm lib/*

gradle clean
gradle resolveDeps
grails clean
sudo chmod -R ugo+rwx /var/log/bigbluebutton
grails -Dserver.port=8888 run-war
```

If things started without errors, congrats! 


## Converting and Adding new messages

In bigbluebutton-apps, from [InMessages.scala](https://github.com/bigbluebutton/bigbluebutton/blob/bbb-2x-mconf/akka-bbb-apps/src/main/scala/org/bigbluebutton/core/api/InMessages.scala) choose the message to convert.

```
case class UserShareWebcam(meetingID: String, userId: String, stream: String) extends InMessage
```

In bbb-apps-common, add new message in [BbbCoreEnvelope.scala](https://github.com/bigbluebutton/bigbluebutton/blob/bbb-2x-mconf/bbb-common-message/src/main/scala/org/bigbluebutton/common2/messages/BbbCoreEnvelope.scala)

```
object UserShareWebcamMsg { val NAME = "UserShareWebcamMsg" }
case class UserShareWebcamMsg(header: BbbClientMsgHeader, body: UserShareWebcamMsgBody)
```

Define `UserShareWebcamMsgBody` in `MessageBody.scala`

```
case class UserShareWebcamMsgBody(userId: String, stream: String)
```

From the client, send message as

```
{
  "header": {
    "name": "UserShareWebcamMsg",
    "meetingId": "foo-meetingId",
    "userId": "bar-userId"
  },
  "body": {
    "streamId": "my-webcam-stream"
  }
}

```

In [ReceivedJsonMsgHandlerActor](https://github.com/bigbluebutton/bigbluebutton/blob/bbb-2x-mconf/akka-bbb-apps/src/main/scala/org/bigbluebutton/core/pubsub/senders/ReceivedJsonMsgHandlerActor.scala), deserialize the message with implementation in [ReceivedJsonMsgDeserializer](https://github.com/bigbluebutton/bigbluebutton/blob/bbb-2x-mconf/akka-bbb-apps/src/main/scala/org/bigbluebutton/core/pubsub/senders/ReceivedJsonMsgDeserializer.scala).


```

      case UserShareWebcamMsg.NAME =>
        for {
          m <- routeUserShareWebcamMsg(jsonNode)
        } yield {
          send(envelope, m)
        }
```

Route the message in [ReceivedMessageRouter](https://github.com/bigbluebutton/bigbluebutton/blob/bbb-2x-mconf/akka-bbb-apps/src/main/scala/org/bigbluebutton/core2/ReceivedMessageRouter.scala).

```
  def send(envelope: BbbCoreEnvelope, msg: UserShareWebcamMsg): Unit = {
    val event = BbbMsgEvent(msg.header.meetingId, BbbCommonEnvCoreMsg(envelope, msg))
    publish(event)
  }

```

Handle the message in [MeestingActor](https://github.com/bigbluebutton/bigbluebutton/blob/bbb-2x-mconf/akka-bbb-apps/src/main/scala/org/bigbluebutton/core/running/MeetingActor.scala) replacing the old implementation.

A complete example would be the `ValidateAuthTokenReqMsg`.

## Installing Flex SDK 4.16.0 and Playerglobal 23.0 for version 2.1 development

In the next step, you need to get the Apache Flex 4.16.0 SDK package. 

Next, you need to make a directory to hold the tools needed for BigBlueButton development.

~~~
mkdir -p ~/dev/tools
cd ~/dev/tools
~~~

First, you need to download the SDK tarball from an Apache mirror site and then unpack it.

~~~
wget https://archive.apache.org/dist/flex/4.16.0/binaries/apache-flex-sdk-4.16.0-bin.tar.gz
tar xvfz apache-flex-sdk-4.16.0-bin.tar.gz
~~~

Next, create a linked directory with a shortened name for easier referencing.

~~~
ln -s ~/dev/tools/apache-flex-sdk-4.16.0-bin ~/dev/tools/flex
~~~

Once the Apache Flex SDK is unpacked, you need to download one of the dependencies manually because the file was moved from its original URL.

~~~
wget --content-disposition https://github.com/swfobject/swfobject/archive/2.2.tar.gz
tar xvfz swfobject-2.2.tar.gz
cp -r swfobject-2.2/swfobject flex/templates/
~~~

Now that we've finished with the first dependency we need to download the Adobe Flex SDK.  We'll do this step manually in case the download fails (if it does, remove the incomplete file and issue the `wget` command again).

~~~
cd flex/
mkdir -p in/
wget http://download.macromedia.com/pub/flex/sdk/builds/flex4.6/flex_sdk_4.6.0.23201B.zip -P in/
~~~

Once the supplementary SDK has downloaded, we can use its `build.xml` script to automatically download the remaining third-party tools.

~~~
ant -f frameworks/build.xml thirdparty-downloads
~~~

After Flex downloads the remaining third-party tools, you need to modify their permissions.

~~~
find ~/dev/tools/flex -type d -exec chmod o+rx '{}' \;
chmod 755 ~/dev/tools/flex/bin/*
chmod -R +r ~/dev/tools/flex
~~~

The next step in setting up the Flex SDK environment is to download a Flex library for video.

~~~
mkdir -p ~/dev/tools/flex/frameworks/libs/player/23.0
cd ~/dev/tools/flex/frameworks/libs/player/23.0
wget http://fpdownload.macromedia.com/get/flashplayer/installers/archive/playerglobal/playerglobal23_0.swc
mv -f playerglobal23_0.swc playerglobal.swc
~~~

The last step to have a working Flex SDK is to configure it to work with playerglobal 23.0

~~~
cd ~/dev/tools/flex
sed -i "s/11.1/23.0/g" frameworks/flex-config.xml
sed -i "s/<swf-version>14<\/swf-version>/<swf-version>34<\/swf-version>/g" frameworks/flex-config.xml
sed -i "s/{playerglobalHome}\/{targetPlayerMajorVersion}.{targetPlayerMinorVersion}/libs\/player\/23.0/g" frameworks/flex-config.xml
~~~

With the tools installed, you need to add a set of environment variables to your `.profile` to access these tools.

~~~
vi ~/.profile
~~~

Copy-and-paste the following text at bottom of `.profile`.

~~~

export FLEX_HOME=$HOME/dev/tools/flex
export PATH=$PATH:$FLEX_HOME/bin

export ANT_OPTS="-Xmx512m -XX:MaxPermSize=512m"

~~~

Reload your profile to use these tools (this will happen automatically when you next login).

~~~
source ~/.profile
~~~

Check that the tools are now in your path by running the following command.

~~~
$ mxmlc -version
Version 4.16.0 build 20170305
~~~

## Configure the client to use CDN

It is possible to load the SWF application, modules and and locales from an external server; a CDN as a example. Let's suppose that our eternal domain is `cdn.company.org`

1.First create a `crossdomain.xml` file into `/var/www/bigbluebutton-default/`

~~~xml
<?xml version="1.0"?>
<!DOCTYPE cross-domain-policy SYSTEM "http://www.adobe.com/xml/dtds/cross-domain-policy.dtd">
<cross-domain-policy>
        <site-control permitted-cross-domain-policies="master-only"/>
        <allow-access-from domain="cdn.company.org"/>
</cross-domain-policy>
~~~

For more information about crossdomain policy please visit this link http://www.adobe.com/devnet/articles/crossdomain_policy_file_spec.html

2.In config.xml you can configure some assets to be loaded from an external server. The same can also be done for every `url` property for `module` tag. Please check the example below

~~~xml
<language ... localesConfig="http://cdn.company.org/client/conf/locales.xml"
 		  	  localesDirectory="http://cdn.company.org/client/locale/" />
    <skinning url="http://cdn.company.org/client/branding/css/V2Theme.css.swf" />
    <branding logo="http://cdn.company.org/client/logo.swf" ...
              background="http://cdn.company.org/client/background.png" />

...

<module name="ChatModule" url="http://cdn.company.org/client/ChatModule.swf" ... />
~~~

3.Then in `BigBlueButton.html` make sure you load the main swf from your remote URL. You can make the same with all other assets.

~~~js
            content.innerHTML = '<object type="application/x-shockwave-flash" id="BigBlueButton" name="BigBlueButton" tabindex="0" data="http://cdn.company.org/client/BigBlueButton.swf" style="position: relative; top: 0.5px;" width="100%" height="100%" align="middle"><param name="quality" value="high"><param name="bgcolor" value="#FFFFFF"><param name="allowfullscreen" value="true"><param name="allowfullscreeninteractive" value="true"><param name="wmode" value="window"><param name="allowscriptaccess" value="always"><param name="seamlesstabbing" value="true"></object>';
          }
        };
      } else {
        swfobject.embedSWF("http://cdn.company.org/client/BigBlueButton.swf", "altFlash", "100%", "100%", "11.0.0", "http://cdn.company.org/client/expressInstall.swf", flashvars, params, attributes, embedCallback);
      }
~~~
