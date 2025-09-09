
![BigBlueButton 3.0 runs on Ubuntu 22.04](/img/30_BBB_header.png)

## Overview

BigBlueButton 3.0 offers users improved usability, increased engagement, and more performance.

- **Usability** - making common functions (such as raise hand) easier
- **Engagement** - giving the instructor more ways to engage students
- **Performance** - increasing overall performance and scalability

Here's a breakdown of what's new in 3.0.

### Usability

#### Upgraded whiteboard

We have done significant work to adopt the newly released version 2 of tl;draw. It comes with even more tools and capabilities and has allowed us to embark on more ambitious whiteboard projects, for example a prototype of an Infinite Canvas.

#### Improved UX for joining audio for transparentListenOnly

When transparentListenOnly is enabled on the server (enabled by default starting with BigBlueButton 3.0.0-rc.1), users can now switch seamlessly between Listen Only and Microphone modes without needing to rejoin audio.

To further improve the user experience, you can disable listenOnlyMode (`public.app.listenOnlyMode` in `/etc/bigbluebutton/bbb-html5.yml` or `userdata-bbb_listen_only_mode`). 
This removes the need to choose between Microphone or Listen Only mode when joining audio in a session. Instead, you are taken directly to the audio configuration screen.

![audio controls when joining audio](/img/30/30-ui-join-audio.png)

Once you are joined in audio, you can dynamically change your audio device configuration from a dropdown located on the mute-yourself button.

![mute yourself has a dropdown menu allowing device changes](/img/30/30-ui-audio-devices-options.png)

#### Chat improvements

BigBlueButton 3.0's chat gained several new functionalities! Users are now able to edit their own messages in case a typo was made, they can react to chat messages and also reply to a previous message. The option to delete a message is available both to the original author and to moderators in the session.

![delete or edit a message, add an emoji or reply to a message](/img/30/30-chat-improvements.png)

#### New layouts for specific integration scenarios

Several new layouts have been added ("Cameras Only", "Presentation Only", "Participants and Chat Only", and "Media Only") to address various use cases of hybrid education - for example splitting views of the BigBlueButton session to be visible on different physical screens.

#### Improved Away mode

We have moved the trigger to set yourself away to the three-dots menu and improved the design.

![currently active](/img/30/30-currently-active.png)

Note that when you set yourself as away, the client mutes your microphone, masks the webcam, adds an icon on your user avatar and appends a note in the public chat.

![set yourself active](/img/30/30-currently-away.png)

#### Welcome message relocated

The information previously displayed in the public chat on join is now located in its own dialog - Session details.
To view the welcome message, moderator only message, a link to the session or a phone number for dial-in please click on the meeting name.
By default this dialog is open on initial joining of the client.

![moderator view of the session details](/img/30/30-welcome-message-full.png)

Viewers do not see the link to invite others nor the moderator only message.

![viewers see a bit less of the session details](/img/30/30-welcome-message.png)

#### Leave meeting button

A contribution from community member Jan Kessler, the direct Leave Meeting button was first introduced in BigBlueButton 2.7.5. Starting with BigBlueButton 3.0 we are making it enabled by default and have modified it slightly to ensure moderators are not ending the session when they try to leave.

![leave the meeting red button](/img/30/30-leave-meeting.png)

Viewers can leave the meeting by using this new red button, previously hidden near the Setting menu. For moderators, the button includes the option to end the meeting as well. 

#### Better looking polling results

We have enhanced the view of the polling results that appear over the whiteboard. It is now much more intuitive to read.

![better polling results](/img/30/30-poll-annotation.png)

It matches the results displayed in the public chat!

![better polling results](/img/30/30-poll-chat.png)


#### Private chat messages have a "seen" indicator

We have added an indicator showing when your private chat recipient has seen the message. To enable, see `public.chat.privateMessageReadFeedback.enabled` https://github.com/bigbluebutton/bigbluebutton/blob/v3.0.8/bigbluebutton-html5/private/config/settings.yml#L774

![checkmark beside the message indicating it was seen](/img/30/30-seen-message.png)

#### Push to talk was added

You can now use the "M" shortcut while in a conference to control how long your microphone is open. If the option for push to talk is enabled in settings.yml holding "M" will keep your microphone unmuted for as long you hold the key down. Releasing it will mute you again.
To enable see `public.app.defaultSettings.application.pushToTalkEnabled` https://github.com/bigbluebutton/bigbluebutton/blob/v3.0.8/bigbluebutton-html5/private/config/settings.yml#L206

### Engagement

<!-- ####  -->

<!-- ### Analytics -->


### Behind the scenes

#### Introduction of plugins

We have made significant changes to the architecture of BigBlueButton and have introduced support to plugins -- optional custom modules included in the client which allow expanding the capabilities of BigBlueButton. A data channel is provided to allow for data exchange between clients. See the [HTML5 Plugin SDK](https://github.com/bigbluebutton/bigbluebutton-html-plugin-sdk) for examples and more information.

At the moment of writing this documentation, the official list of plugins includes: 
- [Select Random User](https://github.com/bigbluebutton/plugin-pick-random-user)
- [Share a link](https://github.com/bigbluebutton/plugin-generic-link-share)
- [H5P plugin for BigBlueButton](https://github.com/bigbluebutton/plugin-h5p)
- [Session share](https://github.com/bigbluebutton/plugin-session-share)
- [Decrease the volume of external video when someone speaks](https://github.com/bigbluebutton/plugin-decrease-volume-on-speak)
- [Typed captions](https://github.com/bigbluebutton/plugin-typed-captions)
- [Source code highlight](https://github.com/bigbluebutton/plugin-code-highlight)
- [Tour](https://github.com/bigbluebutton/plugin-tour)
- [Chat mention](https://github.com/bigbluebutton/plugin-chat-mention)
- [Media popout](https://github.com/bigbluebutton/plugin-media-popout)

For the most accurate information check the [plugins reporisory](https://github.com/bigbluebutton/plugins) where all the plugins are listed.

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

#### S3-based cache for presentation assets

BigBlueButton now supports caching for presentation assets at Amazon S3/Minio or similar.
For details check the [server customization](/administration/customize/#configure-s3-based-cache-for-presentation-assets) portion of the documents and see the new `/create` parameter to control it per meeting in the [API reference](/development/api/#get-post-create).


#### Support for ClamAV as presentation file scanner

BigBlueButton now supports file scanning (virus detection) for presentation files using ClamAV.
For details check the [ClamAV section](/administration/customize#support-for-clamav-as-presentation-file-scanner) of the server customization documentation.

### Experimental

#### Infinite Whiteboard (experimental)

We have added initial support for infinite whiteboard in the live session. Only the presenter can trigger it. It allows for annotations to be created in the margins, or to write content without being limited by space.

![the trigger for infinite whiteboard is in the middle of the presenter toolbar](/img/30/30-trigger-for-infinite-wb.png)

Everyone sees the margins and follows the presenter's point of view. If multi-user whiteboard is also enabled, viewers can roam around the canvas independently.

![with infinite whiteboard enabled annotations can be made on the margins and more](/img/30/30-infinite-wb-in-action.png)

You can enable infinite whiteboard via `public.whiteboard.allowInfiniteWhiteboard` https://github.com/bigbluebutton/bigbluebutton/blob/v3.0.8/bigbluebutton-html5/private/config/settings.yml#L1047

Recording is not yet implemented, meaning that if you enable this experimental feature on your server and use it in a recorded session, the recording will most likely have broken whiteboard at best. The recording (and playback) work is planned for after BigBlueButton 3.0.

#### Integration with LiveKit

We have added initial support for LiveKit as a media framework for BigBlueButton.
It's an experimental feature and, consequently, disabled by default.
For an in-depth overview of this initiative, please refer to [issue 21059](https://github.com/bigbluebutton/bigbluebutton/issues/21059).
Feature parity with the current media framework is not yet achieved, but the
aforementioned issue provides parity tracking in section `Annex 1`.

To enable support for LiveKit:
1. Install bbb-livekit: `$ sudo apt-get install bbb-livekit`
2. Enable the LiveKit controller module in bbb-webrtc-sfu: `$ sudo yq e -i '.livekit.enabled = true' /etc/bigbluebutton/bbb-webrtc-sfu/production.yml`
3. Restart bbb-webrtc-sfu: `$ sudo systemctl restart bbb-webrtc-sfu`
4. Guarantee that Node.js 22 is installed in your server: `$ node -v`
    * Older 3.0 installations might still be using Node.js 18. If that's the case,
      re-run bbb-install or correct any custom installation scripts to ensure
      Node.js 22 is installed.
5. Only when using BigBlueButton via the [cluster proxy](/administration/cluster-proxy) configuration:
    1. Set the appropriate LiveKit endpoint URL in bbb-html5.yml's `public.media.livekit.url`. See
      the aforementioned [docs section](/administration/cluster-proxy.md#bigbluebutton-servers) for details.

We also *strongly recommend* setting up network interface filtering in LiveKit.
While optional, this speeds up negotation times and works around an issue with the latest
LiveKit versions that might cause CPU spikes if there's no filtering in place.
To set up network interface filtering:
1. Gather relevant network interfaces names to be used for media communication.
For most setups, the default network interface is enough. See the `route` command
to find it (`Destination: default`). If any other network interfaces are needed,
make note of them.
2. Set the following in `/etc/bigbluebutton/livekit.yaml`:
```yaml
rtc:
  interfaces:
    includes:
      - <network_interface_name_1>
      - <any_other_network_interface_name>
```
3. Restart livekit-server: `$ sudo systemctl restart livekit-server`

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

As of BigBlueButton v3.0.7, recording is enabled by default for LiveKit sessions
via the bbb-webrtc-recorder application. If `livekit/egress` was previously
installed in a server, any steps done to enable it should be reverted. Refer to
the [previous installations steps](https://github.com/bigbluebutton/bigbluebutton/blob/6eab874ffa8d0e82453dad3b06621dea16e15e6d/docs/docs/new-features.md?plain=1#L209-L237).

Keep in mind that the LiveKit integration is still experimental and not feature
complete. Configuration, API parameters, and other details are subject to change.
We encourage users to test it and provide feedback via our GitHub issue tracker
or the mailing lists.

### Upgraded components

Under the hood, BigBlueButton 3.0 installs on Ubuntu 22.04 64-bit, and the following key components have been upgraded
...

For full details on what is new in BigBlueButton 3.0, see the release notes.


Recent releases:

- [3.0.14](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.14)
- [3.0.13](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.13)
- [3.0.12](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.12)
- [3.0.11](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.11)
- [3.0.10](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.10)
- [3.0.9](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.9)
- [3.0.8](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.8)
- [3.0.7](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.7)
- [3.0.6](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.6)
- [3.0.5](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.5)
- [3.0.4](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.4)
- [3.0.3](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.3)
- [3.0.2](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.2)
- [3.0.1](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.1)
- [3.0.0](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0)
- [3.0.0-rc.4](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-rc.4)
- [3.0.0-rc.3](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-rc.3)
- [3.0.0-rc.2](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-rc.2)
- [3.0.0-rc.1](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-rc.1)
- [3.0.0-beta.7](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-beta.7)
- [3.0.0-beta.6](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-beta.6)
- [3.0.0-beta.5](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.0.0-beta.5)
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

#### Changes to User Muting Actions

- The **"Mute all except presenter"** button now only mutes all current users except the presenter, as the label suggests. It no longer affects the mute state of incoming users.
- A new button, **"Enable Users Join Muted" / "Disable Users Join Muted"**, has been added to manage whether new users join muted.
- The **"Mute all users"** button has been removed, as muting all users (except the presenter) is covered by the existing functionality, and the presenter can be muted individually if needed.

#### Upgrade of config editing tool yq

We have upgraded `yq` from version 3.4.1 (which was no longer maintained) to 4.16.2. This is a major jump and the syntax used is quite different as well. We went through all internal uses of `yq` - packaging, bbb-install.sh, bbb-conf and others and updated the syntax. However, if you have custom scripts, you may have to rework the syntax too. Here is a [guide](https://mikefarah.gitbook.io/yq/upgrading-from-v3).

#### Improved support for various SHA algorithms for checksum calculation

In BigBlueButton 2.6.17/2.7.5/3.0.0-alpha.5 we added a new configuration property for bbb-apps-akka package under `services` called `checkSumAlgorithmForBreakouts`. By default the value is `"sha256"`. It controls the algorithm for checksum calculation for the breakout rooms join link. In case you overwrite bbb-web's `supportedChecksumAlgorithms` property removing sha256 you will need to set a supported algorithm here too. For example if you want to only use `sha512`, set `supportedChecksumAlgorithms=sha512` in `/etc/bigbluebutton/bbb-web.properties` and also set `checkSumAlgorithmForBreakouts="sha512"` in `/etc/bigbluebutton/bbb-apps-akka.conf` and then restart BigBlueButton.

#### Deprecating join parameter `defaultLayout`, replacing with `userdata-bbb_default_layout`.

In BigBlueButton 3.0.0-alpha.5 we replaced the JOIN parameter `defaultLayout` with the JOIN parameter `userdata-bbb_default_layout`. If none provided the `meetingLayout` (passed on CREATE) will be used. If none passed, and if none passed there, the `defaultMeetingLayout` from bbb-web will be used.

#### Added new setting and userdata to allow skipping echo test if session has valid input/output devices stored

- Client settings.yml: `skipEchoTestIfPreviousDevice`. Defaults to `false`
- Can be overridden on JOIN with Custom Parameter: `userdata-bbb_skip_echotest_if_previous_device=`

#### Recording event TranscriptUpdatedRecordEvent blocked

In BigBlueButton 2.7.5/3.0.0-alpha.5 we stopped propagating the events.xml event TranscriptUpdatedRecordEvent due to some issues with providing too much and too repetitive data.

#### Added new setting and userdata to allow skipping video preview if session has valid input devices stored

- Client settings.yml: `skipVideoPreviewIfPreviousDevice`. Defaults to `false`
- Can be overridden on JOIN with Custom Parameter: `userdata-bbb_skip_video_preview_if_previous_device=`

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
- `SetScreenshareAsContentEvent` - Contains the `screenshareAsContent` field, a boolean that indicates whether the screenshare is in focus. For more information see https://github.com/bigbluebutton/bigbluebutton/pull/22312

#### bbb-web properties changes

Removed
- `breakoutRoomsEnabled` removed (was previously deprecated)
- `learningDashboardEnabled` removed (was previously deprecated)
- `defaultGuestWaitURL` removed (now handled on the same page as the client)

Value changed
- `defaultHTML5ClientUrl` changed -- dropped the `/join` ending
- `muteOnStart` default value changed to `true` - which helps now that `transparentListenOnly` is enabled by default too. See [PR 20848](https://github.com/bigbluebutton/bigbluebutton/issues/20848) for more info.

Added
- `pluginManifestFetchTimeout` added
- `pluginManifestsFetchUrlResponseTimeout` added
- `maxPluginManifestsFetchUrlPayloadSize` added
- `numPluginManifestsFetchingThreads` added
- `extractTimeoutInMs` added
- `pngCreationExecTimeoutInMs` added
- `thumbnailCreationExecTimeoutInMs` added
- `pdfPageDownscaleExecTimeoutInMs` added
- `officeDocumentValidationExecTimeoutInMs` added
- `textFileCreationExecTimeoutInMs` added
- `presDownloadReadTimeoutInMs` added
- `pngCreationConversionTimeout` added
- `imageResizeWait` added
- `officeDocumentValidationTimeout` added
- `presOfficeConversionTimeout` added
- `pdfPageCountWait` added
- `presentationConversionCacheEnabled` added
- `presentationConversionCacheS3AccessKeyId` added
- `presentationConversionCacheS3AccessKeySecret` added
- `presentationConversionCacheS3BucketName` added
- `presentationConversionCacheS3Region` added
- `presentationConversionCacheS3EndpointURL` added
- `presentationConversionCacheS3PathStyle` added
- `cameraBridge` added
- `screenShareBridge` added
- `audioBridge` added
- `pluginManifests` added
- `scanUploadedPresentationFiles` added
- `allowOverrideClientSettingsOnCreateCall` added
- `defaultBotAvatarURL` added
- `graphqlApiUrl` added
- `graphqlWebsocketUrl` added
- `sessionsCleanupDelayInMinutes` added
- `useDefaultDarkLogo` added
- `defaultDarkLogoURL` added
- `maxNumPages` added

#### Removed support for POST requests on `join` endpoint and Content-Type headers are now required

In BigBlueButton 2.6.18/2.7.8 POST requests are no longer allowed for the `join` endpoint. To ensure they are validated properly, a `Content-Type` header must also be provided for POST requests that contain data in the request body. Endpoints now support a limited set of content types that includes `text/xml`, `application/xml`, `application/x-www-form-url-encoded`, and `multipart/form-data`. By default each endpoint only supports `application/x-www-form-urlencoded` and `multipart/form-data`, but individual endpoints can override this and define their own set of supported content types. The `create` endpoint supports all of the four previously listed content types while `insertDocument` supports only `text/xml` and `application/xml`. Any requests with a content type that differs from the set supported by the target endpoint will be rejected with a new `unsupportedContentType` error.

#### Changes in document formats we support

We improved the documentation for which types of files we support when uploading presentations. Support for `.odi` and `.odc` was dropped. Support for `.svg`, `.odg` and `.webp` was officially added even though animated webp's are no longer animated after the image processing. 

#### We mirror the webcam preview by default now

We have supported the option to mirror your own webcam while viewing it. Starting with BigBlueButton 3.0.0-beta.6 we mirror it by default (which leads to the same result you would expect if you looked yourself in a physical mirror).

#### Feedback form removed

We have removed the feedback form that used to be part of the client. It was relying on client logs to carry the information and was not particularly flexible. See https://github.com/bigbluebutton/bigbluebutton/pull/22111 for more information.
A new repository was contributed by Mconf https://github.com/bigbluebutton/custom-feedback with a much more sophisticated feedback form (see below).

#### Custom feedback

In BigBlueButton 3.0 we replaced the old feedback form with a new way of collecting feedback from users. It's a standalone, customizable, extensible application that can be integrated into BigBlueButton. Please refer to its [README](https://github.com/bigbluebutton/custom-feedback/blob/master/README.md) for details on how to customize and install it.

Below are some screenshots of it:

![first screen of the default custom feedback experience](/img/30/30-custom-feedback-1.png)

![second screen of the default custom feedback experience](/img/30/30-custom-feedback-2.png)

![third screen of the default custom feedback experience](/img/30/30-custom-feedback-3.png)

![fourth screen of the default custom feedback experience](/img/30/30-custom-feedback-4.png)

![fifth screen of the default custom feedback experience](/img/30/30-custom-feedback-5.png)

### Development

For information on developing in BigBlueButton, see [setting up a development environment for 3.0](/development/guide).

The build scripts for packaging 3.0 (using fpm) are located in the GitHub repository [here](https://github.com/bigbluebutton/bigbluebutton/tree/v3.0.x-release/build).

### Contribution

We welcome contributors to BigBlueButton 3.0!  The best ways to contribute at the current time are:

- Help localize BigBlueButton 3.0 on [Transifex project for BBB 3.0](https://www.transifex.com/bigbluebutton/bigbluebutton-v30-html5-client/dashboard/)
- Try out [installing BigBlueButton 3.0](/administration/install) and see if you spot any issues.
- Help test a [3.0 pull request](https://github.com/bigbluebutton/bigbluebutton/pulls?q=is%3Aopen+is%3Apr+milestone%3A%22Release+3.0%22) in your development environment.
  <!-- TODO create a GitHub label for contributions-welcome and link here -->
