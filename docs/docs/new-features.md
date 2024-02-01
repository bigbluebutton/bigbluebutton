
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

### Engagement

<!-- ####  -->


<!-- ### Analytics -->


### Behind the scene

#### Introduction of plugins

We have made significant changes to the architecture of BigBlueButton and have introduced support to plugins -- optional custom modules included in the client which allow expanding the capabilities of BigBlueButton. A data channel is provided to allow for data exchange between clients. See the [HTML5 Plugin SDK](https://github.com/bigbluebutton/bigbluebutton-html-plugin-sdk) for examples and more information.

#### Replaced Akka framework with Pekko

Following the license change of Akka back in September 2022 we considered several options and decided to replace our use of Akka with [Apache Pekko](https://github.com/apache/incubator-pekko) More on the transition: https://github.com/bigbluebutton/bigbluebutton/pull/18694

#### Override client settings through API /create call

Administrators will appreciate that we now allow passing of custom client settings through the meeting create API call. You no longer need separate servers to accommodate for sessions requiring vastly different settings.yml configuration

#### Major strides in replacing Meteor

For years we have discussed internally the topic of replacing MeteorJS with other technologies in order to improve scalability, performance, etc. In the last year we have introduced several different new components which are to replace Meteor. The work is underway, it will span into BigBlueButton 3.0, 3.1, possibly 3.2 too.
These new components are: `bbb-graphql-server`, `bbb-graphql-middleware`, `bbb-graphql-actions`, database Postgres, GraphQL server Hasura. During the transition period, `bbb-html5-backend` and `bbb-html5-frontend` are still present, however, lots of what they used to do is now being carried out by the new components.

### Experimental

<!-- #### LiveKit support -->


### Upgraded components

Under the hood, BigBlueButton 3.0 installs on Ubuntu 22.04 64-bit, and the following key components have been upgraded
...

For full details on what is new in BigBlueButton 3.0, see the release notes.


Recent releases:

- [3.0.0-alpha.2](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-alpha.2)
- [3.0.0-alpha.1](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-alpha.1)

### Other notable changes

#### Removal of Kurento

We have removed all use of Kurento Media Server. For the live media transmission we still rely on mediasoup. For the recording portion we make use of our own component `bbb-webrtc-recorder`. BigBlueButton 3.0 is the first release where we do not even install Kurento.

### Development

For information on developing in BigBlueButton, see [setting up a development environment for 3.0](/development/guide).

The build scripts for packaging 3.0 (using fpm) are located in the GitHub repository [here](https://github.com/bigbluebutton/bigbluebutton/tree/v3.0.x-release/build).

### Contribution

We welcome contributors to BigBlueButton 3.0!  The best ways to contribute at the current time are:

<!-- - Help localize BigBlueButton 3.0 on [Transifex project for BBB 3.0](https://www.transifex.com/bigbluebutton/bigbluebutton-v30-html5-client/dashboard/) -->

- Try out [installing BigBlueButton 3.0](/administration/install) and see if you spot any issues.
- Help test a [3.0 pull request](https://github.com/bigbluebutton/bigbluebutton/pulls?q=is%3Aopen+is%3Apr+milestone%3A%22Release+3.0%22) in your development environment.
  <!-- TODO create a GitHub label for contributions-welcome and link here -->
