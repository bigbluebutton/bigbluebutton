---
id: release-testing
slug: /testing/release-testing
title: Release Testing
sidebar_position: 1
description: BigBlueButton Release Testing
keywords:
- testing
- test
---

This document is meant to be a combination of manual and (labeled so) automated tests, listed per feature of BigBlueButton.

The <b>automated tests</b> are only a portion of the testing done before a release. Ideally they should be triggered often, for example when testing pull requests, or once a day automatically.

The <b>manual tests</b> really help to ensure release quality. They should
be performed by humans using different browsers. It is usefull to have multiple
humans performing these tests together. You should plan at least an hour to perform
all of these tests.

## Presentation

### Uploading a Presentation [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. As a moderator, select Moderator/Presenter Action menu (+)

2. Choosing "Manage presentations"

3. Uploading presentation options:

    - using Drag and Drop
    - Upload presentation using File Explorer(browsing for files.)

4. You should see the notification displaying the upload progress

5. Presentation should appear on All Clients in sync with updates, and All Clients should see the notification with the new presentation name

### Sending presentation download link to the chat [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. Join a meeting and draw some annotations on the slide.

2. Select Moderator/Presenter Action menu

3. Choose "Manage presentations"

4. Click on "Send to chat" button.

5. Verify that the link was sent to the chat and the link works.

6. Draw some annotations on the whiteboard.

7. Send the download link to the chat again. This time, the presentation downloaded through the link should include the annotation.

### Deleting Presentation [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. Select Moderator/Presenter Action menu

2. Choose "Manage presentations"

3. Selecting trash icon to delete

4. Choose confirm

### Uploading multiple presentations [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. Select Moderator/Presenter Action menu

2. Choose "Manage presentation"

3. Select multiple presentations at once using Browse for files option

4. Set a current presentation

5. Select upload

6. You should see the notification displaying the upload progress

7. Current selected file should appear for all clients

### Deleting previously uploaded presentations

1. Presenter: open "Manage presentations" modal, upload two new presentations.

3. Presenter: open "Manage presentations" modal, delete two recently uploaded presentations.

4. Presenter: open "Manage presentations" modal, verify that there's only the default presentation name visible.

5. Another user: become a presenter.

6. New presenter: open "Manage presentations" modal, verify that there's only the default presentation name visible.

### Navigation [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. Locate slide navigation bar

2. Select next slide (\>)

3. Select previous slide (\<)

4. Use dropdown to select a specific slide.

5. The selected slide should appear

### Zoom

1. Zoom in (+) and out (-) by clicking in the buttons or using the scroll

2. Using the Pan tool, move document around while zoomed in.

### Draw and Pan

1. Zoom in by (+)

2. Changing pan tool to pen tool

3. Draw in the whiteboard area

4. Hold down the space while moving mouse to pan.


### Minimize/Restore Presentation [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. Clicking on Share webcam.

2. Minimizing presentation.

3. Presentation should be minimized, the button should change to "Restore presentation"

4. Selecting "Restore presentation"

5. Presentation should be restored.

(Note : Presentation area will auto expand when the presenter engages Screen Sharing or YouTube Link Share)

### Full Screen option

1. Click on full screen button ("Make presentation fullscreen")

2. Application should go to full screen

3. Draw on the whiteboard

4. Select Escape key on local keyboard.

5. Application should return to normal screen

6. Click on full screen button again

7. Click on "Undo Presentation fullscreen" button

8. Application should return to normal screen

### Snapshot of current presentation

1. Join meeting.

2. Apply some annotations to the whiteboard.

2. Click "Options" (three dots icon on top-right of the presentation area), select "Snapshot of current presentation".

3. You should get promted to save the file. The file should contains the image of the current slide of the presentation, including the annotations applied.

### Fit to width option

1. Click on "Fit to width" button

2. Presentation should be re-positioned to fit to width

3. Click on "Fit to page" button

4. Presentation should return to normal view

### Make viewer a presenter [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/user/user.spec.js)

1. Click viewer icon from users list

2. Selecting make presenter for the user.

3. Viewer selected should have all presenter capabilities and presenter Icon should appear over user icon in the users list.

### Taking presenter status back [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/user/user.spec.js)

1. In order to take back the presenter, can be done in following ways:

   1.1

- Click on your user icon in users list.
- choose "Take presenter"

  1.2

- Select Moderator/Presenter Actions menu (+)
- choose "Take presenter"

You should now have presenter capabilities and presenter icon should appear over your icon in the users list.

## Webcams

### Joining Webcam [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/webcam/webcam.spec.js)

1. Click on "Share webcam" icon

2. Allow browser permissions if prompted

3. Select your webcam

4. Choose the video quality from the available option

5. Select one of the default virtual backgrounds. You can also upload your own background image by clicking on the plus sign to the right of the default backgrounds and selecting a file. Change the brightness of the background by using the brightness control below the list of background images.

6. Click "Start sharing"

7. A small webcam video should show up and the camera share will start highlighting

8. Click "Stop sharing webcam"

9. The webcam video should disappear

### Make webcam fullscreen

1. Click the webcam's fullscreen button ("Make [user name] fullscreen").

2. The webcam should appear in fullscreen.

3. Press the Esc key.

4. The webcam should exit the fullscreen and go back to normal size.

5. Click the webcam's fullscreen button again.

6. Click the undo fulscreen button ("Undo [user name] fullscreen").

7. The webcam should exit the fullscreen and go back to normal size.

### Focus/unfocus a webcam

1. Join meeting with at least 3 webcams.

2. Hover over one of the webcam's user name.

3. Select dropdown and choose "Focus".

4. The chosen webcam should expand (not fullscreen), while other webcams become smaller.

5. Hover over the focused webcam's user name.

6. Select dropdown and choose "Unfocus".

7. The webcams should get back to normal sizes and positions.

### Maximize/minimize webcam

- With webcams shared, click on the Hide Presentation icon to minimize presentation area and maximize webcam.

The presentation will be minimized, and a button will be highlighted to restore the presentation.

### Mirror webcam

1. Join meeting with a webcam.

2. Hover over the webcam's user name.

3. Select dropdown and choose "Mirror".

4. Webcam's stream should flip horizontally.

5. Hover over the webcam's user name.

6. Select dropdown and choose "Mirror" again.

7. Webcam's stream should get back to normal.

### Drag webcams

1. Share webcams

2. Drag to middle, top or bottom.

3. Release webcams in greyed area on screen.

Webcams will be moved when mouse is released. (Note: When only one webcam is shared user can drag and drop webcam anywhere in the presentation area)

### Switching to Default webcam

1. Click the share/stop sharing webcam icon twice (once to remove current webcam connection and again to re-prompt the webcam join modal)

2. Allow browser permissions if applicable

3. Choose webcam (switch from previous default device)

4. choose the video quality

5. click on Start Sharing

### Resizing one or multiple Webcams

A. Resizing one single webcam.

- Share a webcam
- Drag the bottom of the webcam window
- Increase or Decrease the size of the webcam.

The webcam will be resized as per the size we want.

B. Case of more than one webcam.

- Share atleast 2 webcams
- Drag the bottom of the webcams container
- Increase or Decrease the size of the webcams.

The webcams should be resized as per the size we want.

### Stop Sharing webcam

1. Start sharing webcam.

2. Click "Stop sharing webcam".

3. The webcam sharing should stop.

4. Start sharing webcam again.

5. Click "Open advanced settings" icon near the "Stop sharing webcam" button.

6. Click "Stop sharing".

7. The webcam sharing should stop.

### Pin webcams

1. Join meeting with at least 3 webcams.

2. Hover over the webcam's user name.

3. Select dropdown and choose "Pin".

4. That particular webcam should move to the first place among the webcams and stay there.

5. Pin another webcam and verify that it sticks to the second place among the webcams.

6. Hover over the webcam's user name.

7. Select dropdown and choose "Unpin". Alternatively, you can choose to click the pin icon that is in the top-left corner of the webcam.

8. That particular webcam should unpin.

## Screenshare

### Sharing screen in Full Screen mode [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/screenshare/screenshare.spec.js)

1. Clicking on share screen icon

2. select full screen mode or share entire screen (browser dependent)

3. Choose a screen to share

4. select share

The screen is displayed for the presenter/moderator and the viewer,
while the sharescreen button is highlighting and displayed only for the presenter and (for the viewer or the moderator, the presentation will be replaced with the screensharing)

### Sharing screen in Application Mode

1. Click on share screen icon

2. Select application mode

3. choose application to share (note : application must already be open on the desktop)

4. select screen to share

5. select share

The screen is displayed for the presenter and the viewers, the screen share updates for the viewers when the presenter makes changes in the application - no secondary windows or pop ups appear.

Note : When sharing in application mode any secondary windows, pop up messages or search menus are not transmitted to the viewer even if they generate from within the application being shared, and When using microsoft office applications, while using application mode any and all updates to the application are not transmitted by the browser to the viewers

### Stop screen sharing

- Click on stop sharing screen toast message

  OR

- select screen share / stop screen share icon

The screen sharing stops, a sound effect of disconnection is heard and the presentation is restored.

## Breakout rooms

### Moderators creating breakout rooms and assiging users [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/breakout/breakout.spec.js)

1. Click "Manage users" (cog wheel icon in the user list).

2. Select "Create breakout rooms".

3. "Breakout Rooms" modal should appear.

4. Choose number of rooms and duration.

5. Two ways to assign users: Drag and drop users to the rooms or click "Randomly assign" (it randomly assigns viewers only).

6. Click "Create" button.

7. Viewers: invite screen should pop up. Moderators: "Breakout Rooms" section should appear in the left-hand panel.

8. Viewers: click "Join room" button, viewer should successfully join the breakout room. Moderators: click "Breakout Rooms", click "Join room" (moderators should only see that button for the rooms they got invited to), moderator should successfully join the breakout room.

9. All the selected settings are applied to the rooms.

10. Once joined, breakout room label should appear below the user name in the user list of the main room.

11. In the main room, click "Breakout Rooms". The breakout rooms panel should appear and it should contain the timer for the rooms (according to the duration that was set during the creation of the breakout rooms).

### Message to all breakout rooms

1. Click "Manage users" (cog wheel icon in the user list).

2. Select "Create breakout rooms".

3. "Breakout Rooms" modal should appear.

5. Assign users to the room.

6. Click "Create" button.

7. Join the breakout rooms with the users.

8. Moderator: open the breakout rooms panel (click "Breakout Rooms"), type a message into "Message all rooms" textbox and Press Enter / click "Send message" button.

9. Notification "Message was sent to N breakout rooms" (N - number of rooms created) should appear in the main room for the user who sent the message.

10. Public chats in all the breakout rooms should get the message highlighted by a special background color.

### Viewers choosing the breakout rooms [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/breakout/breakout.spec.js)

1. Click "Manage users" (cog wheel icon in the user list).

2. Select "Create breakout rooms".

3. "Breakout Rooms" modal should appear.

4. Choose number of rooms and duration. Select the "Allow users to choose a breakout room to join" checkbox.

6. Click "Create" button.

7. Viewers: invite screen should pop up (including the rooms dropdown). Moderators: "Breakout Rooms" section should appear in the left-hand panel.

8. Viewers: select the room using the dropdown, click "Join room", viewer should successfully join the selected breakout room. Moderators: click "Breakout Rooms", click "Ask to join" for the specific room, moderator should successfully join the breakout room.

9. All the selected settings are applied to the rooms.

### Logout from a Breakout Room

1. Join breakout room.

2. Click "Options" and then "Leave meeting".

3. You should successfully leave the breakout room and shouldn't be redirected to the feedback screen.

### Switch between breakout rooms

1. Create breakout rooms.

2. As moderator, click on the breakout rooms control panel and choose "Ask to join" or "Join room" to join specific room.

3. Moderator should successfully join the room you chose.

### Destroy breakout rooms

1. Join breakout room as moderator.

2. Inside the breakout rooms control panel ("Breakout Rooms" button in the left-hand panel), select the "Breakout options" dropdown and choose "Destroy breakouts".

3. All of the breaout rooms should end and all users should get back to the main room. If users already got the audio on, they shouldn't get propmted for the audio modal.

### Edit the duration of a breakout room

1. Join breakout room as moderator.

2. Inside the breakout rooms control panel ("breakout Rooms" button in the left-hand panel), select the "Breakout options" dropdown and choose "Manage duration".

3. Edit the duration and click "Apply".

4. The duration of the breakout room should reset. Public chats in all of the breakout rooms should get the message saying "Breakout time is now N minutes" (N - new duration).

### Moving of users between breakout rooms

1. Create a breakout room. Click on the three dots icon and choose "Manage Users".

2. Draw and drop a user to a different breakout room. Click "Apply".

3. The user should be notified about the removal and the prompt to confirm the joining of the new breakout room should appear.

### Exporting the breakout room's shared notes to the main room

1. Create a breakout room with enabling "Capture shared notes when breakout rooms end".

2. Join a breakout room. Type something in the shared notes. End the breakout room.

3. Breakout room's shared notes should be converted to a pdf and that pdf should be available for uploading to the whiteboard.

### Exporting the breakout room's whiteboard annotations to the main room

1. Create a breakout room with enabling "Capture whiteboard when breakout rooms end".

2. Join a breakout room. Draw something on the whiteboard. End the breakout room.

3. Breakout room's annotations should be converted to a pdf and that pdf should be available for uploading to the whiteboard.

## Audio

### Join audio [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/audio/audio.spec.js)

1. Join a meeting.

2. Click microphone and allow for browser permissions (if applicable).

3. Verify if you can hear yourself in the echo test. Audio stream volume bar should indicate the volume of your voice.

4. Change the microphone and speaker using the dropdowns (if applicable).

5. Press "Stop audio feedback button" and verify that you dont hear your audio anymore, while the audio stream volume bar is still functional. Clicking that button again should turn on the audio feedback again.

6. Click "Yes".

7. You should be redirected to the meeting and your microphone button and avatar in the in the user list should indicate the you are unmuted.

### Mute/unmute

1. Join a meeting.

2. Click microphone and allow for browser permissions (if applicable).

3. Verify if you can hear yourself in the echo test.

4. Click "Yes".

5. The microphone button should indicate the unmuted state.

6. Click the microphone button several times. You should change between unmuted and muted states and the button should indicate it.

### Leave audio

1. Join meeting with audio.

2. Click "Leave audio".

3. You should hear the disconnect sound and leave audio. "You have left audio conference" notification should appear.

### Join without audio

1. Join a meeting.

2. Click "x" in the audio modal.

3. You should be redirected to the meeting and your microphone button should not be highlighted.

### Listen Only Mode [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/audio/audio.spec.js)

1. Join a meeting.

2. Click "Listen only" in the audio modal.

3. You should be redirected to the meeting and your microphone button and user list avatar should indicate that you are in listen only mode.

### Testing microphone

Click on microphone and go through echo test and then click No.

- You should see Change your audio settings dialog

### Choosing different sources

1.  In the Change your audio settings, choose different microphones
2.  choose different speakers
3.  click Play test sound
4.  click Retry and then click Yes.

- You should be able to use different microphones and speakers and hear yourself in the echo test with varying combinations of microphone/speakers. When you click 'Yes', your microphone should be highlighting.

#### Joining with phone

- Joining the audio conference with a phone: The viewer should mute/unmute with the moderator's actions.

- For mute/unmute: Press the '0' key on the phone's keypad to mute/unmute (Note : In production Moderator cannot unmute other users unless enabled at the account level)

- For moderator mute/unmute dial in (select dial in from users list and choose mute/unmute) : The audio state should mute/unmute accordingly. (Note : In production Moderator cannot unmute other users unless enabled at the account level )

- Remove dial in : As a moderator click the phone number in the Users list and choose remove user. The phone hangs up and user no longer appears in the Users list

### Talking Indicator

Enable Microphone : This will cause a user name to appear on left top corner of the Presentation Area whenever a User talks.

#### Muting user from Talking Indicator

1.  As Moderator: Click on the name of User appearing in top left corner of the Presentation area.

- The Talking User gets muted.

2.  As Viewer: Click on the name of User appearing in top left corner of the Presentation area.

- The Talking User should not get muted

## Closed Captions

### Launch closed captions menu (and toggle the menu)

1. Join meeting as moderator.

2. Click "Manage users" (cog wheel icon in user list) and select "Write close captions".

3. Select the language. Click "Start".

4. The closed captions button should appear in left-hand menu (above the shared notes) and it should indicate the chosen language.

5. Type text into closed captions panel.

6. Click on the language button in the closed captions menu.

7. The closed captions menu should close.

8. Click on the closed captions button above the shared notes in the left-hand menu.

9. The closed captions menu should open.

10. Click the same button again.

11. The closed captions menu should close.

### Closed captions formatting

1. Join meeting as moderator.

2. Click "Manage users" (cog wheel icon in user list) and select "Write close captions".

3. Select the language.

4. Type text into closed captions panel.

5. Test all of the available formatting tools that are available (Bold, Italic, ...). Whatever is typed as text should be shown exactly as intended.

### View/Hide closed captions

1. Join as viewer or moderator.

2. Click "Start viewing closed captions" button.

3. The closed captions button should be highlighted.

4. Choose the language and other UI settings for closed captions. Click "Start".

5. Join meeting as moderator.

6. Moderator: click "Manage users" (cog wheel icon in user list) and select "Write close captions", then select the language.

7. Moderator: Type text into closed captions panel.

8. User: should see the closed captions on top of the whiteboard. The text should be the same as the one typed by moderator. The closed captions should appear according to the UI settings chosen by the user.

9. User: click the closed captions button.

10. User: closed captions button should not be highlighted anymore, the closed captions should disappear.

### Live Automatic Closed Captions

1. Join a meeting with at least two viewers using Chrome, Edge or Safari. Automatic transcription language selector needs to be enabled in the settings file.

2. In the audio modal, choose the language for the automatic transcription. Join the audio. Talking indicator should include the "CC" icon for the user who selected the language.

3. All other users should see the "CC" button in the whiteboard area. When you click the button, you should see the transcription.

## Whiteboard

### Use pencil tool

1. Join meeting with two or more users.

2. Presenter: Click "Tools" whiteboard button.

3. Presenter: Select "Pencil".

4. Presenter: Draw on the whiteboard area.

5. All clients should see the drawing.

### Change pencil tool thickness

1. Join meeting with two or more users.

2. Presenter: Click "Tools" whiteboard button.

3. Presenter: Select "Pencil".

4. Presenter: Click "Drawing thickness" button.

5. Presenter: Select a new thickness.

6. Presenter: Draw on the whiteboard area.

7. All clients should see the drawing and the drawing should appear according to the chosed thickness.

### Changing pencil tool colour

1. Join meeting with two or more users.

2. Presenter: Click "Tools" whiteboard button.

3. Presenter: Select "Pencil".

4. Presenter: Click "Colors" button.

5. Presenter: Select a new color.

6. Presenter: Draw on the whiteboard area.

7. All clients should see the drawing and the drawing should be colored accordingly.

### Use shape tools [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/whiteboard/whiteboard.spec.js)

1. Join meeting with two or more users.

2. Presenter: Click "Tools" whiteboard button.

3. Presenter: Select available shapes one by one and draw on the whiteboard area. All clients should see the shapes on the whiteboard.

### Change shape tool thickness and color

1. Join meeting with two or more users.

2. Presenter: Click "Tools" whiteboard button.

3. Presenter: Select available shapes one by one and draw on the whiteboard area. Change their thickness and color. All clients should see the shapes on the whiteboard with the correct thickness and color.

### Use text tool

1. Join meeting with two or more users.

2. Presenter: Click "Tools" whiteboard button.

3. Presenter: Select "Text".

4. Presenter: Adjust the font size and color.

5. Presenter: Create a text box on the whiteboard and type text inside. Click somewhere else on the whiteboard.

6. All clients should see the text inside a text box. The text should appear according to the selected font size and color.

### Undo last annotation

1. Join meeting with two or more users.

2. Presenter: Click "Tools" whiteboard button, choose annotation and put two such annotations on the whiteboard.

3. All clients should see both annotations.

4. Presenter: Click "Undo annotation".

5. All clients should see only the first annotation now.

### Clear all annotations

1. Join meeting with two or more users.

2. Presenter: Click "Tools" whiteboard button, choose annotation and put two such annotations on the whiteboard.

3. All clients should see both annotations.

4. Presenter: Click "Client all annotations".

5. Both annotations should disappear for all clients.

### Multi-user whiteboard [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/whiteboard/whiteboard.spec.js)

1. Join meeting with two or more users.

2. Presenter: click "Turn multi-user whiteboard on", the button's icon should change and the counter of the current number of viewers should appear.

3. All clients should be able to draw and see each other's changes on the whiteboard.

3. Join meeting with another viewer.

4. The counter of multi-user whiteboard viewers shouldn't change. The recently joined viewer shouldn't be able to draw.

5. Presenter: click "Turn multi-user whiteboard off", button's icon should change back to normal. All clients shouldn't be able to draw anymore.

6. Presenter: click "Turn multi-user whiteboard on", the button's icon should change and the counter should include the recently joined viewer.

7. All clients should be able to draw and see each other's changes on the whiteboard (including the recently joined viewer).

## YouTube Video sharing

### Start YouTube video sharing

1. Join a meeting.

2. Presenter: Click on the action ("+" icon) button.

3. Presenter: Select "Share an external video".

4. Presenter: The popup modal should appear. Paste a YouTube link there.

5. Presenter: Click "Share a new video".

6. All clients will see the YouTube video playing in the presentation area.

### Volume/Skipping/Pausing

1. Join a meeting.

2. Presenter: Click on the action ("+" icon) button.

3. Presenter: Select "Share an external video".

4. Presenter: The popup modal should appear. Paste a YouTube link there.

5. Presenter: Click "Share a new video".

6. Presenter should be able to perform all the available actions on the YouTube video such as muting, increasing/decreasing the volume, pausing/resuming.

7. The result of those actions should be visible for all clients.

### Stoping Youtube Video Sharing

1. Join a meeting.

2. Presenter: Click on the action ("+" icon) button.

3. Presenter: Select "Share an external video".

4. Presenter: The popup modal should appear. Paste a YouTube link there.

5. Presenter: Click "Share a new video".

6. All clients will see the YouTube video playing in the presentation area.

7. Presenter: Click on the action ("+" icon) button.

8. Presenter: Select "Stop sharing external video".

9. All clients will see the video disappear and the presentation visible again.

### Playing another Video

1. Join a meeting.

2. Presenter: Click on the action ("+" icon) button.

3. Presenter: Select "Share an external video".

4. Presenter: The popup modal should appear. Paste a YouTube link there.

5. Presenter: Click "Share a new video".

6. All clients will see the YouTube video playing in the presentation area.

7. Presenter: Click on the action ("+" icon) button.

8. Presenter: Select "Stop sharing external video".

9. Presenter: Click on the action ("+" icon) button.

10. Presenter: Select "Share an external video".

11. Presenter: The popup modal should appear. Paste a new YouTube link there.

12. Presenter: Click "Share a new video".

13. All clients will see the new YouTube video playing in the presentation area.

## Shared Notes

### Using shared notes panel

1. Join a meeting with two or more users.

2. Click "Shared Notes" on the left-hand panel.

3. Start writing in the opened shared notes panel.

4. Notification should appear on the "Shared Notes" button for those users whose shared notes panel is closed.

4. After opening the shared notes panel, all clients should see the writing as well. The username will appear near the test that user is currently typing.

### Exporting Shared notes

1. Selecting "export"

2. Choosing available format, should work with all the formats.

3. Save as to local device

Share notes should export and download in the chosen format.

### Pin notes onto whiteboard

1. Open shared notes, write something. Click the three dots icon. Choose "Pin notes onto whiteboard".

2. Shared notes should appear on top of the whiteboard. Shared Notes button should become disabled.

3. Click "Unpin notes". Shared notes should disappear from the whiteboard. You should be able to open Shared Notes again.

### Convert notes to presentation

1. Open shared notes, write something. Click the three dots icon. Choose "Convert notes to presentation".

2. Shared notes should be converted to a presentation file and that file should be uploaded to the whiteboard

### Using shared notes formatting tools

1. Join a meeting with two or more users.

2. Click "Shared Notes" on the left-hand panel.

3. Use the available formatting tool (Bold, Italic, etc.).

4. Make a bulleted list.

5. Make a numbered list.

6. After opening the shared notes panel, all clients should see the text according to the formatting.

## Lock Settings

### Webcam

1. Join meeting with moderators and viewers.

2. All users start sharing webcams.

3. Moderator: click on the cog wheel icon in the user list, select "Lock viewers".

4. Moderator: "Lock viewers" modal should appear.

5. Moderator: toggle "Share webcam" (it becomes "Locked"), click "Apply".

6. "Viewers' webcams are disabled" notification should appear for all users.

7. Viewer's webcam should stop sharing and the webcam button should be disabled.

8. Join meeting with a new viewer.

9. New viewer: webcam button should be disabled.

10. Join meeting with a new moderator.

11. New moderator: should be able to share a webcam.

12. Moderator: demote another moderator (click on the user name in the user list and select "Demote to viewer".

13. Demoted moderator: webcam button should be disabled.

14. Moderator: promote a viewer (click on the user name in the user list and select "Promote to moderator").

15. Promoted viewer: should be able to share a webcam.

16. Moderator: click on the cog wheel icon in the user list, select "Lock viewers".

17. Moderator: "Lock viewers" modal should appear.

18. Moderator: toggle "Share webcam" (it becomes "Unlocked"), click "Apply".

19. Viewer: should be able to share a webcam.

20. Join meeting with a new viewer.

21. New viewer: should be able to share a webcam.

### See other viewers webcams

1. Join meeting with moderators and viewers.

2. All users start sharing webcams.

3. Each user should see all webcams.

4. Moderator: demote another moderator (click on the user name in the user list and select "Demote to viewer").

5. Each user should see all webcams.

6. Moderator: promote a viewer (click on the user name in the user list and select "Promote to moderator").

7. Each user should see all webcams.

8. Moderator: click on the cog wheel icon in the user list, select "Lock viewers".

9. Moderator: "Lock viewers" modal should appear.

10. Moderator: toggle "See other viewers webcams" (it becomes "Locked"), click "Apply".

11. All users should see "Only moderators are able to see users' webcams (due to lock settings)" notification.

12. Nothing should change for moderators, while viewers shouldn't be able to see other viewers' webcams (each viewer should still see own webcam).

13. Moderator: promote a viewer (click on the user name in the user list and select "Promote to moderator").

14. Promoted viewer: should be able to see other viewers' webcams.

15. Moderator: demote another moderator (click on the user name in the user list and select "Demote to viewer").

16. Demoted moderator: shouldn't be able to see other viewers' webcams (should still see own webcam).

17. Join meeting with a new viewer.

18. New viewer: shouldn't see other viewers' webcams (should still see own webcam).

19. Join meeting with a new moderator.

20. New moderator: should see all webcams.

21. Moderator: click on the cog wheel icon in the user list, select "Lock viewers".

22. Moderator: "Lock viewers" modal should appear.

23. Moderator: toggle "See other viewers webcams" (it becomes "Unlocked"), click "Apply".

24. All users should see "You can enable your webcam now, everyone will see you" notification.

25. Each user should see all webcams again.

### Microphone

1. Join meeting with moderators and viewers, all - with audio.

2. Moderator: click on the cog wheel icon in the user list, select "Lock viewers".

3. Moderator: "Lock viewers" modal should appear.

4. Moderator: toggle "Share microphone" (it becomes "Locked"), click "Apply".

5. All users should see "Viewers' microphones are disabled" notification.

6. Nothing should change for moderators, mute/unmute button should disappear for viewers.

7. Moderator: demote another moderator (click on the user name in the user list and select "Demote to viewer").

8. Demoted moderator: mute/unmute button should disappear.

9. Moderator: promote a viewer (click on the user name in the user list and select "Promote to moderator").

10. Promoted viewer: mute/unmute button should appear and it should be possible to mute/unmute.

11. Join meeting as moderator.

12. New moderator: should be able to mute/unmute.

13. Join meeting as viewer.

14. New viewer: mute/unmute button shouldn't appear.

15. Moderator: click on the cog wheel icon in the user list, select "Lock viewers".

16. Moderator: "Lock viewers" modal should appear.

17. Moderator: toggle "Share microphone" (it becomes "Unlocked"), click "Apply".

18. All users should see "Viewers' microphones are enabled" notification.

19. All users should be able to join audio or mute/unmute now.

### Public chat

1. Join meeting with moderators and viewers.

2. Moderator: click on the cog wheel icon in the user list, select "Lock viewers".

3. Moderator: "Lock viewers" modal should appear.

4. Moderator: toggle "Send Public chat messages" (it becomes "Locked"), click "Apply".

5. All users should see "Public chat is disabled" notification.

6. Nothing should change for moderators, they should still be able to send public chat messages. Viewers should see the public chat textbox disabled and "Chat is locked, messages can't be sent" text below the textbox.

7. Moderator: demote another moderator (click on the user name in the user list and select "Demote to viewer").

8. Demoted moderator: should see the public chat textbox disabled and "Chat is locked, messages can't be sent" text below the textbox.

9. Moderator: promote a viewer (click on the user name in the user list and select "Promote to moderator").

10. Promoted viewer: should be able to send public chat messages.

11. Join meeting as moderator.

12. New moderator: should be able to send public chat messages.

13. Join meeting as viewer.

14. New viewer: should see the public chat textbox disabled and "Chat is locked, messages can't be sent" text below the textbox.

15. Moderator: click on the cog wheel icon in the user list, select "Lock viewers".

16. Moderator: "Lock viewers" modal should appear.

17. Moderator: toggle "Send Public chat messages" (it becomes "Unlocked"), click "Apply".

18. All users should see "Public chat is enabled" notification.

19. All users should be able to send public chat messages now.

### Private chat

1. Join meeting with moderators and viewers.

2. Start private chats between viewer and viewer, moderator and viewer, moderator and moderator.

3. Moderator: click on the cog wheel icon in the user list, select "Lock viewers".

4. Moderator: "Lock viewers" modal should appear.

5. Moderator: toggle "Send Private chat messages" (it becomes "Locked"), click "Apply".

6. All users should see "Private chat is disabled" notification.

7. Nothing should be changed for moderators and for the private chats between viewer and moderator. Viewers shouldn't be able to send private messages to other viewers (textbox disabled). Viewers should still be able to send private messages to moderators.

8. Moderator: demote another moderator (click on the user name in the user list and select "Demote to viewer").

9. Demoted moderator: shouldn't be able to send private chat messages to viewrs.

10. Moderator: promote a viewer (click on the user name in the user list and select "Promote to moderator").

11. Promoted viewer: should be able to send private chat messages to viewers and moderators.

12. Moderator: click on the cog wheel icon in the user list, select "Lock viewers".

13. Moderator: "Lock viewers" modal should appear.

14. Moderator: toggle "Send Private chat messages" (it becomes "Unlocked"), click "Apply".

15. All users should see "Private chat is enabled" notification.

16. All private chats should get back to normal.

### Shared notes

1. Join meeting with moderators and viewers.

2. Moderator: click on the cog wheel icon in the user list, select "Lock viewers".

3. Moderator: "Lock viewers" modal should appear.

4. Moderator: toggle "Edit Shared Notes" (it becomes "Locked"), click "Apply".

5. All users should see "Shared notes are now locked" notification.

6. Nothing should change for moderators, they should still be able to use shared notes. Viewers shouldn't be able to edit shared notes (when you click "SHared Notes", the panel opens, but the editor isn't loaded).

7. Moderator: demote another moderator (click on the user name in the user list and select "Demote to viewer").

8. Demoted moderator: shouldn't be able to edit shared notes (when you click "SHared Notes", the panel opens, but the editor isn't loaded).

9. Moderator: promote a viewer (click on the user name in the user list and select "Promote to moderator").

10. Promoted viewer: should be able to use shared notes.

11. Join meeting as moderator.

12. New moderator: should be able to use shared notes.

13. Join meeting as viewer.

14. New viewer: shouldn't be able to edit shared notes (when you click "SHared Notes", the panel opens, but the editor isn't loaded).

15. Moderator: click on the cog wheel icon in the user list, select "Lock viewers".

16. Moderator: "Lock viewers" modal should appear.

17. Moderator: toggle "Edit Shared Notes" (it becomes "Unlocked"), click "Apply".

18. All users should see "Shared notes are now enabled" notification.

19. All users should be able to use shared notes now.

### See other viewers in the Users list

1. Join meeting with moderators and viewers.

2. Moderator: click on the cog wheel icon in the user list, select "Lock viewers".

3. Moderator: "Lock viewers" modal should appear.

4. Moderator: toggle "See other viewers in the Users list" (it becomes "Locked"), click "Apply".

5. All users should see "User list is now hidden for viewers" notification.

6. Nothing should change for moderators, they should still be able to see all users in the user list. Viewers shouldn't be able to see other viewers in the user list.

7. Moderator: demote another moderator (click on the user name in the user list and select "Demote to viewer").

8. Demoted moderator: shouldn't be able to see other viewers in the user list.

9. Moderator: promote a viewer (click on the user name in the user list and select "Promote to moderator").

10. Promoted viewer: should be able to see all users in the user list.

11. Join meeting as moderator.

12. New moderator: should be able to see all users in the user list.

13. Join meeting as viewer.

14. New viewer: shouldn't be able to see other views in the user list.

15. Moderator: click on the cog wheel icon in the user list, select "Lock viewers".

16. Moderator: "Lock viewers" modal should appear.

17. Moderator: toggle "Edit Shared Notes" (it becomes "Unlocked"), click "Apply".

18. All users should see "Shared notes are now enabled" notification.

19. All users should be able to use shared notes now.

### Unlock a specific user

1. Join meeting with viewers and moderators.

2. Moderator: click on the cog wheel icon in the user list, select "Lock viewers".

3. Moderator: "Lock viewers" modal should appear.

4. Moderator: toggle one of the lock setting (it becomes "Locked"), click "Apply".

5. Moderator: click on a vewer's user name in the user list, then select "Unlock User [user name]".

6. Unlocked user: should be able to use the features that were previously unlocked.

7. Locked user: should still see the features locked.

## Chat (Public/Private)

### Public message [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/chat/chat.spec.js)

1. Join meeting with viewers and moderators.

2. Click on "Public Chat" tab (if the public chat tab was closed).

3. Type a message in the public chat's textbox.

4. Press Enter key or click "Send message" button.

5. All users should see the message.

### Private message [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/chat/chat.spec.js)

1. Join meeting with viewers and moderators.

2. Click on any available user's user name in the user list, then select "Start a private chat".

3. Private chat message panel should open.

4. Type a message in the textbox.

5. Press Enter key or click "Send message" button.

6. Another user should see the private chat message tab and a message counter notification. After clicking on the tab, user should see the private message.

### Chat Character Limit [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/chat/chat.spec.js)

1. Join meeting.

2. Enter maximum number of characters in the public chat textbox (the limit is 5,000 characters per single message).

3. Warning should appear to inform about the character limit and you shouldn't be able to send the message.

### Sending Empty chat message [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/chat/chat.spec.js)

1. Join meeting.

2. Focus on the public chat textbox. Press Enter or click "Send message" button.

3. You shouldn't be able to send an empty chat message.

Note :

- As a Presenter/Moderator(feature):
  "Save Chat/Clear Chat/Copy Chat
  (if Private Chat) += Close Private Chat Tab"

- As a Viewer(feature):
  "Save Chat/Copy Chat
  (if Private Chat) += Close Private Chat Tab"

## Polling

### Start a single-choice poll [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/polling/polling.spec.js)

1. Join meeting

2. Presenter: click on the presenter menu ("+" icon) button, select "Start a poll".

3. Presenter: Select one of the response types.

4. Presenter: you can edit the responses (modify, add new one, delete).

4. Poll popup should appear for all users except the presenter. Sound effect notification should play. Make the selection.

5. Presenter: live poll results panel should show up, indicating the overall results and how each user responded.

5. Presenter: click "Publish poll".

6. Poll results will show up in public chat and presentation area for all users.

### Start a multiple-choice poll

1. Join meeting

2. Presenter: click on the presenter menu ("+" icon) button, select "Start a poll".

3. Presenter: Select one of the response types.

4. Presenter: you can edit the responses.

5. Presenter: enable the "Allow multiple answers per" checkbox.

6. Poll popup should appear for all users except the presenter. Sound effect notification should play. Each user should be able to make multiple selections.

7. Presenter: live poll results panel should show up, indicating the overall results and how each user responded (each of the user's multiple responses should be counted).

8. Presenter: click "Publish poll".

9. Poll results will show up in public chat and presentation area for all users.

### Start an anonymous poll [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/polling/polling.spec.js)

1. Join meeting

2. Presenter: click on the presenter menu ("+" icon) button, select "Start a poll".

3. Presenter: Select one of the response types.

4. Presenter: you can edit the responses.

5. Presenter: enable "Anonymous Poll".

4. Poll popup should appear for all users except the presenter. Sound effect notification should play. Make the selection.

5. Presenter: live poll results panel should show up, without the information on how each user responded.

5. Presenter: click "Publish poll".

6. Poll results will show up in public chat and presentation area for all users.


### Custom Poll [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/polling/polling.spec.js)

1. Click on the options (+) button in the bottom left corner of the whiteboard area.

2. Click "Start a poll".

3. select Custom Poll

4. Fill the desired Poll options which is less than 5 options

5. Click Start custom poll

- A Poll shows up for all of the available users except for the Presenter
- A sound effect notification is heard to notify all of the available Viewers/Moderators that there is a Live Poll and the options to vote
  on it are available
- A live Poll Results Tab will show up to the presenter.

### Quick Poll Option [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/polling/polling.spec.js)

(Presenter feature : Choosing Quick Poll Options from the current Slide which is loaded from the Quick Poll file)

1. Click on the highlighting (+) button in the bottom left corner of the presentation screen

2. Click upload a Presentation

3. Load your Quick Poll file

4. Click upload

5. Click on the Quick Poll button highlighting in the bottom left corner of the screen next to the (+) button

6. click one of the available quick poll options available in the current presentation screen

- The chosen Poll options shows in the bottom right corner of the screen for all the users except the Presenter.

### Hiding Poll Results

(Presenter feature :Hiding Poll Results from the screen.)

1. Click on the Trash icon.

- The Poll result will disappear from the screen.

## User list settings

### Set status / Raise hand [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/user/user.spec.js)

1. Viewer: select your user icon from user list

2. From menu options choose set status

3. Set a status/raise hand.

4. Icon in the users list should update to display emoticon chosen by the user, when status is set by a user the moderator will see their user icon move to the top of the list.

### Clear status

1. Select manage users icon (cog wheel icon in users list)

2. choose clear all status icons.

3. All status icons in the users list should clear.

### Mute users

1. Moderator: select manage users icon (cog wheel icon in users list)

2. In lock viewers, select share microphone is locked.

3. Click apply.

4. All users (moderator/presenter included) who are already joined in the client with a functioning mic will be muted (if unmuted) and unable to unmute their mics. All users (moderator/presenter included) who join after setting is applied will be automatically joined listen only with no mic options available.

### Unmute users

1. Moderator: select manage users icon (cog wheel in users list)

2. In lock viewers, click share microphone to unlock in the status and click apply.

3. All users will remain muted until they unmute themselves. All users who enter after the meeting mute is removed will have the option to join with a mic

### Mute and unmute users except Presenter

(Moderator: Mute all users except for presenter)

1. Select manage users icon (cog wheel in users list)

2. Choose lock viewers and select shared microphone to locked, mute all users except for presenter.

- All users except the current presenter who are already joined in the cliend with a functioning mic will be muted (if unmuted) and unable to unmute their mics. All users who join after the setting is applied will be automatically joined listen only with no mic options available.

(Moderator: Undo mute all users except for presenter)

1. Select manage users icon (cog wheel in users list)

2. Choose lock viewers and selecting shared microphone is unlocked and undo meeting mute.

3. All users will remain muted until they unmute themselves. All users who enter after the meeting mute is removed will have the option to join with a mic

### Saving Usernames

1. Moderator: Select manage users icon (cog wheel in users list)

2. Moderator: Choose save user names.

3. Users list names will download as a TXT based document to local device.

### Shared Notes

1. Moderator: Select manage users icon (cog wheel in users list).

2. Moderator: Choose lock viewers.

3. Moderator: Lock shared notes.

4. Moderator: exit menu.

5. Viewer: Open shared notes panel.

6. Viewer: Attempt to contribute to shared notes to confirm if it's locked.

## Options menu

### Access Options Menu

1. Join meeting.

2. Click on the "Options" button in the top-right corver of the client (three dots icon).

3. Dropdown list should appear with a list of available options.

### Make Full screen

1. Click "Make fullscreen".

2. The client should got to full screen mode.

### Settings

1. Click "Settings" in the Options dropdown menu.

2. Settings modal should appear.

### Application Settings

#### A. Animations

(Inside the Settings modal)

1. Click on the [On/Off] the switch button

2.  Enable/Disable Animations
3.  click Save to Validate your new Settings

- The Animations is now Disabled/Enabled

#### B. Audio Alerts for Chat

(Inside the Settings modal)

1. Click on the [On/Off] the switch button to Enable/Disable Audio Alerts for Chat

2. Click Save to Validate your new Settings.

3. The beeps alerts for chat are now Disabled/Enabled

#### C. Popup Alerts for Chat

(Inside the Settings modal)

1. Click on the [On/Off] the switch button to Enable/Disable Popup alerts for Chat

2. Click Save to Validate your new Settings.

3. The Popup Alerts for Chat are now Disabled/Enabled.

#### D. Application Language [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/options/options.spec.js)

(Inside "Application" section of the Settings modal)

1. Click on the Application Language Options List

2. Choose a language from the dropdown list

3. Click Save to Validate your new Settings

4. The screen quickly reloads to apply the language change action

#### D. Dark Mode [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/options/options.spec.js)

(Inside "Application" section of the Settings modal)

1. Click on the [On/Off] the switch button to Enable Dark Mode

2. Click Save to Validate your new Settings.

3. Verify that the color scheme of the client changed to the dark one.

4. Click on the [On/Off] the switch button to Disable Dark Mode

5. Click Save to Validate your new Settings.

6. Verify that the color scheme of the client changed back to the default one.

#### E. Font Size

(Inside the Settings modal)

1. Click on (+) or (-) buttons to increase or decrease the font size of Presentation.

2. Click Save to Validate your new Settings.

3. The font size increases/decreases according to the set percentage.

### Data Savings Settings

(Inside the Settings modal)

#### A. Enable/Disable Webcams

1. Click on the [On/Off] the switch button to enable/disable Webcams.

2. Click Save to Validate your new Settings.

3. The Webcams should now be disabled/enabled.

#### B. Enable/Disable Desktop Sharing

1. Click on the [On/Off] the switch button to enable/disable desktop sharing.

2. Click Save to Validate your new Settings.

3. Desktop Sharing is disabled/enabled.

### Shortcut keys

#### Keyboard Shortcuts

1. Click on the Keyboard Shortcuts in the options menu.

2. Press the below keys to get the desired results.

- Alt + O ------> Open Options
- Alt + U ------> Toggle UserList
- Alt + M ------> Mute / Unmute
- Alt + J ------> Join audio
- Alt + L ------> Leave audio
- Alt + P ------> Toggle Public Chat (User list must be open)
- Alt + H ------> Hide private chat
- Alt + G ------> Close private chat
- Alt + R ------> Toggle Raise Hand
- Alt + A ------> Open actions menu
- Alt + K ------> Open debug window
- Spacebar ------> Activate Pan tool (Presenter)
- Enter ------> Toggle Full-screen (Presenter)
- Right Arrow ------> Next slide (Presenter)
- Left Arrow ------> Previous slide (Presenter)

### Leave meeting

1. Join meeting.

2. Click "Options" button in top-right corner (three dots icon).

3. Select "Leave meeting".

4. You should be disconnected from the meeting and a feedback should prompt should be displayed.

### End meeting

1. Join meeting as moderator.

2. Click "Options" button in top-right corner (three dots icon).

3. Select "End meeting" and choose "Yes".

4. All users should be kicked from meeting, meeting feedback form should appear and meeting should end.

## Guest Policy

### Always deny

1. Join meeting as moderator.

2. Moderator: click on the cog wheel icon in the user list, select "Guest policy".

3. Moderator: "Guest policy" modal should appear.

4. Moderator: choose "Always deny".

5. Try to join the meeting as moderator. Moderators should be able to join.

6. Try to join the meeting as viewer. Viewers should be denied and redirected to home page.

7. Moderator: click on the cog wheel icon in the user list, select "Guest policy".

8. Moderator: "Guest policy" modal should appear.

9. Moderator: choose "Always accept".

10. Try to join the meeting with moderator and with viewer. All users should be able to join.

### Ask moderator

1. Join meeting as moderator.

2. Moderator: click on the cog wheel icon in the user list, select "Guest policy".

3. Moderator: "Guest policy" modal should appear.

4. Moderator: choose "Ask moderator".

5. "Waiting Users" tab should appear above the user list for all moderators.

6. Moderator: click "Waiting Users" tab, the waiting users panel should open and include "Currently no pending users..." label.

7. Try to join the meeting as moderator. Moderators should be able to join bypassing lobby.

8. Try to join the meeting as viewer. You should get into a lobby screen indicating your position in the queue.

9. Moderator: the waiting users panel should be populated with the list of pending viewers and options of how to proceed (if the panel is closed, the pending users counter should appear on top of the "Waiting Users" tab).

10. Moderator: type in the textbox, press Enter or click "Send" button. The message should be visible to all waiting viewers on their lobby screens (as well as in the moderator's waiting users panel).

11. Moderator: click "Message" for a specific viewer in the list, type in the textbox, press Enter or click "Send" button. The message should appear only for that cpecific viewer.

- Click "Deny everyone". All the waiting viewers should see the message "Guest denied of joining the meeting" and should soon be redirected to the home page. All new viewers should not be effected by this, but instead they should be placed in the waiting lobby.

- Select "Remember choice" and click "Deny everyone". All the waiting viewers should see the message "Guest denied of joining the meeting" and should soon be redirected to the home page. "Always deny" option should become current in the waiting users modal and all new viewers should be redirected to the home page.

- Click "Allow everyone". All the waiting viewers should successfully join the meeting. All new viewers should not be effected by this, but instead they should be placed in the waiting lobby.

- Select "Remember choice" and click "Allow everyone". All the waiting viewers should successfully join the meeting. "Always allow" option should become current in the waiting users modal and all new viewers should be able to join bypassing the waiting lobby.

- Click "Accept" for the specific user in the waiting users panel. That viewer should be accepted into the meeting.

- Click "Deny" for the specific user in teh waiting users panel. That viewer should see the message "Guest denied of joining the meeting" and should soon be redirected to the home page.

## Recording

### Start recording notification: not in audio [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/notifications/notifications.spec.js)

1. Create a recorded meeting and join the meeting without joining audio.

2. Click on the recording indicator.

3. Verify that the toast notification about no active mic appears.

### Start recording notification: in listen only [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/notifications/notifications.spec.js)

1. Create a recorded meeting and join the meeting in listen only mode.

2. Click on the recording indicator.

3. Verify that the toast notification about no active mic appears.

### No start recording notification: in audio [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/notifications/notifications.spec.js)

1. Create a recorded meeting and join the meeting with microphone.

2. Click on the recording indicator.

3. Verify that the toast notification about no active mic doesn't appear.

### Start recording modal [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/notifications/notifications.spec.js)

1. Create a recorded meeting and join it.

2. Click on the recording indicator.

3. Verify that the start recording modal appears.

## Custom Parameters [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-tests/playwright/customparameters/customparameters.spec.js)

Client should apply custom parameters according to the descriptions from [here](/administration/customize#application-parameters).

## iFrame

## Learning Dashboard

## Layout Manager

### Choose a layout

1. Join a meeting with a webcam and at least 2 users.

2. Choose "Layout Settings Modal" in the actions dropdown.

3. Enable "Keep pushing to everyone". Select a new layout. Press "Confirm".

4. Verify that the layout changes for both you and another user.

5. Choose "Layout Settings Modal" in the actions dropdown.

6. Disable "Keep pushing to everyone". Select a new layout. Press "Confirm".

7. Verify that the layout only changes for you, but stays the same for another user.
