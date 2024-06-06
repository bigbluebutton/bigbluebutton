
![BigBlueButton 3.0 runs on Ubuntu 22.04](/img/30_BBB_header.png)

## Overview

### This document is still a draft, BigBlueButton 3.0 is under development

BigBlueButton 3.0 offers users improved usability, increased engagement, and more performance.

- **Usability** - making common functions (such as raise hand) easier
- **Engagement** - giving the instructor more ways to engage students
- **Performance** - increasing overall performance and scalability

Here's a breakdown of what's new in 3.0.

### Usability

#### Upgraded whiteboard

We have done significant work to adopt the newly released version 2 of tl;draw. It comes with even more tools and capabilities and has allowed us to embark on more ambitious whiteboard projects, for example a prototype of an Infinite Canvas.

#### New layouts for specific integration scenarios

Several new layouts have been added ("Cameras Only", "Presentation Only", and "Participants and Chat Only") to address various use cases of hybrid education - for example splitting views of the BigBlueButton session to be visible on different physical screens.

#### Improved Away Mode

We have made changes so that when you set yourself as being Away, your microphone is now automatically muted, your webcam is also muted (blank).

![set yourself away](/img/30/30-set-away.png)

 When you return and unmute yourself this counts as disabling Away mode. The control for toggling away mode is now positioned in the Reactions bar.

![set yourself active](/img/30/30-set-active.png)

Away mode also is recorded in the public chat area.

![away public chat](/img/30/30-away-public-chat.png)

#### Leave Meeting Button

A contribution from community member Jan Kessler, the direct Leave Meeting button was first introduced in BigBlueButton 2.7.5. Starting with BigBlueButton 3.0 we are making it enabled by default.

![leave the meeting red button](/img/30/30-leave-meeting.png)

Viewers can leave the meeting by using this new red button, previously hidden near the Setting menu. For moderators, the button includes the option to end the meeting as well. 

#### Better looking polling results

We have enhanced the view of the polling results that appear over the whiteboard. It is now much more intuitive to read.

![better polling results](/img/30/30-poll-annotation.png)

### Engagement

<!-- ####  -->


<!-- ### Analytics -->


### Behind the scene

#### Introduction of plugins

We have made significant changes to the architecture of BigBlueButton and have introduced support to plugins -- optional custom modules included in the client which allow expanding the capabilities of BigBlueButton. A data channel is provided to allow for data exchange between clients. See the [HTML5 Plugin SDK](https://github.com/bigbluebutton/bigbluebutton-html-plugin-sdk) for examples and more information.

At the moment of writing these documentation, the official list of plugins includes: 
- [Select Random User](https://github.com/bigbluebutton/plugins/tree/main/pick-random-user-plugin)
- [Generic Link Share](https://github.com/bigbluebutton/plugins/tree/main/generic-link-share)
- [Session Share](https://github.com/bigbluebutton/plugins/tree/main/session-share)
- [Decrease external video's volume on speak](https://github.com/bigbluebutton/plugins/tree/main/decrease-volume-on-speak)

#### Replaced Akka framework with Pekko

Following the license change of Akka back in September 2022 we considered several options and decided to replace our use of Akka with [Apache Pekko](https://github.com/apache/incubator-pekko) More on the transition: https://github.com/bigbluebutton/bigbluebutton/pull/18694

#### Override client settings through API /create call

Administrators will appreciate that we now allow passing of custom client settings through the meeting create API call. You no longer need separate servers to accommodate for sessions requiring vastly different settings.yml configuration

#### Major strides in replacing Meteor

For years we have discussed internally the topic of replacing Meteor.js with other technologies in order to improve scalability, performance, etc. In the last year we have introduced several different new components to replace Meteor. The work is underway, it will span into BigBlueButton 3.0, 3.1, possibly 3.2 too.
These new components are: `bbb-graphql-server`, `bbb-graphql-middleware`, `bbb-graphql-actions`, database Postgres, GraphQL server Hasura.

Note: The services `bbb-html5-backend` and `bbb-html5-frontend` have been removed and `bbb-html5` modified heavily as a result of the change in architecture.

#### The whiteboard was improved

We upgraded tl;draw from version 1 to version 2.0.0-alpha.19 (the last version on Apache 2.0 licence). That was quite a significant task but brought better performance, better looks, improved stylus support and many more. Note that we have forked tldraw's project as of their version 2.0.0-alpha.19 to ensure we remain on the Apache 2.0 license. We will be maintaining the fork so that BigBlueButton has a stable whiteboard in the future.

#### Support for Collabora Online as Document Converter
￼
￼Collabora Productivity contributed the support for an alternative conversion script where Collabora Online (deployed locally [as a docker container] or running remotely) can be used for document conversion.
￼For more information check the [pull request](https://github.com/bigbluebutton/bigbluebutton/pull/18783)

### Experimental

<!-- #### LiveKit support -->

<!-- Infinite whiteboard -->

### Upgraded components

Under the hood, BigBlueButton 3.0 installs on Ubuntu 22.04 64-bit, and the following key components have been upgraded
...

For full details on what is new in BigBlueButton 3.0, see the release notes.


Recent releases:

- [3.0.0-alpha.5](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-alpha.5)
- [3.0.0-alpha.4](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-alpha.4)
- [3.0.0-alpha.3](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-alpha.3)
- [3.0.0-alpha.2](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-alpha.2)
- [3.0.0-alpha.1](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-alpha.1)

### Other notable changes

#### Removal of Kurento

We have removed all use of Kurento Media Server. For the live media transmission we still rely on mediasoup. For the recording portion we make use of our own component `bbb-webrtc-recorder`. BigBlueButton 3.0 is the first release where we do not even install Kurento.

#### Select Random User feature removed and is now a plugin

The functionality Select Random User which used to be part of the BigBlueButton core was removed. A plugin with the same functionality was developed and [made public](https://github.com/bigbluebutton/plugins/tree/main/pick-random-user-plugin).

#### Improved support for various SHA algorithms for checksum calculation

In BigBlueButton 2.6.17/2.7.5/3.0.0-alpha.5 we added a new configuration property for bbb-apps-akka package under `services` called `checkSumAlgorithmForBreakouts`. By default the value is `"sha256"`. It controls the algorithm for checksum calculation for the breakout rooms join link. In case you overwrite bbb-web's `supportedChecksumAlgorithms` property removing sha256 you will need to set a supported algorithm here too. For example if you want to only use `sha512`, set `supportedChecksumAlgorithms=sha512` in `/etc/bigbluebutton/bbb-web.properties` and also set `checkSumAlgorithmForBreakouts="sha512"` in `/etc/bigbluebutton/bbb-apps-akka.conf` and then restart BigBlueButton.

#### Deprecating join parameter `defaultLayout`, replacing with `userdata-bbb_default_layout`.

In BigBlueButton 3.0.0-alpha.5 we replaced the JOIN parameter `defaultLayout` with the JOIN parameter `userdata-bbb_default_layout`. If none provided the `meetingLayout` (passed on CREATE) will be used. If none passed, and if none passed there, the `defaultMeetingLayout` from bbb-web will be used.

#### Recording event TranscriptUpdatedRecordEvent blocked

In BigBlueButton 2.7.5/3.0.0-alpha.5 we stopped propagating the events.xml event TranscriptUpdatedRecordEvent due to some issues with providing too much and too repetitive data.

### Changes to events.xml

Retired events
- `DeskShareNotifyViewersRTMPRecordEvent`
- `DeskshareStartRtmpRecordEvent`
- `DeskshareStopRtmpRecordEvent`
- `TranscriptUpdatedRecordEvent`

#### bbb-web properties changes

- `allowOverrideClientSettingsOnCreateCall=false` added
- `sessionsCleanupDelayInMinutes=60` added
- `graphqlWebsocketUrl=${bigbluebutton.web.serverURL}/graphql` added

### Development

For information on developing in BigBlueButton, see [setting up a development environment for 3.0](/development/guide).

The build scripts for packaging 3.0 (using fpm) are located in the GitHub repository [here](https://github.com/bigbluebutton/bigbluebutton/tree/v3.0.x-release/build).

### Contribution

We welcome contributors to BigBlueButton 3.0!  The best ways to contribute at the current time are:

<!-- - Help localize BigBlueButton 3.0 on [Transifex project for BBB 3.0](https://www.transifex.com/bigbluebutton/bigbluebutton-v30-html5-client/dashboard/) -->

- Try out [installing BigBlueButton 3.0](/administration/install) and see if you spot any issues.
- Help test a [3.0 pull request](https://github.com/bigbluebutton/bigbluebutton/pulls?q=is%3Aopen+is%3Apr+milestone%3A%22Release+3.0%22) in your development environment.
  <!-- TODO create a GitHub label for contributions-welcome and link here -->
