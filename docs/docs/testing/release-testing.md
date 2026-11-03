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

A case labeled <b>(Automated)</b> links to the Playwright spec on `v4.1.x-develop` that runs the same steps and checks the same outcome, <b>(Partially automated)</b> means the linked tests exercise the feature but leave some steps or outcomes to be checked by hand, and a case with no label (including one whose test is quarantined as `@flaky`, `@need-update` or `@known-issue`, marked `test.fixme`, or skipped on the default LiveKit audio bridge) has to be tested manually.

The <b>automated tests</b> are only a portion of the testing done before a release. Ideally they should be triggered often, for example when testing pull requests, or once a day automatically.

The <b>manual tests</b> really help to ensure release quality. They should
be performed by humans using different browsers. It is useful to have multiple
humans performing these tests together. You should plan at least an hour to perform
all of these tests.

## Presentation

### Uploading a Presentation [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/presentation/presentation.spec.ts)

1. As a moderator with the presenter role, click the "Media Area" button in the actions bar

2. In the "Media Sharing" dialog, choose "Slides" ("Upload/Manage presentations")

3. Uploading presentation options:

    - using Drag and Drop
    - Upload presentation using File Explorer ("or browse for files")

4. You should see the notification displaying the upload progress

5. Once the upload is done, select the new presentation and click "Share"

6. Presentation should appear on All Clients in sync with updates, and All Clients should see the notification with the new presentation name

### Sending presentation download link in the chat - containing the annotations [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/presentation/presentation.spec.ts)

1. Join a meeting

2. Draw some annotations on the slide

3. Click the "Media Area" button

4. In the "Media Sharing" dialog, choose "Slides" ("Upload/Manage presentations")

5. Click on "Export options" button of the current presentation

6. Click on "Send out a download link for the presentation including whiteboard annotations" button

    - You should see a notification with the upload progress displayed
    - After the upload is done, every user should be able to see a public chat message with the name of the file + "(with whiteboard annotations)" and a downloadable link below
    - This file should contain all presentation slides **including the annotations**

### Enable/Disable presentation download [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/presentation/presentation.spec.ts)

1. Join a meeting

2. Wait for the presentation to be uploaded

3. Click the "Media Area" button

4. In the "Media Sharing" dialog, choose "Slides" ("Upload/Manage presentations")

5. Click on "Export options" button of the current presentation

6. Click on "Enable download of the presentation (pdf)" button

    - A notification warning the presentation download is available should be displayed
    - A download button should be displayed in the bottom left corner
    - The downloaded file should be the original presentation, **not containing any annotations**
    - This should be available to all users in the meeting, including the ones joining after its enabled

7. Click the "Media Area" button -> "Slides" -> "Export options" of the current presentation -> click on "Disable download of the original presentation (pdf)" button

    - The presentation should not be available for download anymore

### Deleting Presentation [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/presentation/presentation.spec.ts)

1. Click the "Media Area" button

2. In the "Media Sharing" dialog, choose "Slides" ("Upload/Manage presentations")

3. Click the trash icon ("Remove presentation") of a presentation

    - The presentation is removed right away, without a confirmation step
    - The presentation deleted should not be available to selection anymore
    - If the deleted presentation was the current one, it should change to another already uploaded presentation or leave the space empty

### Uploading multiple presentations [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/presentation/presentation.spec.ts)

1. Click the "Media Area" button

2. In the "Media Sharing" dialog, choose "Slides" ("Upload/Manage presentations")

3. Select multiple presentations at once using the "or browse for files" option

    - You should see the notification displaying the upload progress

4. Once the uploads are done, select one of the new presentations and click "Share"

    - Current selected file should appear for all clients

### Deleting previously uploaded presentations

1. Presenter: open "Media Area" -> "Slides", upload two new presentations.

3. Presenter: open "Media Area" -> "Slides", delete two recently uploaded presentations.

4. Presenter: open "Media Area" -> "Slides", verify that there's only the default presentation name visible.

5. Another user: become a presenter.

6. New presenter: open "Media Area" -> "Slides", verify that there's only the default presentation name visible.

### Navigation [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/presentation/presentation.spec.ts)

1. Locate slide navigation bar

2. Select next slide (\>)

3. Select previous slide (\<)

4. Use dropdown to select a specific slide.

5. The selected slide should appear

### Zoom [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/presentation/presentation.spec.ts)

1. Zoom in (+) and out (-) by clicking in the buttons or using the scroll

2. Using the Pan tool, move document around while zoomed in.

### Draw and Pan

1. Zoom in by (+)

2. Changing pan tool to pen tool

3. Draw in the whiteboard area

4. Hold down the space while moving mouse to pan.


### Minimize/Restore Presentation [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/presentation/presentation.spec.ts)

1. Clicking on Share webcam.

2. Minimizing presentation.

    - Presentation should be minimized, the button should change to "Restore presentation"
    - If there's any camera being shared, it should filled the entire space for presentation and webcams

3. Click on "Restore presentation"

    - Presentation should be restored.

(Note : Presentation area will auto expand when the presenter engages Screen Sharing or YouTube Link Share)

### Full Screen option [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/presentation/presentation.spec.ts)

1. Click on the "Whiteboard options" button (top-right corner of the presentation area) and select "Fullscreen Presentation"

    - Application should go to full screen

2. Draw on the whiteboard

4. Select Escape key on local keyboard.

    - Application should return to normal screen

5. Click on full screen button again

    - Application should go to full screen again

6. Click on "Undo Presentation fullscreen" button

    - Application should return to normal screen again

### Snapshot of current presentation [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/presentation/presentation.spec.ts)

1. Join meeting.

2. Apply some annotations to the whiteboard.

3. Click "Whiteboard options" (top-right corner of the presentation area), select "Snapshot of current slide".

    - You should see the download starting
    - The file should contains the image of the current slide of the presentation, including the annotations applied

### Fit to width option [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/presentation/presentation.spec.ts)

1. In the presentation toolbar (bottom), click on "Fit to width" button

    - Presentation should be re-positioned to fit to width
    - Hiding chat or any sidebar content should keep presentation with fit to width

2. Click on "Fit to page" button

    - Presentation should return to normal view

### Make viewer a presenter [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/user/user.spec.ts)

1. In the users list, click the three-dot "More" button on the viewer's row

2. Select "Make presenter".

    - Viewer selected should have all presenter capabilities and presenter Icon should appear over user icon in the users list.
    - Attendees are also able to be presenter
    - All users should see the presenter icon in the user avatar

### Take presenter status [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/user/user.spec.ts)

1. After making other user presenter, click the three-dot "More" button on your own row in the users list

2. Click on "Take presenter"

    - All moderators should be able to take the presenter status from any user
    - With the default Presentation Policy ("Allow participants to present with moderator approval", in "Permissions and Policies" -> "Presentation Policy"), attendees should not be able to take presenter status: the "Media Area" button only offers them "Request presenter"

## Webcams

### Joining Webcam [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/webcam/webcam.spec.ts)

1. Click on "Share webcam" icon

    - Webcam permission needs to be granted

2. Select your webcam device in the "Camera" dropdown

3. Select the video quality in the available options in the "Quality" dropdown

4. In the "Virtual background settings" tab, select one of the default virtual backgrounds.

    - You should also be able to upload your own background image by clicking on the plus sign to the right of the default backgrounds and selecting a file.

5. In the "Webcam settings" tab, change the brightness by using the "Brightness" control

    - You should see a "Whole image" checkbox to apply the brightness in the entire webcam image

6. Click "Start sharing"

    - A small webcam video should show up and the camera share will start highlighting
    - All users should see the webcam sharing video
    - A flag should be display in the user avatar from the users list with "webcam" label

7. Click "Stop sharing webcam"

    - The webcam video should stop sharing for all users

### Make webcam fullscreen [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/webcam/webcam.spec.ts)

1. Hover over the webcam's user name, select dropdown and choose "Fullscreen webcam".

    - The webcam should appear in fullscreen only for you
    - Pressing the Esc key or top-right button should exit the fullscreen mode

### Focus/Unfocus a webcam [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/webcam/webcam.spec.ts)

1. Join meeting with at least 3 webcams.

2. Hover over one of the webcam's user name.

3. Select dropdown and choose "Focus".

    - The chosen webcam should expand (not fullscreen), while other webcams become smaller.

4. Hover over the focused webcam's user name.

5. Select dropdown and choose "Unfocus".

6. The webcams should get back to normal sizes and positions.

### Mirror webcam [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/webcam/webcam.spec.ts)

1. Join meeting with a webcam.

    - Your own webcam is shown mirrored by default.

2. Hover over the webcam's user name.

3. Select dropdown and choose "Disable webcam mirroring".

    - Webcam's stream should flip horizontally.

4. Hover over the webcam's user name.

5. Select dropdown and choose "Enable webcam mirroring".

    - Webcam's stream should get back to mirrored.

### Drag webcams [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/webcam/webcam.spec.ts)

1. Share webcams

2. Drag to middle, top or bottom.

3. Release webcams in greyed area on screen.

Webcams will be moved when mouse is released. (Note: When only one webcam is shared user can drag and drop webcam anywhere in the presentation area)

### Resizing webcams area

1. Share at least one webcam
2. Drag the bottom of the webcam window
3. Increase or Decrease the size of the webcam.

    - The webcam will be resized as per the size we want.

### Stop Sharing webcam [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/webcam/webcam.spec.ts)

1. Start sharing webcam.

2. Click "Stop sharing webcam".

    - The webcam sharing should stop and no other user should keep seeing your webcam sharing

### Pin/Unpin webcams [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/webcam/webcam.spec.ts)

1. Join meeting with at least 3 webcams.

2. Hover over the webcam's user name.

3. Select dropdown and choose "Pin".

    - That particular webcam should move to the first place among the webcams and stay there
    - The pinned webcam should be propagated to all users in the meeting
    - An "unpin" button should be displayed at the top-left of that webcam
    - Only moderators should be able to unpin other users' webcams

4. Pin another webcam 

    - The last pinned webcam should stick to the second place among the webcams

5. Hover over the webcam's user name.

6. Select dropdown and choose "Unpin"

    - That particular webcam should unpin
    - The same behavior should be done by clicking on the "Unpin" button at the top-left

### Disable self-view [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/webcam/webcam.spec.ts)

1. Join in a meeting with 2 users sharing webcams.

2. Select the webcam dropdown menu. Click on "Disable self-view"

    - You shouldn't see this option in other users' webcam menu
    - You should stop seeing your webcam video, replaced by a placeholder with the "Self-view disabled" label.
    - Other users should keep seeing you normally.

3. Select again the webcam dropdown menu. Click on "Enable self-view"

    - You should be able to see you again after enabling it

### Share camera as content [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/presentation/presentation.spec.ts)

1. Join in a meeting with 2 users.

2. As the presenter, click the "Media Area" button and choose "Share camera as content" in the "Media Sharing" dialog.

    - You should see the "Present Camera" view with the camera selection and its preview.

3. Select a camera device and click on "Share"

    - "Minimize presentation" button icon should change to a webcam. Clicking on it should minimize the webcam content.
    - Once it's shared, it should use the presentation area and not be affected by changes on presentations (e.g. delete, upload, enable download).
    - To start a normal webcam sharing, you need to first stop sharing and then click on "Share webcam" and "Start sharing".

### Ask a participant to share their camera [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/webcam/requestCamera.spec.ts)

1. Create the meeting with `allowModsToRequestCameraShare=true` and join with 2 users (a moderator and an attendee).

2. Moderator: open the user list, open the attendee's options and click "Ask to share camera".

    - The moderator should see a "Camera request sent to [user name]" notification.
    - The attendee should be prompted with "A moderator is asking you to share your camera".
    - The option should no longer be offered to the moderator while the request is pending.

3. Attendee: click "Keep camera off".

    - The prompt should close and no camera should be shared.
    - The moderator should be offered the option again.

4. Moderator: ask again. Attendee: click "Share camera".

    - The regular webcam settings modal should open (unless `skipVideoPreview` is set).
    - After "Start sharing", all users should see the attendee's webcam.
    - The option should not be offered while the attendee is sharing.

5. Moderator: ask again after the attendee stops sharing, then promote the attendee to moderator (and, in a separate run, make them the presenter) while the request is still unanswered.

    - The prompt should stay on screen through the role change and accepting it should still share the camera.

## Screenshare

### Sharing screen in Full Screen mode [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/screenshare/screenshare.spec.ts)

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

### Stop screen sharing [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/screenshare/screenshare.spec.ts)

- Click on stop sharing screen toast message

  OR

- select screen share / stop screen share icon

The screen sharing stops, a sound effect of disconnection is heard and the presentation is restored.

## Breakout rooms

### Moderators creating breakout rooms and assigning users [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/breakout/breakout.spec.ts)

1. Click "Breakout Rooms" in the left-hand sidebar.

2. The "Breakout Rooms" panel should appear.

3. Choose number of rooms and the "Duration of Breakout Rooms".

4. Two ways to assign users: Drag and drop users to the rooms or click the shuffle button ("Assigns unassigned viewers randomly to breakout rooms"; it randomly assigns viewers only).

5. Click "Start" button.

6. Viewers: invite screen should pop up. Moderators: the "Breakout Rooms" panel should list the running rooms.

7. Viewers: click "Enter the room" button, viewer should successfully join the breakout room. Moderators: in the "Breakout Rooms" panel, open a room's "Room options" menu and click "Join room", moderator should successfully join the breakout room (it opens in a new tab).

8. All the selected settings are applied to the rooms.

9. Once joined, breakout room label should appear below the user name in the user list of the main room.

10. In the main room, the "Breakout Rooms" panel should contain the timer for the rooms under "Duration of Breakout Rooms" (according to the duration that was set during the creation of the breakout rooms).

### Message to all breakout rooms [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/breakout/breakout.spec.ts)

1. Click "Breakout Rooms" in the left-hand sidebar.

2. The "Breakout Rooms" panel should appear.

5. Assign users to the room.

6. Click "Start" button.

7. Join the breakout rooms with the users.

8. Moderator: in the "Breakout Rooms" panel, click "Send message" (megaphone icon) at the bottom, type a message into the "Message all rooms" textbox and Press Enter / click the "Send message" button next to it.

9. Notification "The message has been sent to N breakout rooms" (N - number of rooms created) should appear in the main room for the user who sent the message.

    - Public chats in all the breakout rooms should get the message highlighted by a special background color.

### Viewers choosing the breakout rooms [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/breakout/breakout.spec.ts)

1. Click "Breakout Rooms" in the left-hand sidebar.

2. The "Breakout Rooms" panel should appear.

4. Choose number of rooms and duration. Open "More Options" and select the "Allow users to choose rooms" checkbox.

6. Click "Start" button.

7. Viewers: invite screen should pop up ("Choose a breakout room to join", including the rooms dropdown). Moderators: the "Breakout Rooms" panel should list the running rooms.

8. Viewers: select the room using the dropdown, click "Enter the room", viewer should successfully join the selected breakout room. Moderators: in the "Breakout Rooms" panel, open the room's "Room options" menu and click "Join room", moderator should successfully join the breakout room.

9. All the selected settings are applied to the rooms.

### Logout from a Breakout Room [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/breakout/breakout.spec.ts)

1. Join breakout room.

2. Click the "Leave" button (top-right corner) and then "Return to main room".

    - You should successfully leave the breakout room and shouldn't be redirected to the feedback screen.

### Switch between breakout rooms [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/breakout/breakout.spec.ts)

1. Create breakout rooms.

2. As moderator, in the "Breakout Rooms" panel, open a room's "Room options" menu and choose "Join room" to join specific room.

    - Moderator should successfully join the room you chose.

### End breakout rooms [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/breakout/breakout.spec.ts)

1. Join breakout room as moderator.

2. In the main room's breakout rooms control panel ("Breakout Rooms" button in the left-hand sidebar), click "Finish".

    - All of the breakout rooms should end and all users should get back to the main room
    - If users already got the audio on, they shouldn't get prompted for the audio modal

### Edit the duration of a breakout room [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/breakout/breakout.spec.ts)

1. Join breakout room as moderator.

2. In the main room's breakout rooms control panel ("Breakout Rooms" button in the left-hand sidebar), find "Duration of Breakout Rooms".

3. Change the remaining time with the "Increase breakout time" / "Decrease breakout time" arrows next to the hours, minutes and seconds.

    - The remaining time of the breakout rooms should change accordingly
    - Public chats in all of the breakout rooms should get the message saying "Breakout time is now N minutes" (N - new duration).

### Moving of users between breakout rooms [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/breakout/breakout.spec.ts)

1. Create a breakout room. Open the "Breakout Rooms" panel in the main room.

2. Drag and drop a user to a different breakout room in the panel.

    - The user should be notified about the removal and the prompt to confirm the joining of the new breakout room should appear
    - In case this user is already in a breakout, it should logout from that room and see the breakout invitation of the new one

### Exporting the breakout room's shared notes to the main room [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/breakout/breakout.spec.ts)

1. Create a breakout room with enabling "Save shared notes" (under "More Options").

2. Join a breakout room. Type something in the shared notes. End the breakout room.

    - Breakout room's shared notes should be converted to a pdf and that pdf should be available for uploading to the whiteboard

### Exporting the breakout room's whiteboard annotations to the main room [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/breakout/breakout.spec.ts)

1. Create a breakout room with enabling "Save whiteboard" (under "More Options").

2. Join a breakout room. Draw something on the whiteboard. End the breakout room.

    - Breakout room's annotations should be converted to a pdf and that pdf should be available for uploading to the whiteboard.

### Use a different presentation for each breakout room [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/breakout/breakout.spec.ts)

1. Join in a meeting with a moderator and an attendee

2. As the moderator/presenter, click the "Media Area" button, choose "Slides" and upload a new presentation file

3. Click "Breakout Rooms" in the left-hand sidebar

    - In the rooms - where the assigned users are displayed - you should see a presentation dropdown below the room's name

4. Click on the presentation dropdown in any rooms
    - you should see "current slide" option, which should set only the current slide as the breakouts' presentation
    - you should see all the uploaded files options listed. the one selected should be set as the presentation, containing all slides provided

5. Select different options for each room and click on "Create"

6. Join each user in different rooms

    - you should see the correct presentation selected displayed for each user/room

### Moderator listens to a breakout room audio [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/breakout/listenToRoom.spec.ts)

Requires the LiveKit audio bridge (the default). A viewer must be in a breakout room with audio.

1. As a moderator in the main room, join audio, open the breakout rooms panel and pick "Listen to room" from a running room's "Room options" menu.

   - a persistent notification should appear naming the room, with a "Return to main room" button
   - you should hear the breakout room's audio; the main room's audio should go silent
   - unmuting should make you audible in the breakout (its members see your talking indicator); main-room users should see you as muted
2. Mute and unmute using the main room's audio controls: the breakout side should reflect it.

3. Click "Return to main room".

   - the notification should close, main-room audio should resume, and unmuting should make you audible in the main room again
4. Pick "Join room" for a running room (it opens in a new tab), then reopen that room's options menu in the main room.

   - the listen option should be disabled and read "Can't listen: already in room"; other rooms' listen options stay enabled

## Pre-flight

The pre-flight (setup) screen is disabled by default. Enable it with `public.app.preFlight.enabled: true` in `/etc/bigbluebutton/bbb-html5.yml`, or per session with `userdata-bbb_pre_flight=true` on the join URL; when it is off, joining keeps the previous flow (straight into the meeting, with the audio modal on top).

### Setting up before joining [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/pre-flight/preFlight.spec.ts)

1. Join a session

    - The pre-flight screen should show up instead of the meeting: the setup panel on the left and the session's name with a "Join session" button on the right
    - The microphone and camera toggles should be below the preview; the camera toggle starts in `autoShareWebcam`'s state and the microphone toggle in the meeting's `muteOnStart` state
    - You should not appear in the user list for the other participants yet

2. Click the camera toggle and pick a speaker, a microphone and a camera in the setup panel

    - The camera preview should start once the camera is toggled on

3. Click "Join session"

    - You should land in the meeting with no audio modal and no video preview modal
    - The audio should be connected with the selected microphone, in the state the microphone toggle showed
    - The camera should be shared with the selected device
    - The other participants should see you in the user list and see your camera

    - If the join stalls, the "Unstable connection" screen should replace the spinner, and its "Try again" should retry the join with what the setup panel shows by then

### Joining muted and without camera [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/pre-flight/preFlight.spec.ts)

1. Join a session and, in the pre-flight screen, toggle the camera on and then off, and click the microphone toggle

    - Both toggles should end up grey and the camera preview should stop

2. Click "Join session"

    - You should land in the meeting muted, with the "Unmute" button displayed
    - No camera should be shared and the "Share webcam" button should be displayed

### Changing settings before joining [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/pre-flight/preFlight.spec.ts)

1. Join a session and, in the pre-flight screen, click "Settings" at the bottom of the setup panel

    - The same settings modal as in the meeting should open over the pre-flight, with the language dropdown on the current language

2. Pick another language, increase the font size, turn on the dark mode and click "Save"

    - The pre-flight should switch to the new language, font size and theme

3. Click "Join session"

    - The meeting should keep the language, font size and theme picked in the pre-flight
    - The "Settings" button should not be in the meeting's profile panel

### Reloading after joining

1. Join a session through the pre-flight screen, then unmute yourself

2. Reload the page

    - The pre-flight screen should show up again instead of rejoining straight away
    - The microphone toggle reflects the session's "mute on start" setting, not the state you left: check it before joining again, because that is the state that will apply

3. Click "Join session"

    - You should land back in the meeting with the audio and camera the screen showed

### Guest lobby in the pre-flight [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/pre-flight/preFlight.spec.ts)

1. Moderator: set the guest policy to "Ask moderator"

2. Guest: join the session

    - The pre-flight screen should show up with the waiting message and the position in the waiting queue on the right
    - No "Join session" button should be displayed while waiting
    - The setup panel should remain usable while waiting

3. Moderator: allow the pending guest

    - Guest: the session's name and the "Join session" button should replace the waiting message

4. Guest: click "Join session"

    - The guest should land in the meeting and show up in the user list

### Guest denial in the pre-flight [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/pre-flight/preFlight.spec.ts)

1. Moderator: set the guest policy to "Ask moderator"

2. Guest: join the session and wait in the pre-flight guest lobby

3. Moderator: deny the pending guest

    - Guest: the waiting message should be replaced by the denial screen: an "Entry denied by the moderator" badge, the message explaining it, the session's name and how long ago it started above it, and a "Leave session" button
    - The setup panel should stay where it was, with the camera preview still running if it was on
    - A line below the message should count down to the automatic exit
    - On a phone-width window, the denial should open as a dialog over the guest lobby, which stays visible behind a scrim, with the countdown and "Leave session" inside it

4. Guest: wait without clicking anything

    - After 15 seconds the guest should be taken to the session's logout URL, which carries `reasonCode=guest_deny_reason`

5. Repeat steps 1-3 and reload the guest's page before the countdown runs out

    - The denial screen should come back without the setup panel, and the browser should not ask for the microphone or camera

6. Guest: click "Leave session" before the countdown runs out

    - The guest should be taken to the same logout URL straight away

### Connection loss in the pre-flight [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/pre-flight/preFlight.spec.ts)

1. Join a session and wait in the pre-flight screen

2. Cut the network (e.g. DevTools "Offline"), then wait about 20 seconds: the socket stays open, so the client only notices once the server's heartbeat goes quiet

    - The "Unstable connection" screen should replace the session's name and the "Join session" button: a "Connection lost" badge, the message, a help link and "Try again"
    - The session's age and name should show above it
    - On a phone-width window, it should open as a dialog over the pre-flight screen

3. Restore the network

    - Once the client reconnects, the screen should go back to the "Join session" button on its own

4. Cut the network again and, once the screen is up, click "Try again"

    - The page should not reload while the browser is offline, and the screen should still clear on its own once the network is back

5. On the server, stop the GraphQL actions (`sudo systemctl stop bbb-graphql-actions`) so the join gets no answer, then click "Join session" and wait about 20 seconds. Throttling the network does not do it: the join still goes through

    - A "Joining is taking longer than expected" screen should replace the joining spinner, with the setup panel still editable

6. Mute the microphone in the panel, start the GraphQL actions again (`sudo systemctl start bbb-graphql-actions`) and click "Try again"

    - The user should join muted: the retry takes the panel as it is now

### Denied devices in the pre-flight [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/pre-flight/preFlight.spec.ts)

1. Block the microphone for the site in the browser, then join a session

    - The "One or more devices have no permission" screen should replace the "Join session" button, with a "Device issue" badge, the message, a help link and "Try again"
    - The microphone selector should be outlined in red with "Device permission pending" under it
    - If listen only is offered, "Listen only" should switch to it and bring back the "Join session" button
    - If listen only is not offered (the LiveKit default), "Continue without microphone" should bring back the "Join session" button with a line saying you will join without audio, and the microphone toggle should be off and disabled
    - Click "Join session": the user should land in the meeting without audio and without the audio modal
    - On a phone-width window, the screen should open as a dialog

2. Allow the microphone in the site settings, without reloading

    - The screen and the red outline should go away on their own

3. Block the camera for the site and turn the camera on in the pre-flight

    - The same screen should come up, with the camera selector flagged, and "Continue without camera" should turn the camera off and bring back the "Join session" button
    - Turning the camera back on and allowing it in the site settings, without reloading, should clear the screen and bring up the preview on its own

4. As a guest waiting for approval, block the microphone

    - The waiting message should stay, with the microphone selector flagged
    - Once the guest is approved, the same screen should replace the "Join session" button until it is sorted out

### Room mode panel for moderators [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/pre-flight/roomModePanel.spec.ts)

The panel needs the pre-flight on and `public.app.preFlight.roomModes.enabled: true` (or `userdata-bbb_pre_flight_room_modes=true` on the join URL).

1. Create a new session and join it as a moderator

    - Beside the setup panel, a "Room mode" panel should show the "Class" and "Meeting" cards and an illustration with a message asking you to pick a mode, with a "Start room" button
    - Pick "Class": the card should be marked, the panel should show it as the selected mode, and a "Cancel" button should come up
    - Click "Cancel": no card should be marked and the message should come back
    - Click "Start room" without picking a mode: you should land in the meeting

2. Join the same session as a viewer, with the same settings

    - The pre-flight should show the session's name and a "Join session" button, without the room mode panel

3. A session whose room mode is already set (automated only: nothing in the client sets a room mode yet)

    - A moderator joining it should not see the room mode panel

4. Repeat step 1 on a phone-width window

    - The setup panel and the room mode panel should become two tabs, "Set up devices" and "Set up room", with "Start room" reachable from both
    - There should be no "Cancel" button: picking another card changes the mode
    - Turn the camera on, then widen the window past the tablet width (1024 px) and narrow it again: the camera preview should keep running, without restarting

5. Repeat step 1 on a tablet-width window (768 px wide, portrait)

    - The screen should lay out as on a phone (step 4), across the width: the session's name on top, the two tabs, and "Start room" pinned to the bottom
    - The camera preview, on or off, should keep the phone's height and its proportion instead of stretching across the width, and the message asking for a mode should sit under the cards
    - Join the same session as a viewer in the same window size: the setup panel and the "Join session" button should stay side by side, without tabs

6. Throttle the network in the browser's developer tools and repeat step 1, picking "Class" before clicking "Start room"

    - While the room starts, the cards should look dimmed, and neither clicking another card nor the arrow keys should change the pick

7. Join a breakout room as a moderator

    - No pre-flight, and so no room mode panel, should show up in the breakout room

## Audio

### Join audio [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/audio/audio.spec.ts)

1. Join a meeting.

2. In the "Your audio settings" dialog (it opens when you join; otherwise click "Join audio" in the actions bar), allow for browser permissions (if applicable).

    - Verify if you can hear yourself in the echo test. The "Audio volume" bar should indicate the volume of your voice

3. Change the microphone and speaker using the "Microphone" and "Speaker" dropdowns (if applicable).

4. Press "Stop audio feedback" button and verify that you don't hear your audio anymore, while the "Audio volume" bar is still functional

    - Clicking that button again ("Start audio feedback") should turn on the audio feedback again

5. Click "Join audio".

    - You should be redirected to the meeting and your microphone button and avatar in the user list should indicate your mute state: muted when `muteOnStart` is enabled (the default), unmuted otherwise.

### Mute/unmute yourself [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/audio/audio.spec.ts)

1. Join a meeting.

2. In the "Your audio settings" dialog, allow for browser permissions (if applicable).

    - Verify if you can hear yourself in the echo test.

3. Click "Join audio".

    - The microphone button should indicate your mute state (muted by default, as `muteOnStart` is enabled).

4. Click the microphone button repeatedly
    - You should change between unmuted and muted states and the button should indicate it

### Leave audio [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/audio/audio.spec.ts)

1. Join meeting with audio.

2. Open the "Change audio device" menu (the arrow next to the microphone button) and click "Leave audio".

    - You should hear the disconnect sound and leave audio
    - "You have left the audio conference" notification should appear

### Listen Only Mode

1. Join a meeting.

2. In the "Your audio settings" dialog, choose "No microphone (listen only)" in the "Microphone" dropdown and click "Join audio".

    - You should be redirected to the meeting and your microphone button and user list avatar should indicate that you are in listen only mode.
    - Note: this applies to the FreeSWITCH audio bridge. The default LiveKit bridge has no dedicated listen-only mode: you join without a microphone and the microphone button keeps showing "Unmute".

### Testing microphone (echo test) [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/audio/audio.spec.ts)

1. Click "Join audio" and go through the echo test in the "Your audio settings" dialog

    - You should see 2 inputs, "Microphone" and "Speaker", for the input and output audio devices
    - You should see a volume indicator below "Audio volume". Once you select correctly and speak, a green line indicating the volume should be displayed

### Changing audio source after joining [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/audio/audio.spec.ts)

1. After joining the audio, click on the "Change audio device" button (the arrow next to the mute button)

    - You should see all available microphones and speakers listed in the menu
2.  Choose different speakers and microphone

    - The audio input and output should be changed once you click in a different one
    - To see the echo test again, you need to leave audio and rejoin

#### Joining with phone

- Joining the audio conference with a phone: The viewer should mute/unmute with the moderator's actions.

- For mute/unmute: Press the '0' key on the phone's keypad to mute/unmute (Note : In production Moderator cannot unmute other users unless enabled at the account level)

- For moderator mute/unmute dial in (select dial in from users list and choose mute/unmute) : The audio state should mute/unmute accordingly. (Note : In production Moderator cannot unmute other users unless enabled at the account level )

- Remove dial in : As a moderator click the phone number in the Users list and choose remove user. The phone hangs up and user no longer appears in the Users list

### Talking Indicator [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/audio/audio.spec.ts)

Enable Microphone : This will cause a user name to appear on left top corner of the Presentation Area whenever a User talks.

#### Muting user from Talking Indicator [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/audio/audio.spec.ts)

1.  As Moderator: Click on the name of User appearing in top left corner of the Presentation area.

    - The Talking User gets muted.

2.  As Viewer: Click on the name of User appearing in top left corner of the Presentation area.

    - The Talking User should not get muted

## Closed Captions / Transcription

Automatic transcription is disabled by default: enable it with `public.app.audioCaptions.enabled: true` in the client settings and use a browser that supports speech recognition.

### Use transcriptions

1. Join meeting as moderator.

2. In the "Your audio settings" dialog, select a language in the "Automatic transcription" select button

3. Click "Join audio"

4. Speak some words

    - On the left side of the audio/mute button, a "CC" button ("Start closed captions") should be displayed
    - Your talking indicator should have a "CC" icon on the left

5. With `public.app.audioCaptions.showInSidebarNavigation: true`, click "Transcription and Captions" in the left-hand sidebar

    - You should see the "Automatic transcription" selector with the chosen language, and the "Captions" selector, whose language tracks become available as users enable their transcription

### Live Automatic Closed Captions

1. With a selected transcription language and audio joined, speak something

2. Click on the "CC" button ("Start closed captions") next to the audio buttons when it appears (after speaking something)

    - Clicking this button should enable the live transcription, similar to subtitle
    - It should show the transcription of all users speaking in the meeting that had enabled it when joining audio

3. In the "Transcription settings" dropdown, select another language
    
    - Changing this should change your captured language

4. In the "Transcription settings" dropdown, click "OFF"

    - Your voice should stop being captured and transcribed
    - You should still be able to see other users' live transcription
    - This button should change its label to "ON". Once clicked, it should re-enabled your transcription

## Whiteboard

### Use pencil (draw) tool [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/whiteboard/whiteboard.spec.ts)

1. Join meeting with two or more users.

2. Presenter: Click "Draw" button in the whiteboard toolbar

3. Presenter: Draw on the whiteboard area.

    - All clients should see the drawing.

### Change shape tool size [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/whiteboard/whiteboard.spec.ts)

1. Join meeting with two or more users.

2. Presenter: Select a tool from the whiteboard toolbar

3. Presenter: Click on "Styles" button on the top-right bar.

4. Presenter: Change the size

    - From now on, the drawn shapes should have the size you selected
    - If you had selected a shape before opening styles menu and changing size, the selected shape should change its size

### Changing shape tool color [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/whiteboard/whiteboard.spec.ts)

1. Join meeting with two or more users.

2. Presenter: Select a tool from the whiteboard toolbar

3. Presenter: Click on "Styles" button on the top-right bar.

4. Presenter: Change the color

    - From now on, the drawn shapes should have the color you selected
    - If you had selected a shape before opening styles menu and changing color, the selected shape should change its color

### Use text tool [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/whiteboard/whiteboard.spec.ts)

1. Join meeting with two or more users.

2. Presenter: Select "Text" tool

3. Presenter: Adjust the font size and color.

4. Presenter: Create a text box on the whiteboard and type text inside. Click somewhere else on the whiteboard.

    - All clients should see the text inside a text box
    - The text should appear according to the selected font size and color
    - The text should be displayed by the time it is typed (live content)

### Undo last annotation [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/whiteboard/whiteboard.spec.ts)

1. Join meeting with two or more users.

2. Presenter: Draw any shape

3. Presenter: Click "Undo" button

    - It should also be triggered by pressing CTRL+Z
    - The last drawn shape should be removed to all users

### Multi-user whiteboard [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/presentation/presentation.spec.ts)

1. Join meeting with two or more users.

2. Presenter: click "Turn multi-user whiteboard on", the button's icon should change and the counter of the current number of viewers should appear.

    - All clients should be able to draw and see each other's changes on the whiteboard

3. Join meeting with another viewer.

    - The counter of multi-user whiteboard viewers shouldn't change
    - The recently joined viewer shouldn't be able to draw.

4. Presenter: click "Turn multi-user whiteboard off", button's icon should change back to normal. All clients shouldn't be able to draw anymore.

5. Presenter: click "Turn multi-user whiteboard on", the button's icon should change and the counter should include the recently joined viewer.

    - All clients should be able to draw and see each other's changes on the whiteboard (including the recently joined viewer).

## YouTube Video sharing

### Start YouTube video sharing

1. Join a meeting.

2. Presenter: Click the "Media Area" button.

3. Presenter: Select "Play video from link" in the "Media Sharing" dialog.

4. Presenter: The "Share an external video" view should appear. Paste a YouTube link there

    - You shouldn't be able set a video link from an unsupported URL

5. Presenter: Click "Share".

    - All clients will see the YouTube video playing in the presentation area
    - The video should be synchronized to all users in the meeting

### Volume/Skipping/Pausing

1. Join a meeting.

2. Presenter: Click the "Media Area" button.

3. Presenter: Select "Play video from link" in the "Media Sharing" dialog.

4. Presenter: The "Share an external video" view should appear. Paste a YouTube link there.

5. Presenter: Click "Share".

    - Presenter should be able to perform all the available actions on the YouTube video such as muting, increasing/decreasing the volume, pausing/resuming
    - Volume change should not be propagated to other users
    - Pausing and resuming should be propagated to other users

### Stopping Youtube Video Sharing

1. Join a meeting.

2. Presenter: Click the "Media Area" button.

3. Presenter: Select "Play video from link" in the "Media Sharing" dialog.

4. Presenter: The "Share an external video" view should appear. Paste a YouTube link there.

5. Presenter: Click "Share".

    - All clients will see the YouTube video playing in the presentation area.

6. Presenter: Click the "Media Area" button.

7. Presenter: Select "Play video from link" and click "Stop Sharing".

    - All clients will see the video disappear and the presentation visible again.

### Playing another Video

1. Join a meeting.

2. Presenter: Click the "Media Area" button.

3. Presenter: Select "Play video from link" in the "Media Sharing" dialog.

4. Presenter: The "Share an external video" view should appear. Paste a YouTube link there.

5. Presenter: Click "Share".

    - All clients will see the YouTube video playing in the presentation area.

6. Presenter: Click the "Media Area" button.

7. Presenter: Select "Play video from link" and click "Stop Sharing".

8. Presenter: Click the "Media Area" button.

9. Presenter: Select "Play video from link" in the "Media Sharing" dialog.

10. Presenter: The "Share an external video" view should appear. Paste a new YouTube link there.

11. Presenter: Click "Share".

    - All clients will see the new YouTube video playing in the presentation area.

## Shared Notes

### Using shared notes panel [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/sharednotes/blocknote/sharednotes.spec.ts)

1. Join a meeting with two or more users.

2. Click "Shared Notes" on the left-hand panel.

3. Start writing in the opened shared notes panel.

    - Notification should appear on the "Shared Notes" button for those users whose shared notes panel is closed.
    - After opening the shared notes panel, all clients should see the writing as well. The username will appear near the test that user is currently typing.

### Exporting Shared notes [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/sharednotes/blocknote/sharednotes.spec.ts)

1. Open shared notes and click "Notes options" (three dots icon in the panel header)

2. Choosing available export format ("Export notes as PDF", "Export notes as Markdown"), should work with all the formats.

3. Save as to local device

    - Share notes should export and download in the chosen format.

### Pin notes onto whiteboard [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/sharednotes/blocknote/sharednotes.spec.ts)

1. Open shared notes, write something. Click "Notes options" (three dots icon). Choose "Pin notes onto whiteboard".

    - Shared notes should appear on top of the whiteboard
    - Shared Notes button should become disabled.

2. Click "Unpin notes"
    
    - Shared notes should disappear from the whiteboard
    - You should be able to open Shared Notes again.

### Convert notes to presentation [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/sharednotes/blocknote/sharednotes.spec.ts)

1. Open shared notes, write something

2. Click "Notes options" (three dots icon)

3. Choose "Convert notes to presentation"

    - Shared notes should be converted to a presentation file and that file should be uploaded to the whiteboard

### Using shared notes formatting tools [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/sharednotes/blocknote/sharednotes.spec.ts)

1. Join a meeting with two or more users.

2. Click "Shared Notes" on the left-hand panel.

3. Use the available formatting tool (Bold, Italic, etc.).

4. Make a bulleted list.

5. Make a numbered list.

    - After opening the shared notes panel, all clients should see the text according to the formatting.

## Lock Settings

### Webcam [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/user/user.spec.ts)

1. Join meeting with moderators and viewers.

2. All users start sharing webcams.

3. Moderator: click "Permissions and Policies" at the bottom of the user list.

4. Moderator: "Permissions and Policies" modal should appear, on the "Participant Permissions" tab.

5. Moderator: uncheck "Share webcam", click "Apply".

6. "Viewers' webcams are disabled" notification should appear for all users.

7. Viewer's webcam should stop sharing and the webcam button should be disabled.

8. Join meeting with a new viewer.

9. New viewer: webcam button should be disabled.

10. Join meeting with a new moderator.

11. New moderator: should be able to share a webcam.

12. Moderator: demote another moderator (click the three-dot "More" button on the user's row in the user list and select "Demote to viewer").

13. Demoted moderator: webcam button should be disabled.

14. Moderator: promote a viewer (click the three-dot "More" button on the user's row in the user list and select "Promote to moderator").

15. Promoted viewer: should be able to share a webcam.

16. Moderator: click "Permissions and Policies" at the bottom of the user list.

17. Moderator: "Permissions and Policies" modal should appear, on the "Participant Permissions" tab.

18. Moderator: check "Share webcam" again, click "Apply".

19. Viewer: should be able to share a webcam.

20. Join meeting with a new viewer.

21. New viewer: should be able to share a webcam.

### See other viewers webcams [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/user/user.spec.ts)

1. Join meeting with moderators and viewers.

2. All users start sharing webcams.

3. Each user should see all webcams.

4. Moderator: demote another moderator (click the three-dot "More" button on the user's row in the user list and select "Demote to viewer").

5. Each user should see all webcams.

6. Moderator: promote a viewer (click the three-dot "More" button on the user's row in the user list and select "Promote to moderator").

7. Each user should see all webcams.

8. Moderator: click "Permissions and Policies" at the bottom of the user list.

9. Moderator: "Permissions and Policies" modal should appear, on the "Participant Permissions" tab.

10. Moderator: uncheck "See other participants' webcam", click "Apply".

11. All users should see "Only moderators are able to see viewers' webcams (due to lock settings)" notification.

12. Nothing should change for moderators, while viewers shouldn't be able to see other viewers' webcams (each viewer should still see own webcam).

13. Moderator: promote a viewer (click the three-dot "More" button on the user's row in the user list and select "Promote to moderator").

14. Promoted viewer: should be able to see other viewers' webcams.

15. Moderator: demote another moderator (click the three-dot "More" button on the user's row in the user list and select "Demote to viewer").

16. Demoted moderator: shouldn't be able to see other viewers' webcams (should still see own webcam).

17. Join meeting with a new viewer.

18. New viewer: shouldn't see other viewers' webcams (should still see own webcam).

19. Join meeting with a new moderator.

20. New moderator: should see all webcams.

21. Moderator: click "Permissions and Policies" at the bottom of the user list.

22. Moderator: "Permissions and Policies" modal should appear, on the "Participant Permissions" tab.

23. Moderator: check "See other participants' webcam" again, click "Apply".

24. All users should see "You can enable your webcam now, everyone will see you" notification.

25. Each user should see all webcams again.

### Microphone [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/user/user.spec.ts)

1. Join meeting with moderators and viewers, all - with audio.

2. Moderator: click "Permissions and Policies" at the bottom of the user list.

3. Moderator: "Permissions and Policies" modal should appear, on the "Participant Permissions" tab.

4. Moderator: uncheck "Share microphone", click "Apply".

5. All users should see "Viewers' microphones are disabled" notification.

6. Nothing should change for moderators, mute/unmute button should disappear for viewers.

7. Moderator: demote another moderator (click the three-dot "More" button on the user's row in the user list and select "Demote to viewer").

8. Demoted moderator: mute/unmute button should disappear.

9. Moderator: promote a viewer (click the three-dot "More" button on the user's row in the user list and select "Promote to moderator").

10. Promoted viewer: mute/unmute button should appear and it should be possible to mute/unmute.

11. Join meeting as moderator.

12. New moderator: should be able to mute/unmute.

13. Join meeting as viewer.

14. New viewer: mute/unmute button shouldn't appear.

15. Moderator: click "Permissions and Policies" at the bottom of the user list.

16. Moderator: "Permissions and Policies" modal should appear, on the "Participant Permissions" tab.

17. Moderator: check "Share microphone" again, click "Apply".

18. All users should see "Viewers' microphones are enabled" notification.

19. All users should be able to join audio or mute/unmute now.

### Public chat [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/user/user.spec.ts)

1. Join meeting with moderators and viewers.

2. Moderator: click "Permissions and Policies" at the bottom of the user list.

3. Moderator: "Permissions and Policies" modal should appear, on the "Participant Permissions" tab.

4. Moderator: uncheck "Send public messages", click "Apply".

5. All users should see "Public chat is disabled" notification.

6. Nothing should change for moderators, they should still be able to send public chat messages. Viewers should see the public chat textbox disabled and "Chat is locked, messages can't be sent" text below the textbox.

7. Moderator: demote another moderator (click the three-dot "More" button on the user's row in the user list and select "Demote to viewer").

8. Demoted moderator: should see the public chat textbox disabled and "Chat is locked, messages can't be sent" text below the textbox.

9. Moderator: promote a viewer (click the three-dot "More" button on the user's row in the user list and select "Promote to moderator").

10. Promoted viewer: should be able to send public chat messages.

11. Join meeting as moderator.

12. New moderator: should be able to send public chat messages.

13. Join meeting as viewer.

14. New viewer: should see the public chat textbox disabled and "Chat is locked, messages can't be sent" text below the textbox.

15. Moderator: click "Permissions and Policies" at the bottom of the user list.

16. Moderator: "Permissions and Policies" modal should appear, on the "Participant Permissions" tab.

17. Moderator: check "Send public messages" again, click "Apply".

18. All users should see "Public chat is enabled" notification.

19. All users should be able to send public chat messages now.

### Public chat for a specific user [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/user/user.spec.ts)

1. Join meeting with a moderator and a viewer. Do not uncheck any "Participant Permissions" setting.

2. Moderator: open the viewer's three-dot "More" menu in the user list and select "Lock public chat".

3. Viewer: should see the public chat textbox and send button disabled, while other viewers keep sending public chat messages.

4. Moderator: the viewer's row in the user list should show the "Locked" label. The moderator should still be able to send public chat messages.

5. Moderator: open the same viewer's three-dot "More" menu and select "Unlock public chat".

6. Viewer: should be able to send public chat messages again and the "Locked" label should disappear.

### Private chat [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/user/user.spec.ts)

1. Join meeting with moderators and viewers.

2. Start private chats between viewer and viewer, moderator and viewer, moderator and moderator.

3. Moderator: click "Permissions and Policies" at the bottom of the user list.

4. Moderator: "Permissions and Policies" modal should appear, on the "Participant Permissions" tab.

5. Moderator: uncheck "Send private messages", click "Apply".

6. All users should see "Private chat is disabled" notification.

7. Nothing should be changed for moderators and for the private chats between viewer and moderator. Viewers shouldn't be able to send private messages to other viewers (textbox disabled). Viewers should still be able to send private messages to moderators.

8. Moderator: demote another moderator (click the three-dot "More" button on the user's row in the user list and select "Demote to viewer").

9. Demoted moderator: shouldn't be able to send private chat messages to viewers.

10. Moderator: promote a viewer (click the three-dot "More" button on the user's row in the user list and select "Promote to moderator").

11. Promoted viewer: should be able to send private chat messages to viewers and moderators.

12. Moderator: click "Permissions and Policies" at the bottom of the user list.

13. Moderator: "Permissions and Policies" modal should appear, on the "Participant Permissions" tab.

14. Moderator: check "Send private messages" again, click "Apply".

15. All users should see "Private chat is enabled" notification.

16. All private chats should get back to normal.

### Shared notes [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/user/user.spec.ts)

1. Join meeting with moderators and viewers.

2. Moderator: click "Permissions and Policies" at the bottom of the user list.

3. Moderator: "Permissions and Policies" modal should appear, on the "Participant Permissions" tab.

4. Moderator: uncheck "Edit shared notes", click "Apply".

5. All users should see "Shared notes are now locked" notification.

6. Nothing should change for moderators, they should still be able to use shared notes. Viewers shouldn't be able to edit shared notes (when you click "Shared Notes", the panel opens, but the notes are read-only).

7. Moderator: demote another moderator (click the three-dot "More" button on the user's row in the user list and select "Demote to viewer").

8. Demoted moderator: shouldn't be able to edit shared notes (when you click "Shared Notes", the panel opens, but the notes are read-only).

9. Moderator: promote a viewer (click the three-dot "More" button on the user's row in the user list and select "Promote to moderator").

10. Promoted viewer: should be able to use shared notes.

11. Join meeting as moderator.

12. New moderator: should be able to use shared notes.

13. Join meeting as viewer.

14. New viewer: shouldn't be able to edit shared notes (when you click "Shared Notes", the panel opens, but the notes are read-only).

15. Moderator: click "Permissions and Policies" at the bottom of the user list.

16. Moderator: "Permissions and Policies" modal should appear, on the "Participant Permissions" tab.

17. Moderator: check "Edit shared notes" again, click "Apply".

18. All users should see "Shared notes are now enabled" notification.

19. All users should be able to use shared notes now.

### See other viewers in the Users list [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/user/user.spec.ts)

1. Join meeting with moderators and viewers.

2. Moderator: click "Permissions and Policies" at the bottom of the user list.

3. Moderator: "Permissions and Policies" modal should appear, on the "Participant Permissions" tab.

4. Moderator: uncheck "See other participants in the user list", click "Apply".

5. All users should see "User list is now hidden for viewers" notification.

6. Nothing should change for moderators, they should still be able to see all users in the user list. Viewers shouldn't be able to see other viewers in the user list.

7. Moderator: demote another moderator (click the three-dot "More" button on the user's row in the user list and select "Demote to viewer").

8. Demoted moderator: shouldn't be able to see other viewers in the user list.

9. Moderator: promote a viewer (click the three-dot "More" button on the user's row in the user list and select "Promote to moderator").

10. Promoted viewer: should be able to see all users in the user list.

11. Join meeting as moderator.

12. New moderator: should be able to see all users in the user list.

13. Join meeting as viewer.

14. New viewer: shouldn't be able to see other views in the user list.

15. Moderator: click "Permissions and Policies" at the bottom of the user list.

16. Moderator: "Permissions and Policies" modal should appear, on the "Participant Permissions" tab.

17. Moderator: check "See other participants in the user list" again, click "Apply".

18. All users should see "User list is now shown to viewers" notification.

19. Viewers should be able to see all users in the user list again.

### Unlock a specific user [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/user/user.spec.ts)

1. Join meeting with viewers and moderators.

2. Moderator: click "Permissions and Policies" at the bottom of the user list.

3. Moderator: "Permissions and Policies" modal should appear, on the "Participant Permissions" tab.

4. Moderator: uncheck one of the permissions, click "Apply".

5. Moderator: click the three-dot "More" button on a viewer's row in the user list, then select "Unlock [user name]".

6. Unlocked user: should be able to use the features that were previously unlocked.

7. Locked user: should still see the features locked.

## Chat

### Public message [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/chat/chat.spec.ts)

1. Join meeting with viewers and moderators.

2. Click "Messages" in the left-hand sidebar and select the "Public Chat" tab (if the public chat was closed).

3. Type a message in the public chat's textbox.

4. Press Enter key or click "Send message" button.

    - All users should see the message.

### Private message [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/chat/chat.spec.ts)

1. Join meeting with viewers and moderators.

2. In the user list, click the "Start a private chat" (chat bubble) icon on any other user's row.

3. The "Messages" panel should open on the "Private Chat with [user name]" tab.

4. Type a message in the textbox.

5. Press Enter key or click "Send message" button.

    - The other user should see the private chat message tab and a message counter notification
    - After clicking on the tab, user should see the private message.

### Chat Character Limit

1. Join meeting.

2. Enter maximum number of characters in the public chat textbox (the limit is 5,000 characters per single message).

    - Warning should appear to inform about the character limit and you shouldn't be able to send the message.

### Sending Empty chat message [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/chat/chat.spec.ts)

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

### Start a single-choice poll [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/polling/polling.spec.ts)

1. Join meeting

2. Presenter: click "Polling" in the left-hand sidebar.

3. Presenter: Select one of the response types.

4. Presenter: you can edit the responses (modify, add new one, delete), then click "Start Poll".

    - Poll popup should appear for all users except the presenter
    - Sound effect notification should play
    
5. Make the selection.

6. Presenter: live poll results panel should show up, indicating the overall results and how each user responded.

7. Presenter: click "Publish results".

    - Poll results will show up in public chat and presentation area for all users.

### Start a multiple-choice poll [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/polling/polling.spec.ts)

1. Join meeting

2. Presenter: click "Polling" in the left-hand sidebar.

3. Presenter: Select one of the response types.

4. Presenter: you can edit the responses.

5. Presenter: enable the "Allow multiple answers per respondent?" checkbox and click "Start Poll".

    - Poll popup should appear for all users except the presenter
    - Sound effect notification should play
    - Each user should be able to make multiple selections.

6. Presenter: live poll results panel should show up, indicating the overall results and how each user responded (each of the user's multiple responses should be counted).

7. Presenter: click "Publish results".

    - Poll results will show up in public chat and presentation area for all users.

### Start an anonymous poll [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/polling/polling.spec.ts)

1. Join meeting

2. Presenter: click "Polling" in the left-hand sidebar.

3. Presenter: Select one of the response types.

4. Presenter: you can edit the responses.

5. Presenter: enable "Anonymous Poll" and click "Start Poll".

    - Poll popup should appear for all users except the presenter
    - Sound effect notification should play
    
6. Make the selection.

7. Presenter: live poll results panel should show up, without the information on how each user responded.

8. Presenter: click "Publish results".

    - Poll results will show up in public chat and presentation area for all users.


### Custom Poll [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/polling/polling.spec.ts)

1. Click "Polling" in the left-hand sidebar.

2. Enable "Custom Input".

3. Write the question and the desired Poll options, which is less than 5 options, in the given format (one per line: the question, then "A. option", "B. option" and so on)

4. Click "Start Poll"

- A Poll shows up for all of the available users except for the Presenter
- A sound effect notification is heard to notify all of the available Viewers/Moderators that there is a Live Poll and the options to vote
  on it are available
- A live Poll Results Tab will show up to the presenter.

### Quick Poll Option [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/polling/polling.spec.ts)

(Presenter feature : Choosing Quick Poll Options from the current Slide which is loaded from the Quick Poll file)

1. Click the "Media Area" button in the bottom right corner of the screen

2. Choose "Slides" (upload a presentation)

3. Load your Quick Poll file

4. Once it is uploaded, select it and click "Share"

5. Click on the "Quick Poll" button in the presentation toolbar below the slide

6. click one of the available quick poll options available in the current presentation screen

- The chosen Poll options shows in the bottom right corner of the screen for all the users except the Presenter.

## User list settings

### Mute all users except presenter [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/user/user.spec.ts)

1. Moderator: open the user list ("Participants" in the left-hand sidebar)

2. Click on "Mute all users except presenter" at the bottom of the user list

    - All users except the current presenter who are already joined in the client with a functioning mic will be muted (if unmuted). Their microphones are not locked: they can unmute again
    - All moderators should be able to see and use this feature

### Saving Usernames

1. Moderator: open the user list ("Participants" in the left-hand sidebar)

2. Moderator: Click the "Save user names" (download icon) button in the user list header

    - Users list names will download as a TXT based document to local device.

## Options menu

### Access Options Menu [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/options/options.spec.ts)

1. Join meeting.

2. Click on the "Options" button in the top-right corner of the client (three dots icon).

3. Dropdown list should appear with a list of available options (by default only "Fullscreen Application"; Settings, Keyboard shortcuts and leaving the meeting are reached as described below).

### Make Full screen

1. Click "Fullscreen Application".

2. The client should got to full screen mode.

### Settings [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/notifications/notifications.spec.ts)

1. Click "Settings" at the bottom of the left-hand sidebar (it is no longer in the Options dropdown menu).

2. Settings modal should appear, with the "Application Settings", "Audio", "Notifications", "Data savings", "Keyboard shortcuts" and "About" tabs.

### Application Settings

#### Animations

1. Click on the [On/Off] the switch button

2.  Enable/Disable Animations
3.  click Save to Validate your new Settings

    - The Animations is now Disabled/Enabled

#### Dark Mode [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/options/options.spec.ts)

1. Click on the [On/Off] the switch button to Enable Dark Mode

2. Click Save to Validate your new Settings.

3. Verify that the color scheme of the client changed to the dark one.

4. Click on the [On/Off] the switch button to Disable Dark Mode

5. Click Save to Validate your new Settings.

6. Verify that the color scheme of the client changed back to the default one.

#### Auto hide whiteboard toolbar

1. Click on the [On/Off] the switch button

    - when enabled, all the whiteboard toolbars (options, styles and tools toolbar) will be hidden after a while without hovering over the slide

#### Disable self-view (all cameras)

1. Click on the [On/Off] the switch button

    - when enabled, all cameras you share will be disabled for self-view

#### Auto close the reactions bar

1. Click on the [On/Off] the switch button

    - after using a reaction or raising your hand, the reactions bar should close

#### Application Language [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/options/options.spec.ts)

1. Click on the Application Language Options List

2. Choose a language from the dropdown list

3. Click Save to Validate your new Settings

4. The screen quickly reloads to apply the language change action

#### Font Size [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/options/options.spec.ts)


1. Click on (+) or (-) buttons to increase or decrease the font size of Presentation.

2. Click Save to Validate your new Settings.

3. The font size increases/decreases according to the set percentage.

### Audio

#### Microphone audio processing [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/options/audioProcessingMode.spec.ts)

1. Open the "Audio" tab of the Settings.

    - You should see the "Microphone audio processing" options "Standard Filtering" (selected by default) and "Original Audio", plus "Advanced Filtering" when it is enabled on the server (disabled with "Not supported by your browser." where the browser cannot run it)

2. Join audio with microphone, choose another option and click Save to Validate your new Settings.

    - Your microphone should stay connected and keep its mute state
    - Other users should hear the difference: "Standard Filtering" and "Advanced Filtering" reduce background noise, "Original Audio" transmits your sound without any processing

### Notifications

#### Audio Alerts

1. There should be a switch button for each notification:
    - Chat message
    - User join
    - User leave
    - Raise hand (moderators only)

2. Enabling them, you should hear an alert sound every time an event is triggered

#### Popup Alerts

1. There should be a switch button for each notification:
    - Chat message [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/notifications/notifications.spec.ts)
    - User join [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/notifications/notifications.spec.ts)
    - User leave
    - Raise hand (moderators only) [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/notifications/notifications.spec.ts)

2. Enabling them, you should see a notification every time an event is triggered

### Data Savings Settings

#### A. Enable/Disable other participants webcams [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/options/options.spec.ts)

1. Click on the [On/Off] the switch button to enable/disable Webcams.

2. Click Save to Validate your new Settings.

    - The Webcams should now be disabled/enabled.

#### B. Enable/Disable other participants desktop sharing [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/options/options.spec.ts)

1. Click on the [On/Off] the switch button to enable/disable desktop sharing.

2. Click Save to Validate your new Settings.

    - Desktop Sharing is disabled/enabled.

### Shortcut keys

#### Keyboard Shortcuts [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/parameters/parameters.spec.ts)

1. Open the "Keyboard shortcuts" tab of the Settings.

2. Press the below keys to get the desired results.

- Alt + O ------> Open Options
- Alt + U ------> Toggle UserList
- Alt + X ------> Open leave meeting menu
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

### Leave meeting [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/user/user.spec.ts)

1. Join meeting.

2. Click the "Leave" button in top-right corner.

3. Select "Leave session".

    - You should be disconnected from the meeting and a feedback should prompt should be displayed.

### End meeting [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/user/user.spec.ts)

1. Join meeting as moderator.

2. Click the "Leave" button in top-right corner

3. Select "End session for all" and confirm with "End session for all users"

    - Only moderators should be able to end meetings
    - All users should be kicked from meeting, meeting feedback form should appear and meeting should end

## Guest Policy

### Always deny [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/user/user.spec.ts)

1. Join meeting as moderator.

2. Moderator: click "Permissions and Policies" at the bottom of the user list, select the "Guest Policy" tab.

3. Moderator: the "Guest Policy" options should appear.

4. Moderator: choose "Always deny" in the dropdown and click "Apply".

5. Try to join the meeting as moderator

    - Moderators should be able to join

6. Try to join the meeting as viewer

    - Viewers should be automatically denied and redirected to home page

### Ask moderator [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/user/user.spec.ts)

1. Join meeting as moderator.

2. Moderator: click "Permissions and Policies" at the bottom of the user list, select the "Guest Policy" tab.

3. Moderator: the "Guest Policy" options should appear.

4. Moderator: choose "Ask moderator" in the dropdown and click "Apply".

5. Waiting users should appear inline in the user list for all moderators.

6. Try to join the meeting as moderator

    - Moderators should be able to join bypassing lobby

7. Try to join the meeting as viewer

    - You should get into a lobby screen indicating your position in the queue

8. Moderator: the user list should show separate "Waiting Authenticated Users" and "Waiting Guests" sections, each with its pending-user count. Expanding a section should show its users and queue-specific actions with the affected count in their labels. The global "Allow everyone" and "Deny everyone" actions should appear only when both queues contain users, also with the total affected count. Searching should filter the visible rows while keeping both queue headers, full counts, and bulk-action scopes unchanged.

9. Moderator: click "Permissions and Policies" at the bottom of the user list, select "Guest Policy", enable "Message to the guests' lobby", type the message, and press Enter or click "Send". The message should be visible to all waiting viewers on their lobby screens.

10. Moderator: click "Message" for a specific viewer in the list, type in the textbox, press Enter or click "Send" button. The message should appear only for that specific viewer.

    - Click the global "Deny everyone" action. All the waiting viewers should see the message "Guest denied of joining the meeting" and should soon be redirected to the home page. All new viewers should not be affected by this, but instead they should be placed in the waiting lobby.

    - Select "Remember choice" and click the global "Deny everyone" action. All the waiting viewers should see the message "Guest denied of joining the meeting" and should soon be redirected to the home page. "Always deny" should become the active Guest Policy setting, and all new viewers should be redirected to the home page.

    - Click the global "Allow everyone" action. All the waiting viewers should successfully join the meeting. All new viewers should not be affected by this, but instead they should be placed in the waiting lobby.

    - Select "Remember choice" and click the global "Allow everyone" action. All the waiting viewers should successfully join the meeting. "Always accept" should become the active Guest Policy setting, and all new viewers should be able to join bypassing the waiting lobby.

    - Click "Accept" for the specific user in the waiting users panel. That viewer should be accepted into the meeting.

    - Click "Deny" for the specific user in the waiting users panel. That viewer should see the message "Guest denied of joining the meeting" and should soon be redirected to the home page.

## Reactions bar

### Use a reaction [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/user/user.spec.ts)

1. Join in a meeting with 2 users

2. Click on the "Share a reaction" button below presentation

    - You should be able to see a set of buttons with emojis and a "Remove reaction" button

3. Click on any emoji

    - The other user should see the emoji you reacted in your user avatar in the user list
    - The reaction should keep displayed for a while
    - The reaction should be removed once you click "Remove reaction"
    - The reaction should be changed once you click in a different emoji
    - if the `emojiRain` setting is enabled, all users should see an animated rain of emojis from their reactions button on every reaction 

### Raise / Lower your hand  [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/user/user.spec.ts)

1. Join in a meeting with 2 users

2. Click on the "Raise your hand" button below presentation (next to "Share a reaction")

    - All users should see a notification saying that you raised your hand
    - Your avatar should be changed for every users' user list
    - The button label should be changed to "Lower your hand"

3. Click on the "Lower your hand" button

    - The avatar and notification should be removed
    - The button should return to its default icon
    - Any moderator should be able to lower other users' hand



## Recording

### Start recording notification: not in audio

1. Create a recorded meeting and join the meeting without joining audio.

2. Click on the recording indicator.

3. Verify that the toast notification about no active mic appears.

### Start recording notification: in listen only

1. Create a recorded meeting and join the meeting in listen only mode.

2. Click on the recording indicator.

3. Verify that the toast notification about no active mic appears.

### No start recording notification: in audio [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/notifications/notifications.spec.ts)

1. Create a recorded meeting and join the meeting with microphone.

2. Click on the recording indicator.

3. Verify that the toast notification about no active mic doesn't appear.

### Start recording modal [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/notifications/notifications.spec.ts)

1. Create a recorded meeting and join it.

2. Click on the recording indicator.

3. Verify that the start recording modal appears.

## Custom Parameters

Client should apply user metadata according to the descriptions from [here](/development/api#user-metadata-parameters).

### Override default presentation on CREATE meeting API call [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/parameters/parameters.spec.ts)

(for more information, see the documentation [here](/new-features/#override-default-presentation-on-create-via-url))

1. When creating a meeting, use the following settings (required):
```sh
preUploadedPresentation=https://dagrs.berkeley.edu/sites/default/files/2020-01/sample.pdf
preUploadedPresentationOverrideDefault=true
preUploadedPresentationName=ScientificPaper.pdf
```
2. Create and join the meeting

    - You should see the "ScientificPaper.pdf" file displayed as the default - or any other value you use in the `preUploadedPresentationName` parameter

### Set a webcam background by passing a url [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/parameters/parameters.spec.ts)

1. When creating a meeting, use `webcamBackgroundURL=https://upload.wikimedia.org/wikipedia/commons/3/35/Spartan_apple.jpg` parameter (check [here](/development/api/#get-join) for more information)

2. Join the meeting

3. Click to "Share webcam"

    - you should see the webcam settings dropdown displayed
    - in the preview video, you should see the apples image (or any image you set in the parameter) automatically set as the default background
    - you should be able to remove this background by clicking the "x" button in the background's top-right corner
    - once you start sharing, all users should see correctly the background applied


## Timer and stopwatch

### Stopwatch [(Partially automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/user/user.spec.ts)

1. Join in a meeting with 2 users (mod and attendee)

2. As the mod/presenter, click on "Timer and Stopwatch" in the left-hand sidebar

3. Click on "Stopwatch" at the top of the "Timer and Stopwatch" panel
    - You should see the stopwatch stopped, with "Start" and "Deactivate" buttons below
    - You should see a timer indicator in the top right corner of the meeting (below the session control buttons) with the current time - initially zero. While your panel is open and the stopwatch is stopped, only the other users see it
    - All moderators should be able to interact with this panel and indicator (starting, stopping, changing between stopwatch and  timer)

4. Click on "Start" button

    - The button should change its color to red and label to "Stop"
    - The timer and timer indicator should start the countdown - it's expected 1-2 seconds of difference between them
    - Timer indicator should change its color too

5. Click on "Stop" button

    - The timer should stop counting down - the indicator as well
    - The button should change its color to blue and label to "Start"

6. Click on "Start" button and then click on the timer indicator

    - You should also be able to start and stop the counting by clicking on the timer indicator

7. Click on "Deactivate" in the "Timer and Stopwatch" panel

    - Timer indicator should not be displayed anymore
    - Any active stopwatch should stop immediately, not being displayed anymore


### Timer

1. Join in a meeting with 2 users (mod and attendee)

2. As the mod/presenter, click on "Timer and Stopwatch" in the left-hand sidebar

3. The "Timer and Stopwatch" panel should open with the timer stopped, "Timer" and "Stopwatch" buttons at the top and "Deactivate" and "Start" buttons below
    - You should see a timer indicator in the top right corner of the meeting (below the session control buttons) with the current time. While your panel is open and the timer is stopped, only the other users see it
    - All moderators should be able to interact with this panel and indicator (starting, stopping, changing between stopwatch and timer)

4. Make sure "Timer" is selected (it is the default)

    - You should see 3 input fields for each hours, minutes and seconds, each with increase/decrease arrows, plus the "0:01:00", "0:05:00" and "0:10:00" presets and the "+00:30", "+01:00" and "+05:00" buttons
    - The initial value should be "00:05:00"
    - The timer indicator should be changed too

5. Click on "Start" button

    - The timer countdown should start
    - The timer indicator should start too
    - Both button background colors should be changed

6. Click on "Stop" button

    - Both button background colors should be changed
    - The timer should stop and keep its counting

7. Click on "Reset" button

    - The timer should reset to its value set in the input fields
    - If the timer is active, it should reset the values to the ones set in the input fields and it should **not** be stopped

8. Click on "Start" button and then click on the timer indicator

    - You should be able to start and stop the counting by clicking on the timer indicator

7. Click on "Deactivate" in the "Timer and Stopwatch" panel

    - Timer indicator should not be displayed anymore
    - Any active timer should stop immediately, not being displayed anymore


## Learning Dashboard [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/bigbluebutton-tests/playwright/learningdashboard/learningdashboard.spec.ts)

There are no manual steps for the Learning Analytics Dashboard: it is covered by the automated tests only (messages, time in the meeting, polls, basic information, overview and CSV download).

