
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

#### Improved UX for joining audio for transparentListenOnly

When transparentListenOnly is enabled on the server, users can now switch seamlessly between Listen Only and Microphone modes without needing to rejoin audio.

To further improve the user experience, you can disable listenOnlyMode (`public.app.listenOnlyMode` in `/etc/bigbluebutton/bbb-html5.yml` or `userdata-bbb_listen_only_mode`). 
This removes the need to choose between Microphone or Listen Only mode when joining audio in a session. Instead, you are taken directly to the audio configuration screen.

![audio controls when joining audio](/img/30/30-ui-join-audio.png)

Once you are joined in audio you can dynamicly change your audio device configuration from a dropdown located on the mute-yourself button.

![mute yourself has a dropdown menu allowing device changes](/img/30/30-ui-audio-devices-options.png)

#### New layouts for specific integration scenarios

Several new layouts have been added ("Cameras Only", "Presentation Only", and "Participants and Chat Only") to address various use cases of hybrid education - for example splitting views of the BigBlueButton session to be visible on different physical screens.

#### Improved Away mode

We have made changes so that when you set yourself as being Away, your microphone is now automatically muted, your webcam is also muted (blank).

![set yourself away](/img/30/30-set-away.png)

 When you return and unmute yourself this counts as disabling Away mode. The control for toggling away mode is now positioned in the Reactions bar.

![set yourself active](/img/30/30-set-active.png)

Away mode also is recorded in the public chat area.

![away public chat](/img/30/30-away-public-chat.png)

#### Leave meeting button

A contribution from community member Jan Kessler, the direct Leave Meeting button was first introduced in BigBlueButton 2.7.5. Starting with BigBlueButton 3.0 we are making it enabled by default.

![leave the meeting red button](/img/30/30-leave-meeting.png)

Viewers can leave the meeting by using this new red button, previously hidden near the Setting menu. For moderators, the button includes the option to end the meeting as well. 

#### Better looking polling results

We have enhanced the view of the polling results that appear over the whiteboard. It is now much more intuitive to read.

![better polling results](/img/30/30-poll-annotation.png)


#### Private chat messages have a "seen" indicator

We have added an indicator showing when your private chat recipient has seen the message.

![checkmark beside the message indicating it was seen](/img/30/30-seen-message.png)

#### Push to talk was added

You can now use the "M" shortcut while in a conference to control how long your microphone is open. If the option for push to talk is enabled in settings.yml holding "M" will keep your microphone unmuted for as long you hold the key down. Releasing it will mute you again.


### Engagement

<!-- ####  -->

<!-- ### Analytics -->


### Behind the scene

#### Introduction of plugins

We have made significant changes to the architecture of BigBlueButton and have introduced support to plugins -- optional custom modules included in the client which allow expanding the capabilities of BigBlueButton. A data channel is provided to allow for data exchange between clients. See the [HTML5 Plugin SDK](https://github.com/bigbluebutton/bigbluebutton-html-plugin-sdk) for examples and more information.

At the moment of writing these documentation, the official list of plugins includes: 
- [Select Random User](https://github.com/bigbluebutton/plugin-pick-random-user)
- [Share a link](https://github.com/bigbluebutton/plugin-generic-link-share)
- [H5P plugin for BigBlueButton](https://github.com/bigbluebutton/plugin-h5p)
- [Session share](https://github.com/bigbluebutton/plugin-session-share)
- [Decrease the volume of external video when someone speaks](https://github.com/bigbluebutton/plugin-decrease-volume-on-speak)
- [Typed captions](https://github.com/bigbluebutton/plugin-typed-captions)
- [Source code highlight](https://github.com/bigbluebutton/plugin-code-highlight)

#### Replaced Akka framework with Pekko

Following the license change of Akka back in September 2022 we considered several options and decided to replace our use of Akka with [Apache Pekko](https://github.com/apache/incubator-pekko) More on the transition: https://github.com/bigbluebutton/bigbluebutton/pull/18694

#### Override client settings through API /create call

Administrators will appreciate that we now allow passing of custom client settings through the meeting create API call. You no longer need separate servers to accommodate for sessions requiring vastly different settings.yml configuration

#### Removal of Meteor and MongoDB

For years we have discussed internally the topic of replacing Meteor.js with other technologies in order to improve scalability, performance, etc. In the last year we have introduced several different new components to replace Meteor.
These new components are: `bbb-graphql-server`, `bbb-graphql-middleware`, `bbb-graphql-actions`, database Postgres, GraphQL server Hasura. As of BigBlueButton 3.0.0-beta.1 we are no longer using Meteor or MongoDB.

Note: The services `bbb-html5-backend`, `bbb-html5-frontend`, `bbb-html5` and `mongod` have been removed. The client code is compacted and served by NginX. The service `disable-transparent-huge-pages.service` was also removed as it was used to improve performance of MongoDB and is now obsolete.
The package `bbb-html5-nodejs` is no longer needed.

**Important**: Please make sure you're no longer carrying around NodeJS v14 which we used to deploy in `bbb-html5-nodejs`. Your directory `/usr/lib/bbb-html5/node` should not exist.

#### We have forked the tldraw project and use our fork

We upgraded tl;draw from version 1 to version 2.0.0-alpha.19 (the last version on Apache 2.0 licence). That was quite a significant task but brought better performance, better looks, improved stylus support and many more. Note that we have forked tldraw's project as of their version 2.0.0-alpha.19 to ensure we remain on the Apache 2.0 license. We will be maintaining the fork so that BigBlueButton has a stable whiteboard in the future.

#### Support for Collabora Online as document converter

Collabora Productivity contributed the support for an alternative conversion script where Collabora Online (deployed locally [as a docker container] or running remotely) can be used for document conversion.
For more information check the [pull request](https://github.com/bigbluebutton/bigbluebutton/pull/18783)

#### Support for ClamAV as presentation file scanner

We have added support for ClamAV to automatically scan every presentation file for viruses before sharing it with the others in the session.
To use it you would need to first install ClamAV:
The simplest way would be to run it locally as a container.

```
docker pull clamav/clamav`
docker run --name "clamav" --mount type=bind,source=/var/bigbluebutton,target=/var/bigbluebutton -p 3310:3310 -p 7357:7357 clamav/clamav:latest
```


The above run command may take a minute to start. If you prefer you could run with `-d` flag to make it detachable.

Now when you check the running containers you should see an entry like this one:

```
root@test30:~# docker ps
CONTAINER ID   IMAGE                                                       COMMAND                  CREATED          STATUS                    PORTS                                                                                                           NAMES
bda7f5596192   clamav/clamav:latest                                        "/init"                  21 minutes ago   Up 21 minutes (healthy)   0.0.0.0:3310->3310/tcp, :::3310->3310/tcp, 0.0.0.0:7357->7357/tcp, :::7357->7357/tcp                            clamav
```


Additionally you will have to enable scanning:
Specify `scanUploadedPresentationFiles=true` in `/etc/bigbluebutton/bbb-web.properties` and restart BigBlueButton via `sudo bbb-conf --restart`

When you create a new session and try uploading some presentation files, you should not see anything different if the file was fine.
However, if a threat was detected, you will see the message "Upload failed: Virus detected! Please check your file and retry." in the client and the presentation sharing will not proceed.
Additionally, in the logs for `bbb-web` you will see similar log lines:

```
Oct 09 01:07:18 test30 java[2810929]: 2024-10-09T01:07:18.285Z DEBUG o.b.w.c.PresentationController - processing file upload eicar.com.txt (presId: f7ff3fd7c0ab460f7139541c02df46f24ac90b67-1728436037947)
Oct 09 01:07:18 test30 java[2810929]: 2024-10-09T01:07:18.550Z DEBUG o.b.w.c.PresentationController - file upload success eicar.com.txt
Oct 09 01:07:23 test30 java[2810929]: 2024-10-09T01:07:23.589Z ERROR o.b.p.DocumentConversionServiceImp - Presentation upload failed for meetingId=4814d8e60f2e15576bebfe7cef34367ef5b54539-1728435987030 presId=f7ff3fd7c0ab460f7139541c02df46f24ac90b67-1728436037947
Oct 09 01:07:23 test30 java[2810929]: 2024-10-09T01:07:23.590Z ERROR o.b.p.DocumentConversionServiceImp - Presentation upload failed because a virus was detected in the uploaded file
```

You can test your setup with one of the files from [eicar.org](https://www.eicar.org/download-anti-malware-testfile/).

### Experimental

<!-- #### LiveKit support -->

#### Infinite Whiteboard (experimental)

We have added initial support for inifinite whiteboard in the live session. Only the presenter can trigger it. It allows for annotations to be created in the margins, or to write content without being limited by space.

![the trigger for infinite whiteboard is in the middle of the presenter toolbar](/img/30/30-trigger-for-infinite-wb.png)

Everyone sees the margins and follows the presenter's point of view. If multi-user whiteboard is also enabled, viewers can roam around the canvas independently.

![with inifinite whiteboard enabled annotations can be made on the margins and more](/img/30/30-infinite-wb-in-action.png)

Recording is not yet implemented, meaning that if you enable this experimental feature on your server and use it in a recorded session, the recording will most likely have broken whiteboard at best. The recording (and playback) work is planned for after BigBlueButton 3.0.

#### Integration with LiveKit

We have added initial support for LiveKit as a media framework for BigBlueButton.
It's an experimental feature and, consequently, disabled by default.
For an in-depth overview of this initiative, please refer to [issue 21059](https://github.com/bigbluebutton/bigbluebutton/issues/21059).
Feature parity with the current media framework is not yet achieved, but the
aforementioned issue provides parity tracking in section `Annex 1`.

To enable support for LiveKit:
  - Install bbb-livekit: `$ sudo apt-get install bbb-livekit`
  - Enable the LiveKit controller module in bbb-webrtc-sfu: `$ sudo yq -i '.livekit.enabled = true' /etc/bigbluebutton/bbb-webrtc-sfu/production.yml`
  - Restart bbb-webrtc-sfu: `$ sudo systemctl restart bbb-webrtc-sfu`
  - Guarantee that Node.js 22 is installed in your server: `$ node -v`
    - Older 3.0 installations might still be using Node.js 18. If that's the case,
      re-run bbb-install or correct any custom installation scripts to ensure
      Node.js 22 is installed.

Once enabled, LiveKit still won't be used by default. There are two ways to make
use of it in meetings:
- Per meeting: set any of the following meeting `/create` parameters
  - `audioBridge=livekit`
  - `cameraBridge=livekit`
  - `screenShareBridge=livekit`
- Server-wide: set any of the following properties in `/etc/bigbluebutton/bbb-web.properties`
  - `audioBridge=livekit`
  - `cameraBridge=livekit`
  - `screenShareBridge=livekit`

Those parameters do *not* need to be set concurrently. LiveKit can be enabled for
audio only, for example, while keeping the current media framework for camera
and screen sharing by setting just `audioBridge=livekit`.

Keep in mind that the LiveKit integration is still experimental and not feature
complete. Configuration, API parameters, and other details are subject to change.
We encourage users to test it and provide feedback via our GitHub issue tracker
or the mailing lists.

### Upgraded components

Under the hood, BigBlueButton 3.0 installs on Ubuntu 22.04 64-bit, and the following key components have been upgraded
...

For full details on what is new in BigBlueButton 3.0, see the release notes.


Recent releases:

- [3.0.0-beta.4](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-beta.4)
- [3.0.0-beta.3](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-beta.3)
- [3.0.0-beta.2](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-beta.2)
- [3.0.0-beta.1](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-beta.1)
- [3.0.0-alpha.7](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-alpha.7)
- [3.0.0-alpha.6](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-alpha.6)
- [3.0.0-alpha.5](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-alpha.5)
- [3.0.0-alpha.4](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-alpha.4)
- [3.0.0-alpha.3](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-alpha.3)
- [3.0.0-alpha.2](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-alpha.2)
- [3.0.0-alpha.1](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-alpha.1)

### Other notable changes

#### Removal of Kurento

We have removed all use of Kurento Media Server. For the live media transmission we rely on mediasoup. For the recording portion we make use of our own component `bbb-webrtc-recorder`. BigBlueButton 3.0 is the first release where we do not install Kurento.

#### Select Random User feature removed and is now a plugin

The functionality Select Random User which used to be part of the BigBlueButton core was removed. A plugin with the same functionality was developed and [made public](https://github.com/bigbluebutton/plugin-pick-random-user).

#### Typed captions feature removed and is now a plugin

We removed the built-in typed captions support given that we support several options for automatic captions which seem to be much more popular.
We implemented a plugin for typed captions - [Typed captions plugin](https://github.com/bigbluebutton/plugin-typed-captions) which you could use instead.

#### Removed userStatus

The `userStatus` feature was replaced by `userReaction`. They were vastly overlapping, causing some confusion when using and maintaining.

#### Upgrade of config editing tool yq

We have upgraded `yq` from version 3.4.1 (which was no longer maintained) to 4.16.2. This is a major jump and the syntax used is quite different as well. We went through all internal uses of `yq` - packaging, bbb-install.sh, bbb-conf and others and updated the syntax. However, if you have custom scripts, you may have to rework the syntax too. Here is a [guide](https://mikefarah.gitbook.io/yq/upgrading-from-v3).

#### Improved support for various SHA algorithms for checksum calculation

In BigBlueButton 2.6.17/2.7.5/3.0.0-alpha.5 we added a new configuration property for bbb-apps-akka package under `services` called `checkSumAlgorithmForBreakouts`. By default the value is `"sha256"`. It controls the algorithm for checksum calculation for the breakout rooms join link. In case you overwrite bbb-web's `supportedChecksumAlgorithms` property removing sha256 you will need to set a supported algorithm here too. For example if you want to only use `sha512`, set `supportedChecksumAlgorithms=sha512` in `/etc/bigbluebutton/bbb-web.properties` and also set `checkSumAlgorithmForBreakouts="sha512"` in `/etc/bigbluebutton/bbb-apps-akka.conf` and then restart BigBlueButton.

#### Deprecating join parameter `defaultLayout`, replacing with `userdata-bbb_default_layout`.

In BigBlueButton 3.0.0-alpha.5 we replaced the JOIN parameter `defaultLayout` with the JOIN parameter `userdata-bbb_default_layout`. If none provided the `meetingLayout` (passed on CREATE) will be used. If none passed, and if none passed there, the `defaultMeetingLayout` from bbb-web will be used.

#### Added new setting and userdata to allow skipping echo test if session has valid input/output devices stored

- Client settings.yml: `skipEchoTestIfPreviousDevice`. Defaults to `false`
- Can be overrided on JOIN with Custom Parameter: `userdata-bbb_skip_echotest_if_previous_device=`

#### Recording event TranscriptUpdatedRecordEvent blocked

In BigBlueButton 2.7.5/3.0.0-alpha.5 we stopped propagating the events.xml event TranscriptUpdatedRecordEvent due to some issues with providing too much and too repetitive data.

#### Added new setting and userdata to allow skipping video preview if session has valid input devices stored

- Client settings.yml: `skipVideoPreviewIfPreviousDevice`. Defaults to `false`
- Can be overrided on JOIN with Custom Parameter: `userdata-bbb_skip_video_preview_if_previous_device=`

### Replaced all user facing instances of "meeting" with the word "session"

The word "session" is more generic and encompasses both educational and work contexts. Up until BigBlueButton 3.0 we were using the two keywords interchangeably. Moving forward we are preferring to use "session".

### Changes to events.xml

Retired events
- `DeskShareNotifyViewersRTMPRecordEvent`
- `DeskshareStartRtmpRecordEvent`
- `DeskshareStopRtmpRecordEvent`
- `TranscriptUpdatedRecordEvent`

Modified/added events
- `ParticipantJoinEvent` - will contain element `userdata` see https://github.com/bigbluebutton/bigbluebutton/pull/20566#pullrequestreview-2142238810
- the old user status emojis were retired. `emojiStatus` will not be filled anymore. For more information see https://github.com/bigbluebutton/bigbluebutton/pull/20717

#### bbb-web properties changes

- `allowOverrideClientSettingsOnCreateCall=false` added
- `sessionsCleanupDelayInMinutes=60` added
- `graphqlWebsocketUrl=${bigbluebutton.web.serverURL}/graphql` added

#### Removed support for POST requests on `join` endpoint and Content-Type headers are now required

In BigBlueButton 2.6.18/2.7.8 POST requests are no longer allowed for the `join` endpoint. To ensure they are validated properly, a `Content-Type` header must also be provided for POST requests that contain data in the request body. Endpoints now support a limited set of content types that includes `text/xml`, `application/xml`, `application/x-www-form-url-encoded`, and `multipart/form-data`. By default each endpoint only supports `application/x-www-form-urlencoded` and `multipart/form-data`, but individual endpoints can override this and define their own set of supported content types. The `create` endpoint supports all of the four previously listed content types while `insertDocument` supports only `text/xml` and `application/xml`. Any requests with a content type that differs from the set supported by the target endpoint will be rejected with a new `unsupportedContentType` error.

#### Changes in document formats we support

We improved the documentation for which types of files we support when uploading presentations. Support for `.odi` and `.odc` was dropped. Support for `.svg`, `.odg` and `.webp` was officially added even though animated webp's are no longer animated after the image processing. 

#### We mirror the webcam preview by default now

We have supported the option to mirror your own webcam while viewing it. Starting with BigBlueButton 3.0.0-beta.6 we mirror it by default (which leads to the same result you would expect if you looked yourself in a physical mirror).

### Development

For information on developing in BigBlueButton, see [setting up a development environment for 3.0](/development/guide).

The build scripts for packaging 3.0 (using fpm) are located in the GitHub repository [here](https://github.com/bigbluebutton/bigbluebutton/tree/v3.0.x-release/build).

### Contribution

We welcome contributors to BigBlueButton 3.0!  The best ways to contribute at the current time are:

- Help localize BigBlueButton 3.0 on [Transifex project for BBB 3.0](https://www.transifex.com/bigbluebutton/bigbluebutton-v30-html5-client/dashboard/)
- Try out [installing BigBlueButton 3.0](/administration/install) and see if you spot any issues.
- Help test a [3.0 pull request](https://github.com/bigbluebutton/bigbluebutton/pulls?q=is%3Aopen+is%3Apr+milestone%3A%22Release+3.0%22) in your development environment.
  <!-- TODO create a GitHub label for contributions-welcome and link here -->
