
![BigBlueButton 2.7 runs on Ubuntu 20.04](/img/27_BBB_header.png)

## Overview

BigBlueButton 2.7 offers users improved usability, increased engagement, and more performance.

- **Usability** - making common functions (such as raise hand) easier
- **Engagement** - giving the instructor more ways to engage students
- **Performance** - increasing overall performance and scalability

Here's a breakdown of what's new in 2.7.

### Usability

#### Grid layout

We have enhanced the layout which is focused on webcams by providing a visual representation of each participant. This way whether a webcam was shared or not, you can more easily be aware of who is speaking, who is present etc.

![Grid Layout](/img/27-grid-layout.png)

#### Camera as content

In hybrid learning (and not only) there is a frequently a need for displaying a physical whiteboard or draw the attention of students to a specific physical area. We now support using a webcam as the main content to occupy the presentation area.

![Share camera as content](/img/2.7-share-camera-as-content.png)

#### Disable viewing your own video stream

You can now disable the self viewing of your webcam to reduce fatigue of seeing your own webcam stream. This has been a common request in the recent months. When you disable the view you will see an image of yourself with an overlay reminding you that your webcam is still active and others see you.

![Disable self-view](/img/2.7-disable-self-view.png)

You can re-enable viewing your own webcam at any point.

![Re-enable self-view](/img/2.7-enable-self-view.png)

#### Restore downloading of original presentation

In BigBlueButton 2.4 and 2.5 we supported optional downloading of the entire presentation. In BigBlueButton 2.6 we replaced this option with the capability to download the presentation with all the annotations embedded in it. As of BigBlueButton 2.7 you are be able to do both! In fact, you could select between the presentation with the current state of the annotations, the original file that was uploaded, or in case BigBlueButton had to convert the presentation file to PDF, you could also select that intermediate PDF file to be downloaded.

![You can enable original presentation downloading from the upload dialog](/img/27-enable-download-orig-presentation.png)

The download button is overlayed on top of the presentation.

![Once downloading is enabled, everyone in the room can use it](/img/27-download-orig-presentation.png)

#### Timer and stopwatch

We have added the long requested option to display a count down (timer) or a count up (stopwatch) in the session. They are displayed to all participants and there is an audio notification when the timer elapses.

![The timer can be activated from the plus button menu](/img/27-activate-timer.png)

Setting up a timer for four minutes.

![Setting up a 4 minutes timer](/img/27-timer-4mins-start.png)

Everyone sees the timer as it counts down.

![Everyone seeing 4 minutes timer](/img/27-timer-4mins.png)

#### Wake lock

When using BigBlueButton on a mobile device you can now enable Wake lock (if your mobile browser supports the API). When enabled, your device's screen will remain on -- i.e. will not dim -- and therefore your media connections will not be interrupted.

![Enable Wake lock from the Settings modal](/img/27-enable-wake-lock.png)


### Engagement

#### Reactions Bar

The Reactions Bar aims to make it much easier for students to respond with emojis to the teacher. The emoji is displayed in the user avatar area for 1 minute (configurable). The bar remains visible once activated, and the emoji selected remains visible until it times out or is unselected. Modifying the configuration options (settings.yml) an additional set of emojis can be displayed, or the Reactions Bar can be substituted with the Status selecter we used in BigBlueButton 2.6 and prior.

![Reactions Bar remains visible once activated](/img/27-reactions-bar.png)

Others see your reactions in the participants list.

![Others see your reactions in the participants list](/img/27-reactions-thumbs-up.png)

##### Reactions animation

Animations were added to the Reactions Bar as part of BigBlueButton 2.7.2. By default they are disabled in the configurations. To enable them run the following: `yq w -i /etc/bigbluebutton/bbb-html5.yml public.app.emojiRain.enabled true`

You can disable any animations in the client, including Reactions Animations via a toggle in the client: Settings -> Application -> Animations on/off.

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

#### Transparent listen only mode

We've added a new experimental audio mode called "transparent listen only".
The goal is to pave the way for a better audio experience in BigBlueButton by
removing the need for end users to pick between listen only and microphone modes while still
providing a scalable audio solution.

The motivation for this mode can be found in [issue 14021](https://github.com/bigbluebutton/bigbluebutton/issues/14021),
while the implementation details are available in [pull request 18461](https://github.com/bigbluebutton/bigbluebutton/pull/18461).

In version 2.7, we present the initial iteration of this audio mode, primarily focusing on the server side. 
The primary objective is to assess the viability of the proposed approach and gather community feedback.

The new mode is *turned off by default* and is considered *experimental*. To enable it:
  - To enable on clients:
    * Server wide: configure `public.media.transparentListenOnly: true` in `/etc/bigbluebutton/bbb-html5.yml`, then restart `bbb-html5` (`systemctl restart bbb-html5`)
    * Per user: utilize `userdata-bbb_transparent_listen_only=true`

### Upgraded components

Under the hood, BigBlueButton 2.7 installs on Ubuntu 20.04 64-bit, and the following key components have been upgraded
- Spring 2.7.12
- React 18
- NodeJS 18 (up from 16) for `bbb-pads`, `bbb-export-annotations`, `bbb-webrtc-sfu`, `bbb-etherpad`, `bbb-webhooks`
- Java 17 (up from 11) for `bbb-common-message`, `bbb-common-web`, `bigbluebutton-web`, `akka-bbb-apps`, `bbb-fsesl-client`, and `akka-bbb-fsesl`
- Meteor 2.13
- Grails 5.3.2
- GORM 7.3.1
- Groovy 3.0.11

For full details on what is new in BigBlueButton 2.7, see the release notes.


Recent releases:

- [2.7.2](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.7.2)
- [2.7.1](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.7.1)
- [2.7.0](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.7.0)
- [2.7.0-rc.2](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.7.0-rc.2)
- [2.7.0-rc.1](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.7.0-rc.1)
- [2.7.0-beta.3](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.7.0-beta.3)
- [2.7.0-beta.2](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.7.0-beta.2)
- [2.7.0-beta.1](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.7.0-beta.1)
- [2.7.0-alpha.3](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.7.0-alpha.3)
- [2.7.0-alpha.2](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.7.0-alpha.2)
- [2.7.0-alpha.1](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.7.0-alpha.1)

### Other notable changes

#### Renaming (bigbluebutton/bbb-install)bbb-install-2.7.sh from master branch to bbb-install.sh on branch v2.7.x-release

If you are using bbb-install to configure your servers, be aware that starting with BigBlueButton 2.6's version of bbb-install by default we install a local TURN server. For more information: https://github.com/bigbluebutton/bbb-install/pull/579 and https://docs.bigbluebutton.org/administration/turn-server

#### Changing the default setting `guestPolicyExtraAllowOptions`

Starting with BigBlueButton 2.7.0-beta.3 we are hiding by default a couple extra options in the guest approve panel. 'Allow all authenticated users' and 'Allow all guests' options will be hidden unless you override the option `app.public.guestPolicyExtraAllowOptions` in `bbb-html5` config file `settings.yml`. These extra options were not relevant to the vast majority of the use cases and when hidden, the interface becomes much simpler.

#### Changing the default setting `wakeLock`

Starting with BigBlueButton 2.7.0-beta.3 we are enabling wake lock feature by default. It can be disabled by overriding the option `public.app.wakeLock.enabled` in `bbb-html5` config file `settings.yml`.

#### Override default presentation on CREATE via url

In BigBlueButton 2.7.2 we introduced a new way to include a presentation (with the goal to override default.pdf).

Given that there are a few parameters involved, we'd like to provide an example here in addition to the existing documentation in the API table for the CREATE call.

```
preUploadedPresentation=https://dagrs.berkeley.edu/sites/default/files/2020-01/sample.pdf
preUploadedPresentationOverrideDefault=true
preUploadedPresentationName=ScientificPaper.pdf
```

In the above example on meeting creation BigBlueButton will pull the pdf, will convert it and when you join the meeting there will be only one presentation based on the sample.pdf url, named ScientificPaper.pdf.
If `preUploadedPresentationOverrideDefault=false` (or omitted, since `false` is the default value), in the meeting you will see `default.pdf` as the current presentation and one more preloaded presentation called ScientificPaper.pdf to which you can switch at any point without having to wait for conversion to take place.

### Development

For information on developing in BigBlueButton, see [setting up a development environment for 2.7](/development/guide).

The build scripts for packaging 2.7 (using fpm) are located in the GitHub repository [here](https://github.com/bigbluebutton/bigbluebutton/tree/v2.7.x-release/build).

### Contribution

We welcome contributors to BigBlueButton 2.7!  The best ways to contribute at the current time are:

<!-- - Help localize BigBlueButton 2.7 on [Transifex project for BBB 2.7](https://www.transifex.com/bigbluebutton/bigbluebutton-v27-html5-client/dashboard/) -->

- Try out [installing BigBlueButton 2.7](/administration/install) and see if you spot any issues.
- Help test a [2.7 pull request](https://github.com/bigbluebutton/bigbluebutton/pulls?q=is%3Aopen+is%3Apr+milestone%3A%22Release+2.7%22) in your development environment.
  <!-- TODO create a GitHub label for contributions-welcome and link here -->
