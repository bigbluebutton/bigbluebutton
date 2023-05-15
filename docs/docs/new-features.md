
![BigBlueButton 2.6 runs on Ubuntu 20.04](/img/26_BBB_header.png)

## Overview

This document gives you an overview of BigBlueButton 2.6.

BigBlueButton 2.6 offers users improved usability, increased engagement, and more performance.

- **Usability** - making common functions (such as raise hand) easier
- **Engagement** - giving the instructor more ways to engage students
- **Performance** - increasing overall performance and scalability

Here's a breakdown of what's new in 2.6.

### Usability

#### Dark theme

BigBlueButton supports dark theme. To enable it just navigate to the Settings.

![The toggle for dark theme is located in the main settings panel](/img/26-dark-theme-setting.png)

![Dark theme in action - typically pale elements like the participants list are displayed in dark palette](/img/26-dark-theme-in-action.png)

#### Improved Echo Test dialog
The echo test modal has added a new audio stream volume indicator in place of the
separate confirmation screen. This reduced the number of views and interactions required for audio confirmation.
![Updated echo test modal with added ](/img/26-echo-test.png)

#### Improved notification of recording start

The indicator for whether the recording is on has been made bigger. Additionally, if you create your meeting with an optional parameter `notifyRecordingIsOn=true`, you users will see the following dialog when the recording commenses and also when joining a session that is already actively being recorded. You can choose to either continue or leave the session.

![A big red square used as a recording indicator, used to be more subtle](/img/26-recording-indicator.png)

![A blocking dialog shows up if the session is being recorded](/img/26-recording-popup.png)

#### Allow pinning of more than one webcam

The pinning feature prevents the webcams from being rotated out when audio floor switching is activated.
This functionality is specially important for document and/or interpreter cameras. It has also been improved
to support miltiple pinned cameras.

![Animation selecting webcam dropdown menu and pin option item](/img/26-cam-pin.gif)

#### Upload your own webcam background

This new feature allows a user to upload virtual background image's for their webcam. The user can upload
and delete images at will.

![Animation of user uploading webcam custom background image](/img/26-bg-upload.gif)

#### Set webcam image brightness

Allows the ability to adjust the brightness levels of their webcam (or) webcam and background image.

This is done via the webcam settings modal using the brightness slider at the bottom.

![Animation of webcam brightness slider interaction](/img/26-webcam-brightness.gif)

#### Improved layouts manager selection

Layout selection can now be done via the updated layout selection modal located in the actions (+) button.

![Animation selecting actions button and layout selection item](/img/26layout-selection.gif)

#### Live Automatic Closed Captions

Note: The automatic transcription is only available for browsers that support SpeechRecognition (Google Chrome, MS Edge and Safari). So those who join a meeting using other browsers will see a warning in the audio modal.

![audio modal with speech recognition error](/img/26-no-voice-rec.png)

By default, automatic transcription language selector is disabled. This can be changed in the settings file.  Users who want to have their voices transcribed must enable it by selecting the desired language from the drop-down selector in the join audio dialog.

![audio modal with automatic transcription dropdown](/img/26-auto-transcription.png)

When the user selects a language for automatic transcription, BigBlueButton will display a CC icon next to their name in the "who is talking" indicator.

![Talking indicator with closed caption icon](/img/26-cc-talking-indicator.png)

When one or more users have enabled transcription, BigBlueButton will display a 'CC' button to display the transcriptions. You don't need to have selected transcription of your audio to view the transcriptions for others.

To view the transcriptions for those with 'CC' in their "who is talking" icon, select the CC button.

The placement of the 'CC' button depends on your device.  For desktop, the 'CC' button is in the bottom left.


![closed captions button on action bar](/img/26-cc-desktop-btn.png)

For mobile devices, The 'CC' button is in the three dots in the top right corner.

![closed captions button on mobile in app options menu](/img/26-cc-mobile-btn.png)

To enable the option for automatic translations for users of Google Chrome, Microsoft Edge, and Safari, edit the `/etc/bigbluebutton/bbb-html5.yml` and add the following to the `public:` section and restart BigBlueButton.

```
public:
  app:
    audioCaptions:
      enabled: true
```

#### Downloading presentation with whiteboard annotations included

Teachers can now export their slide decks with the annotations added during a lesson.
Selecting "Send to chat" in the presentation upload modal sends a link in the public chat from which meeting participants can download the file.

![BigBlueButton's upload modal with a button to export the presentation with annotations](/img/26-send-to-chat.png)

#### Upload a presentation straight from NextCloud

Two new create parameters: presentationUploadExternalDescription and presentationUploadExternalUrl have been introduced.

The client supports these parameters, displaying a message in the presentation upload modal when both values are set at meeting creation.

![Upload presentation modal with next cloud message](/img/26-next-cloud.png)

#### Easier moving of users between breakout rooms

There is a new option for the breakout room controls called Manage users.

![Manage users](/img/26-manage-users.png)

This dialog lets you drag-and-drop users between different breakout rooms.

![Move users dialog](/img/26-move-user.gif)

When you click Apply, BigBlueButton well send prompts to each user to move them to the target breakout room.

![Move users prompt](/img/26-move-prompt.png)

When you click Apply, BigBlueButton will send prompts to each user to move them to the target breakout room.



#### Recording in Video format

This release introduces a new recording format that creates a single video file from audio, video, screen share, presentation, and whiteboard marks recorded during the session.  The file format is webm (vp9 video), although configuration options is available to create an mp4 (h264 video) file instead.

Learn more about [how to enable generating MP4 (h264 video) output](https://docs.bigbluebutton.org/administration/customize#enable-generating-mp4-h264-video-output)

### Engagement

#### Fully reimplemented whiteboard (tl;draw)

The whiteboard has been updated with TLdraw, a small application which supports improved drawing features.

For more details see <https://github.com/tldraw/tldraw>.

![BigBlueButton whiteboard using tldraw](/img/26-tldraw.png)

#### Exporting Shared notes to the whiteboard

Instructors can move the shared notes to the whiteboard presentation area for further collaborative work among students.

![BigBlueButton's whiteboard with annotations, with imported shared notes as the presentation](/img/26-shared-notes-import.png)

#### Exporting breakout rooms' shared notes as a presentation to the main room

#### Exporting breakout rooms' whiteboard annotations to the main room

#### Easier setup of polling

Polling has been updated to allow for polls when prepared in advance using the custom input option.

![Animation of user opening poll panel and toggle custom input](/img/26-custom-poll.gif)

### Analytics


### Performance

#### Recording API improvements

Allows for quicker, more efficient search and retrieval of recording data.

### Experimental


### Upgraded components

Under the hood, BigBlueButton 2.6 installs on Ubuntu 20.04 64-bit, and the following key components have been upgraded
- Meteor 2.12
- Grails 5.2.4
- Spring 2.7.1

For full details on what is new in BigBlueButton 2.6, see the release notes. Recent releases:

- [2.6.7](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.7)
- [2.6.6](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.6)
- [2.6.5](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.5)
- [2.6.4](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.4)
- [2.6.3](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.3)
- [2.6.2](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.2)
- [2.6.1](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.1)
- [2.6.0](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.0)
- [rc.9](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.0-rc.9)
- [rc.8](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.0-rc.8)
- [rc.7](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.0-rc.7)
- [rc.6](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.0-rc.6)
- [rc.5](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.0-rc.5)
- [rc.4](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.0-rc.4)
- [rc.3](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.0-rc.3)
- [rc.2](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.0-rc.2)
- [rc.1](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.0-rc.1)
- [beta.7](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.0-beta.7)
- [beta.6](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.0-beta.6)
- [beta.5](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.0-beta.5)
- [beta.4](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.0-beta.4)
- [beta.3](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.0-beta.3)
- [beta.2](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.0-beta.2)
- [beta.1](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.0-beta.1)
- [alpha.4](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.0-alpha.4)
- [alpha.3](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.0-alpha.3)
- [alpha.2](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.0-alpha.2)
- [alpha.1](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v2.6.0-alpha.1)

### Other notable changes

#### We have retired the `bbb-demo` API Demos development only package

We recommend using API MATE or Greenlight - see the [development setup section](/development/guide) for more information.

#### bbb-install-2.6.sh installs a local TURN server and shares port 443 by default

If you are using bbb-install to configure your servers, be aware that in BigBlueButton 2.6's version of bbb-install by default we install a local TURN server. For more information: https://github.com/bigbluebutton/bbb-install/pull/579 and https://docs.bigbluebutton.org/administration/turn-server

#### Change of parameters naming

In 2.5 we had the hidePresentation which was responsible for disabling presentation Area, and it was configured in the join call. Now we have a new disabled feature which is responsible for that. it is called `disabledFeatures=presentation`, and it is configured in the create call, for more details see the [docs](https://docs.bigbluebutton.org/2.6/development/api#create).

There is another parameter renamed in 2.6, it is `swapLayout`, or `userdata-bbb_auto_swap_layout` in the join call. Now, this parameter is set to `hidePresentationOnJoin` or `userdata-bbb_hide_presentation_on_join` in the join call, and it does essentially the same thing: it starts meeting with presentation minimized. And lastly, we've got another way to configure it: which is to set `public.layout.hidePresentationOnJoin: true` in the override settings file: `/etc/bigbluebutton/bbb-html5.yml`

In brief:

- 2.5 **JOIN** `hidePresentation` -> 2.6 **CREATE** `disabledFeatures=presentation` (permanent disabling of presentation area for all users)
- 2.5 **JOIN** `swapLayout` -> 2.6 **JOIN** `hidePresentation` (join a meeting with presentation area hidden, not permanently)

#### Change of location for default presentation

We used to keep the default presentation (`default.pdf` on a stock installation) in `/var/www/bigbluebutton-default/`.
In BigBlueButton 2.6 we added a directory `assets` so now the full path is `/var/www/bigbluebutton-default/assets/default.pdf`.
In case you are overriding the file/filename, please pass `beans.presentationService.defaultUploadedPresentation=${bigbluebutton.web.serverURL}/assets/file.pdf` in `/etc/bigbluebutton/bbb-web.properties`


### Development

For information on developing in BigBlueButton, see [setting up a development environment for 2.6](/development/guide).

The build scripts for packaging 2.6 (using fpm) are located in the GitHub repository [here](https://github.com/bigbluebutton/bigbluebutton/tree/v2.6.x-release/build).

### Contribution

We welcome contributors to BigBlueButton 2.6!  The best ways to contribute at the current time are:

- Help localize BigBlueButton 2.6 on [Transifex project for BBB 2.6](https://www.transifex.com/bigbluebutton/bigbluebutton-v26-html5-client/dashboard/)

- Try out [installing BigBlueButton 2.6](/administration/install) and see if you spot any issues.
- Help test a [2.6 pull request](https://github.com/bigbluebutton/bigbluebutton/pulls?q=is%3Aopen+is%3Apr+milestone%3A%22Release+2.6%22) in your development environment.
  <!-- TODO create a GitHub label for contributions-welcome and link here -->
