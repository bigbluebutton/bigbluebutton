---
layout: page
title: "What's New"
category: 2.5
date: 2021-06-09 11:42:28
order: 1
---

![BigBlueButton 2.5 runs on Ubuntu 20.04](/img/25-header.png)


# Overview

BigBlueButton is a virtual classroom designed to help teachers effectively engage students for online learning.  

BigBlueButton is built by teachers, for teachers -- meaning that we, the core developers, spend a lot of time listening to teachers (and students) for their input on designing BigBlueButton for them so they can hold effective virtual classes.

In our research, there are four key foundations of an effective virtual class: management, relationships, engagement, and assessment.  From the point of view of the instructor, the use cases are: 

- **Management** - Setup and manage the virtual classroom for success
- **Relationships** -  Establish presence and trust with and between students
- **Engagement** - Effectively engage and activate their minds for learning
- **Assessment** - Assess progress of students and give timely feedback

From the point of view of the student, the use cases are
- **Relationships** -  Feel comfortable to participate
- **Engagement** - Effectively master new skills
- **Assessment** - Receive help when struggling

We describe the improvements of this release in the context of these foundations.  Here's a breakdown of what's new in 2.5.

## Management

### Easier setup of breakout rooms

Breakout rooms now remember your previous rooms assignments within the current session.  This means if you assign students to breakout rooms and then, later in the class want to reuse the breakout rooms, you don't need to re-assign students.

### Change time of breakout rooms

You can now increase or decrease the remaing time for breakout rooms (the duration).

![Change time in breakouts](/img/25-change-time.gif)


When you change the duration, BigBlueButton will notify each breakout room in the public chat of the new remaining time.

![New duration in breakouts](/img/25-new-duration.png)

### Text message broadcasting to breakout rooms

You can now broadcast a text message to all breakout rooms.  This message will appear in the public chat of each breakout room.

![Message breakout rooms](/img/25-message-breakout.gif)

### Private message users in waiting lobby

When a user is waiting in the lobby (pending moderator approval before they can join the meeting), moderators can now send them a private message.

![Message awaiting guests](/img/25-message-waiting.gif)

The message will appear to the user in the waiting message.  In the screen shot below, the message "We will start the class soon!" appears to the user.

### Waiting users see their order in the waiting queue

When a user is lobby, they will now see their position in the waiting line. 

![Queue order in guest list](/img/25-queue-order.png)

Moderators will see waiting users in the order they joined.  If a moderator accepts or denies a user, all those waiting behind them will get their position updated.

![Queue order moderator](/img/25-queue-order-moderator.png)

### Improvements to Endpoint API 

#### insertDocument

A new API endpoint was added: `/insertDocument`. Now, it is possible to send a batch of documents with all the common presentation parameters such as `current`, `downloadable` and `removable`. 

All the presentations are sent via payload (the body of the request) such as when preuploading documents in `/create` endpoint, whether by a link to download the file or by `base64` encoded file. See the [API documentation](/development/api#insertdocument) for more information

## Engagement

### Prevent users from seeing other cursors in multi-user whiteboard

BigBlueButton lets you engage users visually with multi-user whiteboard.  You can now restrict users to only see their cursor (not all cursors) by enabling the <b>See other viewers cursor</b> option.

![Visual engagement via pointing to a spot on the slide](/img/25-see-cursor-lock-setting.png)

When locked, you can have users point at the screen as a form of visual assessment.  For example, if you were teaching students about Spain and wanted to test their geography, you could show a world map and ask everyone to "point to Spain."

![Visual engagement via pointing to a spot on the slide](/img/25-point-to-spain.gif)

You can see above that most users correctly point to Spain (and you can see the names of those users that didn't get it correct).

Visually pointing gives you may ways to assess users.  Some examples include: 

  * A linear timeline of the last 400 years where you could ask students when particular events occured
  * A line with two endpoints "uncertain" and "certain" asking how comfortable users are with their understanding of new concepts so far in the lecture


### Polling support for multiple answers per question

In previous versions, when asking users to respond to a poll, they can only choose one option. Here the user is prompted to respond to a poll with four choices: A, B, C, or D.

![Regular poll](/img/25-normal-poll.png)

You can now create polls where users can choose more than one answer by selecting the option <b>Allow multiple answers per respondent</b> in the polling dialog.

![Enable mutliple choices poll](/img/25-poll-multiple-options.png)

When this optinon is selected, users can choose mutliple answers.  Here, the user choose both A and B as their answer.


![Choose both A and B](/img/25-choose-a-b.png)

From the presenters view, users that choose multiple answers have their choices separated by commas.  Here Dustin Henderson chooes both A and B.

![Choose multiple options in polling](/img/25-poll-multiple-options.gif)

## Assessment (Learning Analytics Dashboard)

### Timeline View

The Learning Analytics Dashboard now shows a timeline view of when each user was present, with milestones for each slide, along with any emojis they selected (such as Raise Hand).

![Timeline view of learning analytics dashboard](/img/25-timeline.png)

### Scorecare View

Within the Learning Analytics Dashboard, you can now select a user's name to see a score card of their activity.  

![Scorecard view of learning analytics dashboard](/img/25-scorecard-name.png)

When selecting a name, a panel will appear showing a detailed breakdown of the user's attendance, activity score, and responses to polls.

![Example of a scorecard](/img/25-scorecard.png)

### Download data as CSV

The Download Session Data button is in the lower right-hand corner of the Learning Analytics Dashboard.

You will also be able to download the data from the Learning Analytics Dashboard as a CSV file.  

![Download Learning Analytics Dashboard as CSV](/img/25-download-csv.png)

You will also be able to download the data when you (as moderator) end the session.

![Download CSV at end of session](/img/25-download-end.png)

## General Improvements

### Webcam pinning

You can now pin a webcam so it always stays visible.  This is useful if one on of the webcams is showing sign language, for example, and you always want it to be visible.

![Pin webcam](/img/25-pin-webcam.png)

### Screenshot of current slide with annotations

To capture the current slide with annotations, you can now have BigBlueButton give you a PNG image of the current slide.

![Download Annotations](/img/25-download-annotations.png)

### Improved scaling of webcams and screenshare

BigBlueButton now uses [mediasoup](https://mediasoup.org/) (instead of Kurento) as its default WebRTC media server.  You'll find mediasoup able to handle more media streams (including screenshare) using less memory and CPU.

For analysis on mediasoup vs. Kurento, see [BigBlueButton World - BigBlueButton's Media Stack and the Road Ahead](https://youtu.be/SBO5iWLs0KE). Note that Kurento is still installed on the system and still plays a role in the recording of media.


## Experimental

### Two-way microphone connections using Mediasoup

FreeSWITCH is awesome, but it doesn't support dual-stack IPV4 and IPV6 (we bridge this with nginx).  It does not support trickle ICE for quick connections.

The experimental microphone bridge introduced in 2.4 is moving towards feature complete in 2.5.  Support for the following features are now in 2.5:
  - mediasoup now proxies audio connections for FreeSWITCH
  - Echo test
  - Input and output device switching
  - Audio filters

For a list of pending issues for the experimental audio bridge to be considered production-grade, check this [Depends on](https://github.com/bigbluebutton/bigbluebutton/issues/14021#fullaudio-depends-on) section in GitHub.

Moreover, the steps for enabling this have changed slightly since 2.4. If you want to try this (keep in mind it is still experimental), you need to add the `fullAudioEnabled: true` flag in bbb-webrtc-sfu's configuration (`/etc/bigbluebutton/bbb-webrtc-sfu/production.yml`).  

```
mkdir -p /etc/bigbluebutton/bbb-webrtc-sfu
if ! grep -q "fullAudioEnabled: true" /etc/bigbluebutton/bbb-webrtc-sfu/production.yml; then echo "fullAudioEnabled: true" >> /etc/bigbluebutton/bbb-webrtc-sfu/production.yml; fi
```


Once that flag is enabled in bbb-webrtc-sfu, there are two ways of opting in:

1. Using API parameters you can have specific meetings use the experimental bridge by passing: CREATE parameter `meta_fullaudio-bridge=fullaudio` to override the default `sipjs` value

2. You can change the defaults in the settings for bbb-html5 by adding the following to `/etc/bigbluebutton/bbb-html5.yml` (you will likely want to merge it carefully with your existing file):

  ```
  public:
    media:
      audio:
        defaultFullAudioBridge: fullaudio
  ```

After a restart of BigBlueButton (`sudo bbb-conf --restart`), it should be ready to test. Reverting to the default options can be achieved by removing the override sections (and passed API parameters) and restart of BigBlueButton.

## Upgraded components 

### Ubuntu 20.04

Under the hood, BigBlueButton 2.5 installs on Ubuntu 20.04 64-bit, and the following key components have been upgraded

- Tomcat 9
- Java 11
- Meteor 2.7.1
- NodeJS 14.19.1 (for bbb-html5-*)
- SBT 1.6.2
- Grails 5.0.1
- Gradle 7.3.1
- Note that BigBlueButton 2.5 is the first iteration running on Ubuntu 20.04

For full details on what is new in BigBlueButton 2.5, see the release notes. Recent releases:

- [2.5.17](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.17)
- [2.5.16](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.16)
- [2.5.15](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.15)
- [2.5.14](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.14)
- [2.5.12](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.12)
- [2.5.11](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.11)
- [2.5.10](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.10)
- [2.5.9](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.9)
- [2.5.8](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.8)
- [2.5.7](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.7)
- [2.5.6](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.6)
- [2.5.5](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.5)
- [2.5.4](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.4)
- [2.5.3](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.3)
- [2.5.2](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.2)
- [2.5.1](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.1)
- [2.5.0](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.0)
- [rc.4](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.0-rc.4)
- [rc.3](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.0-rc.3)
- [rc.2](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.0-rc.2)
- [rc.1](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.0-rc.1)
- [beta.2](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.0-beta.2)
- [beta.1](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.0-beta.1)
- [alpha.6](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.0-alpha.6)
- [alpha.5](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5.0-alpha.5)
- [alpha-4](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5-alpha-4)
- [alpha-3](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5-alpha-3)
- [alpha-2](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5-alpha-2)
- [alpha-1](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.5-alpha-1)

# Installation

For server requirements, BigBlueButton 2.5 needs similar [minimum server requirements](https://docs.bigbluebutton.org/2.5/install.html#minimum-server-requirements) as 2.4.

To install 2.5, use [bbb-install-2.5.sh](https://github.com/bigbluebutton/bbb-install/blob/master/bbb-install-2.5.sh). For example, the following command installs BigBlueButton 2.5 using `bbb.example.com` as the hostname and `notice@example.com` as the email for Let's Encrypt (you would substitute these values for your own hostname and email address). Notice the version is `-v focal-250`, which will install the latest officially published release (alpha/beta/etc) of BigBlueButton 2.5. If you instead use `-v focal-25-dev`, you will be installing/updating to the very latest build tracking the source code from branch `v2.5.x-release`.

```bash
wget -qO- https://ubuntu.bigbluebutton.org/bbb-install-2.5.sh | bash -s -- -v focal-250 -s bbb.example.com -e notice@example.com  -a -w
```

After installation finishes, you should see the following installed packages (your version numbers may be slightly different).

```bash
# dpkg -l | grep bbb-

ii  bbb-apps-akka              2.5           all          BigBlueButton Apps (Akka)
ii  bbb-config                 1:2.5-9       amd64        BigBlueButton configuration utilities
ii  bbb-demo                   1:2.5-2       amd64        BigBlueButton API demos
ii  bbb-etherpad               1:2.5-3       amd64        The EtherPad Lite components for BigBlueButton
ii  bbb-freeswitch-core        2:2.5-4       amd64        BigBlueButton build of FreeSWITCH
ii  bbb-freeswitch-sounds      1:2.5-2       amd64        FreeSWITCH Sounds
ii  bbb-fsesl-akka             2.5           all          BigBlueButton FS-ESL (Akka)
ii  bbb-html5                  1:2.5-12      amd64        The HTML5 components for BigBlueButton
ii  bbb-learning-dashboard     1:2.5-2       amd64        BigBlueButton bbb-learning-dashboard
ii  bbb-libreoffice-docker     1:2.5-2       amd64        BigBlueButton setup for LibreOffice running in docker
ii  bbb-mkclean                1:0.8.7-1     amd64        Clean and optimize Matroska and WebM files
ii  bbb-pads                   1:2.5-2       amd64        BigBlueButton Pads
ii  bbb-playback               1:2.5-2       amd64        BigBlueButton playback
ii  bbb-playback-presentation  1:2.5-2       amd64        BigBluebutton playback of presentation
ii  bbb-record-core            1:2.5-3       amd64        BigBlueButton record and playback
ii  bbb-web                    1:2.5-6       amd64        BigBlueButton API
ii  bbb-webrtc-sfu             1:2.5-6       amd64        BigBlueButton WebRTC SFU

```

This installs the latest version of BigBlueButton 2.5 with Let's encrypt certificate and the API demos. With the API demos installed, you can open `https://<hostname>/` in a browser (where `<hostname>` is the hostname you specified in the `bbb-install-2.5.sh` command), enter your name, and click 'Join' to join 'Demo Meeting'. For more information, see the [bbb-install-2.5.sh](https://github.com/bigbluebutton/bbb-install/blob/master/bbb-install-2.5.sh) documentation.

We welcome feedback on [our bigbluebutton-dev mailing list](https://groups.google.com/g/bigbluebutton-dev).

## Development

For information on developing in BigBlueButton, see [setting up a development environment for 2.5](/development/guide).

The build scripts for packaging 2.5 (using fpm) are located in the GitHub repository [here](https://github.com/bigbluebutton/bigbluebutton/tree/v2.5.x-release/build).

## Contribution

We welcome contributors to BigBlueButton 2.5!  The best ways to contribute at the current time are:

<!-- - Help localize BigBlueButton 2.5 on [Transifex project for BBB 2.5](https://www.transifex.com/bigbluebutton/bigbluebutton-v25-html5-client/dashboard/) -->

- Try out [installing BigBlueButton 2.5](#installation) and see if you spot any issues.
- Help test a [2.5 pull request](https://github.com/bigbluebutton/bigbluebutton/pulls?q=is%3Aopen+is%3Apr+milestone%3A%22Release+2.5%22) in your development environment.
  <!-- TODO create a GitHub label for contributions-welcome and link here -->
