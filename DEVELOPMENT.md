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

