
![BigBlueButton 2.7 runs on Ubuntu 20.04](/img/27_BBB_header.png)

## Overview

#### Note: this document is a draft. BigBlueButton 2.7 is still under development.

BigBlueButton 2.7 offers users improved usability, increased engagement, and more performance.

- **Usability** - making common functions (such as raise hand) easier
- **Engagement** - giving the instructor more ways to engage students
- **Performance** - increasing overall performance and scalability

Here's a breakdown of what's new in 2.7.

### Usability

#### Grid layout

We have enhanced the layout which is focused on webcams by providing a visual representation of each participant. This way whether a webcam was shared or not, you can more easily be aware of who is speaking, who is present etc.

#### Camera as content

In hybrid learning (and not only) there is a frequently a need for displaying a physical whiteboard or draw the attention of students to a specific physical area. We now support using a webcam as the main content to occupy the presentation area.

![Share camera as content](/img/2.7-share-camera-as-content.png)

#### Disable viewing your own video stream

You can now disable the self viewing of your webcam to reduce fatigue of seeing your own webcam stream. This has been a common request in the recent months. When you disable the view you will see an image of yourself with an overlay reminding you that your webcam is still active and others see you.

![Disable self-view](/img/2.7-disable-self-view.png)

You can re-enable viewing your own webcam at any point.

![Re-enable self-view](/img/2.7-enable-self-view.png)

#### Restore downloading of original presentation

In BigBlueButton 2.4 and 2.5 we supported optional downloading of the entire presentation. In BigBlueButton 2.6 we replaced this option with the capability to download the presentation with all the annotations embedded in it. As of BigBlueButton 2.7 you are be able to do both!


![You can enable original presentation downloading from the upload dialog](/img/27-enable-download-orig-presentation.png)

![Once downloading is enabled, everyone in the room can use it](/img/27-download-orig-presentation.png)


### Engagement

#### Reaction Bar

The Reaction Bar aims to make it much easier for students to respond with emojis to the teacher. The emoji is displayed in the user avatar area for 1 minute (configurable). 

<!-- ### Analytics -->


<!-- ### Performance -->



### Experimental

#### New camera and screen share recorder

Kurento Media Server is still used in BigBlueButton as a recorder for mediasoup streams.
In 2.7, however, there's a new experimental recorder based on the Pion project: `bbb-webrtc-recorder`. This application is written in Go as a standalone service that can be used to record video and screen share streams.
The main goal is for `bbb-webrtc-recorder` to replace Kurento Media Server in BigBlueButton once production grade. Progress can be tracked in:
  - [Issue 13999](https://github.com/bigbluebutton/bigbluebutton/issues/13999)
  - [The bbb-webrtc-recorder repository](https://github.com/bigbluebutton/bbb-webrtc-recorder)

If you want to try the new recorder, you need to instruct `bbb-webrtc-sfu` to use it:
```bash
  $ mkdir -p /etc/bigbluebutton/bbb-webrtc-sfu
  $ if ! grep -q "recordingAdapter: bbb-webrtc-recorder" /etc/bigbluebutton/bbb-webrtc-sfu/production.yml; then echo "recordingAdapter: bbb-webrtc-recorder" >> /etc/bigbluebutton/bbb-webrtc-sfu/production.yml; fi
  $ systemctl restart bbb-webrtc-sfu
```

Issues found during testing should be reported on [BigBlueButton's issue tracker](https://github.com/bigbluebutton/bigbluebutton/issues) or [issue 13999](https://github.com/bigbluebutton/bigbluebutton/issues/13999).

Reverting to the default recorder (Kurento) can be achieved by removing the `recordingAdapter` line from `/etc/bigbluebutton/bbb-webrtc-sfu/production.yml` and restarting `bbb-webrtc-sfu`.

### Upgraded components

Under the hood, BigBlueButton 2.7 installs on Ubuntu 20.04 64-bit, and the following key components have been upgraded
- Spring 2.7.12
- React 18

For full details on what is new in BigBlueButton 2.7, see the release notes.


Recent releases:

### Other notable changes

#### bbb-install-2.7.sh from master branch (bigbluebutton/bbb-install) renamed to bbb-install.sh on branch v2.7.x-release

If you are using bbb-install to configure your servers, be aware that in BigBlueButton 2.6's version of bbb-install by default we install a local TURN server. For more information: https://github.com/bigbluebutton/bbb-install/pull/579 and https://docs.bigbluebutton.org/administration/turn-server


### Development

For information on developing in BigBlueButton, see [setting up a development environment for 2.7](/development/guide).

The build scripts for packaging 2.7 (using fpm) are located in the GitHub repository [here](https://github.com/bigbluebutton/bigbluebutton/tree/v2.7.x-release/build).

### Contribution

We welcome contributors to BigBlueButton 2.7!  The best ways to contribute at the current time are:

<!-- - Help localize BigBlueButton 2.7 on [Transifex project for BBB 2.7](https://www.transifex.com/bigbluebutton/bigbluebutton-v27-html5-client/dashboard/) -->

- Try out [installing BigBlueButton 2.7](/administration/install) and see if you spot any issues.
- Help test a [2.7 pull request](https://github.com/bigbluebutton/bigbluebutton/pulls?q=is%3Aopen+is%3Apr+milestone%3A%22Release+2.7%22) in your development environment.
  <!-- TODO create a GitHub label for contributions-welcome and link here -->
