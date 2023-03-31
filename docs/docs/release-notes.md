---
id: release-notes
slug: /release-notes
description: BigBlueButton release notes
sidebar_position: 4
keywords:
 - Release notes
 - Versions
---

## Latest release notes

Starting with BigBlueButton 2.2.1 we publish our Release Notes in [GitHub's BigBlueButton page](https://github.com/bigbluebutton/bigbluebutton/releases)

## Release 2.2

Released: November 6, 2019 ([Installation Instructions](/administration/install))

We made it!

After months of testing with the community, millions of sessions hosted by commercial companies using BigBlueButton, and interacting with hundreds of people on our mailing lists that help us find and fix any issues, we are announcing the releae of BigBlueButton 2.2.

Enjoy!

## Release 2.2-beta

Released: March 19, 2019 ([Installation Instructions](/administration/install))

This release completes the development of the new HTML5 client.  BigBlueButton 2.2 supports real-time sharing of audio/video/screen using the browser's (recommend FireFox and Chrome) built-in web real-time communication (WebRTC) libraries.

This means there is no Flash, no Java, no downloads, no app to install.  Compared with the previous version, the new BigBlueButton 2.2 client is a third in download size and launches twice as fast.  It also runs on iPhones and iPads (iOS 12.2+) and Android devices (6.0+).  Both Safari Mobile (iOS) and Google Chrome (Android) support WebRTC out-of-the-box (no mobile app to install).

Major features in this release include:

* **Platform** - A new HTML5 that is a third in download size, launches twice as fast, and is easier to use.

* **Features** - The HTML5 client imaplements all the core features you would expect in a commercial web conferencing system -- real-time sharing of audio, video, slides, and screen -- with tools to engage your remote users: public/private chat, emojis, shared notes, multi-user whiteboard, polling, and breakout rooms.

* **Increased engagement** - The presenter can now share YouTube videos live in the session.

This release is under active development: see [BigBlueButton 2.2 Project Board](https://github.com/bigbluebutton/bigbluebutton/projects/administration/install).

## Release 2.0

Released: March 28, 2019 ([Installation Instructions](/administration/install))

Major features in this release include:

* **UI Improvements** - Multiple UI improvements that include enable users to choose a breakout room, restrict viewers to only seeing the moderator's webcams, enabling download of presentation, and smoothing of whiteboard strokes.

* **Multi-user Whiteboard** - The presenter can now let all users write on the whitebaord at the same time.

* **Shared Notes** - Added a new layout that enables all users to collaborate together on shared notes.

* **HTML5 mobile client** - Users on Android and iOS 11+ devices can participate in online sessions.  The HTML5 client enables two-way sharing of audio, chat, viewing presentation, responding to polls, sharing emoji, and viewing WebRTC screen sharing.

There were a lot of smaller updates to improve existing features and fix issues.  See [detailed list of new features and issues fixed in BigBlueButton 2.0](https://github.com/bigbluebutton/bigbluebutton/issues?utf8=%E2%9C%93&q=milestone%3A%22Release+2.0%22+is%3Aclosed+).

## Release 1.1

Released: May 24, 2017 ([Installation Instructions](/administration/install))

Major features in this release include:

* **Breakout Rooms** - Instructors can now group students into breakout rooms for increased collaboration.  Instructors can monitor activity in the breakout rooms set a time limit for collaboration (see [video](https://www.youtube.com/watch?v=q5N-lcocJss)).

* **Closed Captioning** - BigBlueButton now enables a stenographer to provide live closed captions in multiple languages during a session.  After the session finishes, the captions will appear as subtitles in the recording (see [video](https://www.youtube.com/watch?v=vDpurrMgal0)).

* **Faster Screen Sharing** - Screen sharing now is faster, works across all browsers (using a Java application that launches outside the browser), and captures the cursor (see [video](https://www.youtube.com/watch?v=xTFuEvmEqB0)).

* **Greenlight** - Administrators can install a new front-end, called Greenlight, that makes it easy for users to quickly creating meetings, invite others, and manage recordings on a BigBlueButton server.  Using Docker, administrators can [install](/greenlight/v3/install) on the BigBlueButton server itself (no need for a separate server).  Greenlight is written in Rails 5 and can be easily customized by any rails developer (see [source on GitHub](https://github.com/bigbluebutton/greenlight)).

* **Ubuntu 16.04 packages** - This release installs on Ubuntu 16.04 64-bit (the most recent long-term support release from Canonical) and uses `systemd` for new start/stop scripts for individual components.

For more information on this release see [detailed list of new features and issues fixed in BigBlueButton 1.1](https://github.com/bigbluebutton/bigbluebutton/issues?q=milestone%3A%22Release+1.1.0%22+is%3Aclosed).

## Release 1.0

Released: May 15, 2016 ([Installation Instructions](/administration/install))

This release focused on increasing the interactivity between instructors and students.

### Major Features

* **Polling** - Presenters can now poll students for immediate feedback.  The BigBlueButton client includes a feature that can automatically suggest the proper polling choices based on the content of the slide (we call this _Smart Polling_).

* **Improved video dock** - The video dock now shows the webcams without boarders to give more visibility.

* **Emoji** - Students can now use emoji icons (happy, neutral, sad, confused, and away) to give feedback in addition current raise hand.

* **Puffin Browser support** - BigBlueButton detects [Puffin Browser](https://www.puffinbrowser.com) version 4.6 (or later) and enables the user to broadcast their microphone and/or webcam in a BigBlueButton session on a mobile device.

* **Automatic Reconnect** - BigBlueButton detects when the network connection has dropped and will attempt to automatically reconnect.

For details of these updates see [issues fixed in BigBlueButton 1.0](https://github.com/bigbluebutton/bigbluebutton/issues?q=milestone%3A%22Release+1.0.0%22+is%3Aclosed).

## Release 0.9.1

Released: June 29, 2015

This was a maintenance release to 0.9 to fix issue [2701](https://github.com/bigbluebutton/bigbluebutton/issues/2701)
with FireFox and Desktop Sharing.

## Release 0.9.0

Released: April 30, 2015 ([Installation Instructions](/administration/install))

This release of BigBlueButton 0.9.0 represents a significant upgrade on the ability to deliver remote students a high-quality on-line learning experience.

### Major Features

* **WebRTC Audio** - BigBlueButton now uses web real-time communications (WebRTC) audio for users of FireFox and Chrome.  WebRTC audio is sampled at 48 Khz, encoded in [OPUS](http://www.opus-codec.org/) codec, uses UDP for transport, and communicates directly with [FreeSWITCH](http://freeswitch.org/) on the BigBlueButton server –- all this combines to give users high quality, low latency audio.

* **Audio Check** - To ensure users have a functioning microphone when joining a session, BigBlueButton now provides a microphone check for users _before_ they join the session.

* **Listen Only Audio** - To quickly join the conference as a listener  only (no microphone check), BigBlueButton offers a Listen Only mode.  Under the hood, Listen Only users share a single, one-way audio channel from FreeSWITCH, which means they require less overall CPU resources on the BigBlueButton server compared with users joining with a microphone.  The Listen Only mode brings BigBlueButton closer to supporting webinar-type sessions.

* **Start/Stop Button for Recording** - Moderators can now mark segments of the recorded session for later publishing using a new Start/Stop Recording button in the toolbar.  After the session is over, the BigBlueButton server extracts the marked segments for publishing the recording.

* **Ubuntu 14.04 64-bit** - BigBlueButton now installs on Ubuntu 14.04 64-bit.

For details of the new features (with screen shots) see [0.9.0 overview](https://github.com/bigbluebutton/bigbluebutton/issues?q=milestone%3A%22Release+0.9.0%22+is%3Aclosed).

### Fixed Issues

See [issues fixed in BigBlueButton 0.9.0](https://code.google.com/p/bigbluebutton/issues/list?can=1&q=milestone=Release0.9.0%20status=Fixed&colspec=ID%20Type%20Status%20Priority%20Milestone%20Owner%20Component%20Summary).

## Release 0.81

Released: November 7, 2013

This is our eleventh release of BigBlueButton.  For a quick summary of what's new since the previous release, see this [overview video](http://youtu.be/4C-rOd8bi6s).

### Major Features

* **Usability Improvements** - BigBlueButton now has a consolidated Users window for easier session management and a more consistent user interface (including updated skin and icons) to help new users get started quickly.  For a closer look, see [moderator/presenter tutorial](http://youtu.be/PHTZvbL1NT4) and for [viewer tutorial](http://www.youtube.com/watch?v=LS2lttmPi6A).

* **Recording** - BigBlueButton now records all activity in the session (audio, video, presentation, chat, and desktop sharing) for playback.  Playback of recording is supported in Chrome and FireFox.

* **Layout Manager** - BigBlueButton now enables users to choose from a number of preset layouts to quickly adapt to different modes of learning.

* **Text tool for whiteboard** - Presenters can now annotate their slides with text.

* **New APIs** - The BigBlueButton API now includes the ability to dynamically configure each client on a per-user bases, thus enabling developers to configure the skin, layout, modules, etc. for each user.  There is also a JavaScript interface to control the client.

* **Accessiblity for screen readers** - BigBlueButton adds accessibility by supporting screen readers such as JAWS (version 11+) and NVDA. A list of keyboard shortcuts have been added to make it easier to navigate through the interface using the keyboard.

* **LTI Support** - BigBlueButton is IMS Learning Tools Interoperability (LTI) 1.0 compliant. This means any LTI consumer can integrate with BigBlueButton without requiring custom plug-ins (see [BigBlueButton LTI certification](http://www.imsglobal.org/cc/detail.cfm?ID=172) and [video](http://www.youtube.com/watch?v=OSTGfvICYX4)).

* **Mozilla Persona** - The API demos now demonstrate how to sign into a BigBlueButton session using Mozilla Persona.

* **Support for LibreOffice 4.0** - BigBlueButton now uses LibreOffice 4.0 for conversion of of MS Office documents (upload of PDF is still recommend to provide best results).

* **Updated components** -  We've updated BigBlueButton packaging to use red5 1.0.2,  FreeSWITCH (1.5.x), and grails 1.3.6.

### Fixed Issues

See [issues fixed in BigBlueButton 0.81](https://code.google.com/p/bigbluebutton/issues/list?can=1&q=milestone=Release0.81%20status=Fixed&colspec=ID%20Type%20Status%20Priority%20Milestone%20Owner%20Component%20Summary).

## Release 0.8: Bailetti

_Code named in honor of [Tony Bailetti](http://www.sce.carleton.ca/faculty/bailetti.html), head of the Technology Information Management program (Carleton University) who inspired the creation of BigBlueButton.  For more information, see [History of the BigBlueButton Project](http://www.bigbluebutton.org/history/)._

Released: June 18, 2012

### Major Features

* **Reduced latency in audio** - The BigBlueButton server sets the audio codec for Flash to speex and passes through the packets to FreeSWITCH for processing.

* **Recording of a session** - BigBlueButton now record events (join, leave, who's talking, chat) and media (audio, webcam, presentations, and desktop sharing) for later playback.  After the session ends, the BigBlueButton server will run one (or more) ingest and processing scripts to convert the recorded events + media into playback formats (see [Record and Playback Specification](/development/recording)).

* **Playback of recordings in HTML 5** - The default playback format will playback synchronized slides, audio, and chat.  Playback uses  [popcorn.js](http://popcornjs.org/) for playback within an HTML5 browser.  Current supported browsers are Chrome, Firefox, and IE using the Google Chrome Frame.  Playback of desktop sharing and webcam is supported through the Matterhorn integration.

* **New API calls** - The API now includes calls for recording a meeting (pass record=true to the 'create' API call) and for accessing recordings: getRecordings, publishRecordings, deleteRecordings.

* **Matterhorn integration** -  When integrated with Matterhorn, BigBlueButton can capture and process the desktop and webcam for automatic submission to a Matterhorn server.

### Usability Updates

* **Audio Settings dialog** -  To assist users in checking their audio setup **before** joining the voice conference, BigBlueButton now displays an Audio Settings dialog box to enable the user to verify that audio and microphone are correctly configured for a headset.

* **Video Dock** -  To help users view webcams from multiple sources, a new video dock window now 'docks' all the webcams.  The user can drag individual windows in and out of the dock.

* **Fit-to-Width for layout of portrait documents** -  Presentation module now enables presenter to switch between fit-to-width and fit-to-page layout for best viewing of  portrait and landscape documents.

* **Push to Talk** -  Remote students can now mute/unmute themselves with a 'push to talk' button.

### Configuration Updates

* **API demos now separate** - The API demos are installed in their own package (for easy addition and removal).  The install location has changed to `/var/lib/tomcat7/webapps/demo`, which changes the URL from accessing them from `/bigbluebutton/demo` to `/demo`.

* **Upload slides on create** - The 'create' API now supports specification for upload of slides upon creation of the session.  To upload slides, developers can pass an xml with the 'create' request (send via POST).  The xml file may include the slides inline or reference them via URLs.

* **Default Presentation** - You can now specify a default presentation for all BigBlueButton sessions, which lets you, for example, show an initial help page in a session.  See [defaultUploadedPresentation](https://github.com/bigbluebutton/bigbluebutton/blob/master/bigbluebutton-web/grails-app/conf/bigbluebutton.properties#L130) property.

* **Auto-translate disabled** -  Google Translate APIs are [no longer free](http://code.google.com/apis/language/translate/overview.html) so the auto translate feature is now disabled by default until we can determine the best way to support their new model (see [1833](https://github.com/bigbluebutton/bigbluebutton/issues/1833))

* **bbb-conf now Installs development tools** - To make it easier to develop BigBlueButton, `bbb-conf` can now install a build environment on a BigBlueButton server within any account with sudo privileges.

* **Under the hood** -  Replaced activemq with redis.  Updated red5 to RC1.  Updated FreeSWITCH to a snapshot of 1.0.7.  BigBlueButton no longer requires installation of mysql.

### Fixed Issues

See [detailed list of issues fixed in BigBlueButton 0.8](http://code.google.com/p/bigbluebutton/issues/list?can=1&q=status%3DFixed+milestone%3DRelease0.8&sort=priority)

## Release 0.71a

Released: January 13, 2011

* **Maintenance Release** - We spent six weeks profiling and testing the server code to speed handling of VoIP packets and lower memory usage on the server.

### Fixed Issues

See [detailed list of issues fixed in BigBlueButton 0.71a](http://code.google.com/p/bigbluebutton/issues/list?can=1&q=milestone=Release0.71a)

## Release 0.71: Europa

_Code named after Europa, Jupiter's moon, whose surface is among the brightest in the solar system._

Released: November 9, 2010

* **VoIP Improvements** - This was the bulk of our effort for 0.71. We improved the algorithms to handle audio packets coming to and from the BigBlueButton server. You should experience less audio lag using VoIP when compared to 0.70. (We'll let you judge the extent to which the lag has been reduced.)

> BigBlueButton 0.71 now supports FreeSWITCH as a voice conference server (contributed by Leif Jackson). This enables the BigBlueButton client to transmit either wide-band (16 kHz) Speex or the Nellymoser voice codec. In our testing so far, we found that nellymoser scales better and will remain the default voice codec in BigBlueButton.

* **Webcam Auto-Display** - When a user shares their webcam, it automatically opens on all other users connected to the virtual classroom.

* **Selectable area for Desktop Sharing** - The Desktop Sharing application now supports selecting the desktop are to share, in additional to supporting sharing of fullscreen.  This allows the user to select a specific window, for example, and reduces the bandwidth requirements for desktop sharing.

* **Auto Chat Translation** - BigBlueButton's chat now uses the Google Translate API for real-time of chat messages.  This allows the user to view the chat in their native language.

* **Client Localization** -  The user can change their locale now through a drop-down menu on-the-fly.  This also triggers a change in the locale language for automatic chat translation.

* **Client Branding** - Administrators can now skin the BigBlueButton using cascading style sheets.

* **Client Configuration** - Administrators can configure, on a server basis, specific capabilities of the BigBlueButton client.  For example, you can change the video quality, define who can share video, and allow moderators to kick users.   See [Client Configuration](/administration/customize) for the full list of configuration parameters.

* **Mate** - The BigBlueButton client is now fully migrated to the [mate](http://mate.asfusion.com/) framework.

### Fixed Issues

See [detailed list of issues fixed in BigBlueButton 0.71](http://code.google.com/p/bigbluebutton/issues/list?can=1&q=milestone=Release0.71)

### Known Issues

* ~~[Issue 1322](https://github.com/bigbluebutton/bigbluebutton/issues/1322) Hitting backspace on Safari causes the browser to go back one page~~
* ~~[Issue 1389](https://github.com/bigbluebutton/bigbluebutton/issues/1389) You have been logged out~~
* ~~[Issue 1425](https://github.com/bigbluebutton/bigbluebutton/issues/1425) Listener Window Count~~

## Release 0.7: Feynman

_Code named in honor of the Nobel prize winning physicist Richard Feynman._

Released: July 15, 2010

* **Whiteboard** - Yes, BigBlueButton 0.7 comes with an integrated whiteboard. The whiteboard is overlaid over the presentation, and enables the presenter to draw freehand as well as simple shapes on top of the presentation slides. Each slide has it's own whiteboard instance, which is persistent as the presenter moves across the slides. Everything drawn on the whiteboard is synchronized in real time across all the conference participants.

* **Desktop Sharing** - The mouse pointer is now visible to the viewers when the presenter is sharing their desktop.  The presenter also has 'b' system tray icon when desktop sharing is active.

* **UI Improvements** - Changes to the UI make are part of an ongoing effort to make BigBlueButton even simpler for people to use. The make presenter icon has been changed by a button labeled 'Make Presenter', the two mute/unmute buttons have merged into one button: click to mute all (button stays down), click again to unmute all (button comes up).  As well, we've added a new layout manager that ensures BigBlueButton looks better on screens of varying resolutions and sizes.

* **Font size in chat** -  You can now increase the font size in the chat window.

* **Ubuntu 10.04 32-bit and 64-bit support** - While we maintain support for Ubuntu 9.04 32-bit with this release, we are adding support for installation via packages on Ubuntu 10.04 32-bit and 64-bit.

* **Desktop Sharing is now LGPL** - We've remove the AGPL license from the desktop sharing module.  This means that all the BigBlueButton code is available under the LGPL license.

* **UTF-8** - Users can now login using UTF-8 names in the API examples.

* **Source code moved to Github** - As the developer community grows, better source code control becomes more important. The entire source code repository has been moved to [Github](http://github.com/bigbluebutton/bigbluebutton). This enables developers to more easily branch and merge the BigBlueButton source, and maintain feature branches.

* **API Updates** - Removed the redundant meetingToken parameter.

* **Improved Documentation** - There is a new, simpler, Developer documentation has been updated to reflect the move to git.

### Fixed Issues

See [detailed list of issues fixed in BigBlueButton 0.7](http://code.google.com/p/bigbluebutton/issues/list?can=1&q=milestone=Release0.7)

### Known Issues

* ~~[Issue 1279](https://github.com/bigbluebutton/bigbluebutton/issues/1279) Problems with audio delay using VoIP~~
* ~~[Issue 1334](https://github.com/bigbluebutton/bigbluebutton/issues/1334) Presenter can't widen the view of portrait documents~~
* ~~[Issue 1335](https://github.com/bigbluebutton/bigbluebutton/issues/1335) CentOS packages do not support BigBlueButton 0.7~~

## Release 0.64: Lickety-split

_Code named for the reduced bandwidth and speed improvements to desktop sharing_

Released: April 3, 2010

* **Faster desktop sharing** - We refactored the desktop sharing applet so it now uses less CPU on the presenter's computer.  We also refactored the desktop sharing server component (bbb-apps-deskshare) so it runs faster and only sends a keyframe when new users join, which results in much less bandwidth usage during a session.

* **Fine-grain listener management** - To make it easier for the moderator to manage listeners, such as "mute everyone except the presenter", the moderator can now "lock" a participant's mute/unmuted state in the Listener's window.  When locked, a listener is unaffected by the global mute all/unmute all buttons in the lower left-hand corner of the Listener window.  This lets the moderator lock the presenter as unmuted, then click the global mute all button to mute everyone else.  In addition, after clicking the mute all button, new listeners join as muted (this is good when a class has started and you don't want latecomers to disturb the lecture).

* **API Additions** - Jeremy Thomerson has added three new API calls: getMeetings (returns an XML file listing all the active meetings), getMeetingInfo (get information on a specific meeting), and end (end a specific meeting).  In particular, getMeetingInfo enables external applications to query the list of users in a conference. See this [api example](http://demo.bigbluebutton.org/demo/demo4.jsp) that uses getMeetingInfo.

* **Show number of participants** - When there are more than five participants in either the Users or Listeners window, the title of the window will show a count (i.e. Users: 7, Listeners: 9).

* **New method for slide selection** - The presenter can now jump to a particular slide by clicking the page number button (located between the left and right arrows) and clicking on the slide from the film strip of thumbnails.

* **Localization** - Thanks to members of the mailing list -- and to DJP for checking in language contributions -- there are now [sixteen localizations](/development/localization) for BigBlueButton.

* **RPM packages for CentOS 5.4** - We now provide RPM for installation on CentOS 5.4 (32-bit and 64-bit) for this release.

### Fixed Issues

* See [issues fixed in BigBlueButton 0.64](http://code.google.com/p/bigbluebutton/issues/list?can=1&q=milestone=Release0.64&colspec=ID%20Type%20Status%20Priority%20Milestone%20Owner%20Component%20Summary)

### Known Issues

* ~~[Issue 1174](https://github.com/bigbluebutton/bigbluebutton/issues/1174) Viewers are unable to mute/unmute themselves~~
* ~~[Issue 1112](https://github.com/bigbluebutton/bigbluebutton/issues/1112) Uploading a presentation overwrites a previous presentation with the same name~~
* ~~[Issue 1222](https://github.com/bigbluebutton/bigbluebutton/issues/1222) Creating a meeting with a blank meetingID overrides any previous meetings with blank meetingIDs~~

## Release 0.63: Red Dot

_Code named for the red dot that's now visible in the presentation module_

Released: January 25, 2010

### New Features

* **API for Third-Party Integration** - Thanks to Jeremy Thomerson, we now have a [BigBlueButton API](/development/api) that makes it easy to create and join meetings, and integrate BigBlueButton with third-party applications.

* **Localization Support** - Another big contribution to this release is work done by Xie Yan Qing and Chen Guangtao from China, who made [localization of the BBB Client](/development/localization) possible.

* **Support for other file formats** - Jean-Philippe Guiot, a contributor from France, submitted a patch months ago that allows uploading of different file formats for the presentation module.  Now, we've finally integrated his work into BBB, so from version 0.63 you will be able to upload not only .pdf, but also .ppt, doc, txt, and other file formats!

* **Improved Presentation Module** - The presentation module has been refactored to use the Mate Framework for Flex. It is now more robust, and has several new features, such as the ability for the viewers in a conference to see where the presenter is pointing his mouse of the current slide (the red dot!). The stability of the file upload and conversion process has also been improved.

* **VoIP stability** - VoIP is now more stable, with fewer dropped calls than ever, and better voice quality. And no system-access fee either!

* **Distribution** - You now longer need to compile a kernel module for VoIP.  This means that you can now install BigBlueButton 0.63 on any Ubuntu 9.04 32-bit (server or desktop) with just five commands.

* **Updated Install instructions** - If you want to install BigBlueButton's components, we've provided step-by-step instructions for Ubuntu 9.04, CentOS 5.03, and Fedora 12.

### Fixed Issues

* [See Issues Fixed in BigBlueButton 0.63](http://code.google.com/p/bigbluebutton/issues/list?can=1&q=milestone=Release0.63%20status=Fixed&colspec=ID%20Type%20Status%20Priority%20Milestone%20Owner%20Component%20Summary)

### Known Issues

* ~~[Issue 1079](https://github.com/bigbluebutton/bigbluebutton/issues/1079) List of uploaded presentation doesn't get transferred when changing presenters~~
* ~~[Issue 1077](https://github.com/bigbluebutton/bigbluebutton/issues/1077) Odd issue with presentation getting out of sync~~

## Release 0.62: Nebula NGC604

_Code named in honor of Nubula NGC604_

Released: November 11, 2009

### New Features

* **Better Desktop Sharing!** - We've made our Desktop Sharing much better by reverse engineering the Adobe Screen Codec from specs.  The result is much faster, platform independent implementation for desktop sharing.   To share their desktop, the presenter must have Java (1.6) installed to run a Java applet.   There is no changes required for the viewers to view the presenter's desktop.  We've also simplified the user interface for both presenter and viewer

* **Full built-in development environment** - The BigBlueButton VM makes it easier to modify and build your own versions of BigBlueButton.

* **Updated command-line tools** - The command-line tools `bbb-setip` and `bbb-setupdev` have been consolidated into a single script `bbb-conf`. If you modify your setup, typing `bbb-conf --check` will perform some checks on your setup to look for common configuration problems with running BigBlueButton

### To upgrade your BigBlueButton 0.61 installation to 0.62

If you are running  BigBlueButton VM 0.61 -- either from VM or from apt-get packages -- you can upgrade your installation to BigBlueButton 0.62 with with three commands.

```
  sudo apt-get update
  sudo apt-get upgrade
  sudo apt-get dist-upgrade
```

**Note**: Be sure to do `sudo apt-get update` _before_ `sudo apt-get dist-upgrade`.  We've moved out a lot of configuration files into a new package called `bbb-common`.  If you skip doing an `upgrade` and go directly to `dist-upgrade`, the package manager will complain that `bbb-common` is trying to overwrite files owned by another package.

### Fixed Issues

* [Issue 769](https://github.com/bigbluebutton/bigbluebutton/issues/769)     Listeners window not getting updates
* [Issue 865](https://github.com/bigbluebutton/bigbluebutton/issues/865) Deskshare works only when tunneling on Mac OS X
* [Issue 905](https://github.com/bigbluebutton/bigbluebutton/issues/905) Deskshare applet should test port to check if it should tunnel
* [Issue 923](https://github.com/bigbluebutton/bigbluebutton/issues/923) One one deskshare usage per session
* [Issue 925](https://github.com/bigbluebutton/bigbluebutton/issues/925) Switching presenter while screensharing results in old presenter seeing screenshare viewer window
* [Issue 932](https://github.com/bigbluebutton/bigbluebutton/issues/932) When selecting a slide from the fisheye control, the cursor becomes an i-beam
* [Issue 934](https://github.com/bigbluebutton/bigbluebutton/issues/934) Zooming can cause a slide to disappear when clicking next
* [Issue 180](https://github.com/bigbluebutton/bigbluebutton/issues/935) Deskshare can leave a stream open
* [Issue 942](https://github.com/bigbluebutton/bigbluebutton/issues/942) Improve slide navigation from keyboard
* [Issue 944](https://github.com/bigbluebutton/bigbluebutton/issues/944) Improve speed of Desktop Sharing
* [Issue 955](https://github.com/bigbluebutton/bigbluebutton/issues/955) Update build.sh scripts with Virtual Machine
* [Issue 956](https://github.com/bigbluebutton/bigbluebutton/issues/956) Update desktop sharing video
* [Issue 958](https://github.com/bigbluebutton/bigbluebutton/issues/958) Create wiki on how to setup development environment
* [Issue 959](https://github.com/bigbluebutton/bigbluebutton/issues/959) Update Installing BBB from source wiki
* [Issue 963](https://github.com/bigbluebutton/bigbluebutton/issues/963) Port 9123 could still be in use on restart of red5
* [Issue 975](https://github.com/bigbluebutton/bigbluebutton/issues/975) Not all viewers automatically seeing the shared desktop
* [Issue 976](https://github.com/bigbluebutton/bigbluebutton/issues/976) Tooltips for all icons
* [Issue 981](https://github.com/bigbluebutton/bigbluebutton/issues/981) Desktop sharing window remains open when sharer closes connection / crashes
* [Issue 984](https://github.com/bigbluebutton/bigbluebutton/issues/984) Last frame of desktop sharing is visible to viewers
* [Issue 985](https://github.com/bigbluebutton/bigbluebutton/issues/985) Flash debug client shows messages

### Known Issues

* ~~[Issue 988](https://github.com/bigbluebutton/bigbluebutton/issues/988)  java.io.IOException: Too many open files~~
* ~~[Issue 982](https://github.com/bigbluebutton/bigbluebutton/issues/982) BBB apps (Red5) should reconnect to ActiveMQ when connection drops~~
* ~~[Issue 969](https://github.com/bigbluebutton/bigbluebutton/issues/969) VoIP stops working~~
* ~~[Issue 953](https://github.com/bigbluebutton/bigbluebutton/issues/953) Mozilla crashes uploading PDF~~

## Release 0.61: Titan

Released: September 15, 2009

_Code named in honor of Saturn's largest moon_

### New Features

In preparation for schools and universities that are using BigBlueButton for the fall term, this month saw a lot of bug fixes, hardening, and a few new features.  Our goal was (and continues to be) to make the BigBlueButton code base as solid as possible.  Notable additions to this release include:

* **Support for High Res Web Cameras** - As presenter, if you have the bandwidth, it's now possible to share video using your webcam at 640x480 high resolution or 320x240 standard resolution.  We've refactored the video module itself so the code is much cleaner and better organized.

* **Simplified Desktop Sharing User Interface** - We've simplified the user experiences for initiating desktop sharing.  It now shares the entire desktop by default.  We've also refactored the desktop sharing module.

* **Refactored slide conversion** - We went deep into the slide conversion process and fixed a number of bugs.

* **Desktop Sharing and Xuggler** - The sharing capture applet now divides the presenter's screen into distinct tiles and only sends to the server the tiles that have changed since the last frame.  The desktop sharing also uses Xuggler re-assemble the tiles and compress the images into a flash video stream.  Because desktop sharing incorporates Xuggler, which is licensed under the AGPL, we've had to make desktop sharing a separate module (don't worry, you can install it with a single command).

  However, if you choose to incorporate desktop sharing into BigBlueButton, you must accept the AGPL license for BigBlueButton. This has similar implications for any web application that, in turn, incorporates BigBlueButton.

### To upgrade your installation

If you are running a BigBlueButton VM or had installed BigBlueButton using packages, you can upgrade to this release with the following two commands

```
  sudo apt-get update
  sudo apt-get upgrade
```

**Note:** If you get an error during upgrade, just run `sudo apt-get upgrade` again.  We refactored the install scripts and a previous install script and new install scrip both reference the same configuration file.  Running the upgrade command a second time will solve the problem as the first time upgrades all the install script.

### Fixed Issues

* [Issue 783](https://github.com/bigbluebutton/bigbluebutton/issues/783) Windows can get hidden or off-screen
* [Issue 810](https://github.com/bigbluebutton/bigbluebutton/issues/810) First moderator should become default presenter
* [Issue 823](https://github.com/bigbluebutton/bigbluebutton/issues/823) Progress should include generating thumbnails
* [Issue 828](https://github.com/bigbluebutton/bigbluebutton/issues/828) Reload after login doesn't load the person back into the session
* [Issue 845](https://github.com/bigbluebutton/bigbluebutton/issues/845) deskshare-app blocks red5 from restarting
* [Issue 829](https://github.com/bigbluebutton/bigbluebutton/issues/829) Upon uploading a presentation the first slide does not show
* [Issue 870](https://github.com/bigbluebutton/bigbluebutton/issues/870) Windows respond very poorly when maximized
* [Issue 883](https://github.com/bigbluebutton/bigbluebutton/issues/883) Unable to drag desktop sharing window while sharing fullscreen
* [Issue 884](https://github.com/bigbluebutton/bigbluebutton/issues/884) BigBlueButton client will hang for ~ 1 minute while it waits for direct connection to 1935 to timeout
* [Issue 901](https://github.com/bigbluebutton/bigbluebutton/issues/901) User can log in without entering a username
* [Issue 904](https://github.com/bigbluebutton/bigbluebutton/issues/904) Session not invalidated after logout
* [Issue 912](https://github.com/bigbluebutton/bigbluebutton/issues/912) Red5 ip is lost after upgrading
* [Issue 916](https://github.com/bigbluebutton/bigbluebutton/issues/916) Red5 logs are erased on restart
* [Issue 918](https://github.com/bigbluebutton/bigbluebutton/issues/918) Sharing full screen may cause red5 server to halt
* [Issue 921](https://github.com/bigbluebutton/bigbluebutton/issues/921) Video screen not resized according to the window resize
* [Issue 923](https://github.com/bigbluebutton/bigbluebutton/issues/923) One one deskshare usage per session
* [Issue 924](https://github.com/bigbluebutton/bigbluebutton/issues/924) Make "USB Video Class Video" default choice for Mac
* [Issue 930](https://github.com/bigbluebutton/bigbluebutton/issues/930) Maximize deskshare window when in full screen causes hang
* [Issue 931](https://github.com/bigbluebutton/bigbluebutton/issues/931) Share web cam icon allows multiple clicks
* [Issue 933](https://github.com/bigbluebutton/bigbluebutton/issues/933) Reset layout should reset sizes of windows

### Known Issues

* ~~[Issue 936](https://github.com/bigbluebutton/bigbluebutton/issues/936) Stopping deskshare crashes Safari~~
* ~~[Issue 935](https://github.com/bigbluebutton/bigbluebutton/issues/935) Deskshare can leave a stream open~~
* ~~[Issue 934](https://github.com/bigbluebutton/bigbluebutton/issues/934) Zooming can cause a slide to disappear when clicking next~~
* ~~[Issue 925](https://github.com/bigbluebutton/bigbluebutton/issues/925) Switching presenter while screensharing results in old presenter seeing screenshare viewer window~~
* ~~[Issue 908](https://github.com/bigbluebutton/bigbluebutton/issues/908)  The Show button on the Upload Window doesn't work~~

## 0.6 Release: Mir Space Station. August 12 2009

#### New Features

**Integrated VOIP**

Participants can now use their headset to join a voice conference using voice over IP (VoIP).  For sites that setup BigBlueButton to connect to the phone system, both VoIP and dial-in participants can share the same voice conference.

The VoIP capability is based on the [Red5Phone](http://code.google.com/p/red5phone) project to connect Asterisk and Red5.

#### Fixed Issues

Here are the list of issues we fixed on this release:

* [Issue 824](https://github.com/bigbluebutton/bigbluebutton/issues/824) Red5 Phone Module
* [Issue 826](https://github.com/bigbluebutton/bigbluebutton/issues/826) Users do not see slides from presenter
* [Issue 853](https://github.com/bigbluebutton/bigbluebutton/issues/853) Left and Right arrow keys not working
* [Issue 854](https://github.com/bigbluebutton/bigbluebutton/issues/854) Update Reset Zoom icon
* [Issue 859](https://github.com/bigbluebutton/bigbluebutton/issues/859) Add Desktop Sharing to BigBlueButton
* [Issue 861](https://github.com/bigbluebutton/bigbluebutton/issues/861) Unable to start desktop sharing
* [Issue 863](https://github.com/bigbluebutton/bigbluebutton/issues/863) Client does not provide proper feedback when logging out
* [Issue 869](https://github.com/bigbluebutton/bigbluebutton/issues/869) Client trying to load history.js and history.htm
* [Issue 872](https://github.com/bigbluebutton/bigbluebutton/issues/872) Log window is hard to read
* [Issue 873](https://github.com/bigbluebutton/bigbluebutton/issues/873) Limitation of conference session does not work.
* [Issue 876](https://github.com/bigbluebutton/bigbluebutton/issues/876) Can't input chat text in full screen mode
* [Issue 880](https://github.com/bigbluebutton/bigbluebutton/issues/880) Build bbb-apps from VM
* [Issue 885](https://github.com/bigbluebutton/bigbluebutton/issues/885) Hearing voices after logging out
* [Issue 890](https://github.com/bigbluebutton/bigbluebutton/issues/890) Participant entry sound plays when user icon is clicked
* [Issue 891](https://github.com/bigbluebutton/bigbluebutton/issues/891) Phone Logout null pointer exception
* [Issue 893](https://github.com/bigbluebutton/bigbluebutton/issues/893) Unmute-all icon mis-aligned
* [Issue 894](https://github.com/bigbluebutton/bigbluebutton/issues/894) bbb-setip not detecting rtmp port

#### Known Issues

* ~~[Issue 896](https://github.com/bigbluebutton/bigbluebutton/issues/896) Impossible to disconnect from voice-conference w/o logging out~~
* ~~[Issue 888](https://github.com/bigbluebutton/bigbluebutton/issues/888) Webcam window still visible to other participants after logging out~~
* ~~[Issue 884](https://github.com/bigbluebutton/bigbluebutton/issues/884) Client takes too long to test port 1935 and start tunneling~~
* ~~[Issue 882](https://github.com/bigbluebutton/bigbluebutton/issues/882) Video stream not properly closing in client~~
* ~~[Issue 862](https://github.com/bigbluebutton/bigbluebutton/issues/862) Cut-and-paste url should give a login error~~
* ~~[Issue 843](https://github.com/bigbluebutton/bigbluebutton/issues/843) PDF slide with many symbols causing long delay~~
* ~~[Issue 829](https://github.com/bigbluebutton/bigbluebutton/issues/829) Upon uploading a presentation the first slide does not show~~

Released: August 12, 2009

## 0.5 Release: Apollo 11

Released: July 21, 2009

_Code named in honor of the 40th anniversary of the moon landing_

#### New Features

**Desktop Sharing**

Desktop Sharing has been in development for a long time.  We wanted a solution that would work on all three platforms (Mac, Unix, and PC), so we decided to use a Java Applet to grab to send screen updates to the Red5 server.  We then used Xuggler from within Red5 to create a live stream from the incoming images from the applet.

From the presenter's perspective, there is a new screen icon on the top toolbar. Once clicked, the presenter can choose the area of their screen to share.  Clicking on Start Sharing causes this area of their screen to appear on all the clients.  While sharing the presenter can still drag around the window to determine which portion of the screen gets shared.

**Private Chat**

Any participant can now chat privately with anyone else in the room by choosing their name from the drop-down menu in the chat window.

Under the hood, the private chat works in the same way as the public chat, except that each participant has a dedicated shared object on the server to which messages get sent, and to which only they listen to.

#### Fixed Issues

Here are the list of issues we fixed on this release:

* [Issue 864](https://github.com/bigbluebutton/bigbluebutton/issues/864) Cannot upload twice a file
* [Issue 856](https://github.com/bigbluebutton/bigbluebutton/issues/856) Red5 video app has significant delay
* [Issue 851](https://github.com/bigbluebutton/bigbluebutton/issues/851) Fixed the thumbnail view in presentation module to be more responsive and user friendly
* [Issue 849](https://github.com/bigbluebutton/bigbluebutton/issues/849) Change applet certificate
* [Issue 848](https://github.com/bigbluebutton/bigbluebutton/issues/848) deskshare-client should tunnel through port 80
* [Issue 842](https://github.com/bigbluebutton/bigbluebutton/issues/842) Logout should close the deskshare module
* [Issue 840](https://github.com/bigbluebutton/bigbluebutton/issues/840) Added a zoom slide to presentation module, for users without mousewheel
* [Issue 839](https://github.com/bigbluebutton/bigbluebutton/issues/839) Only one instance of the upload window can now be opened.
* [Issue 833](https://github.com/bigbluebutton/bigbluebutton/issues/833) Added Desktop Sharing. The presenter can now do a screen-cast
* [Issue 832](https://github.com/bigbluebutton/bigbluebutton/issues/832) bbb-setupdev -s (setup samba) now gives the correct path
* [Issue 763](https://github.com/bigbluebutton/bigbluebutton/issues/763) Added Private Chat. Participants can now chat privately with any other participant in the conference

#### Known Issues

* ~~[Issue 867](https://github.com/bigbluebutton/bigbluebutton/issues/867) Desk share video shows the final frame when presenter logs out~~
* ~~[Issue 866](https://github.com/bigbluebutton/bigbluebutton/issues/866) Desk share video has narrow yellow stripe at the top~~
* ~~[Issue 865](https://github.com/bigbluebutton/bigbluebutton/issues/865) Deskshare works only when tunneling on Mac OS X~~
* ~~[Issue 850](https://github.com/bigbluebutton/bigbluebutton/issues/850) Deskshare app sometimes crashes~~
* ~~[Issue 845](https://github.com/bigbluebutton/bigbluebutton/issues/845) deskshare-app blocks red5 from restarting~~

## Release 0.4

Released: June 12, 2009

Much of the effort in this release was on creating individual packages for the components and distributing the entire package as a downloadable virtual machine.

Other updates include:

* BigBlueButton client now supports tunneling through a firewall via port 80
* Uploading of multiple slides
