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
be performed by humans using different browsers. It is useful to have multiple
humans performing these tests together. You should plan at least an hour to perform
all of these tests.

## Audio

### Join audio [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/audio/audio.spec.js)

1. Join a meeting.

2. Click microphone and allow for browser permissions (if applicable).

    - Verify if you can hear yourself in the echo test. Audio stream volume bar should indicate the volume of your voice

3. Change the microphone and speaker using the dropdowns (if applicable).

4. Press "Stop audio feedback button" and verify that you don't hear your audio anymore, while the audio stream volume bar is still functional

    - Clicking that button again should turn on the audio feedback again

5. Click "Yes".

    - You should be redirected to the meeting and your microphone button and avatar in the in the user list should indicate the you are unmuted.

### Mute/unmute yourself [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/audio/audio.spec.js)

1. Join a meeting.

2. Click microphone and allow for browser permissions (if applicable).

    - Verify if you can hear yourself in the echo test.

3. Click "Yes".

    - The microphone button should indicate the unmuted state.

4. Click the microphone button repeatedly
    - You should change between unmuted and muted states and the button should indicate it

### Leave audio [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/audio/audio.spec.js)

1. Join meeting with audio.

2. Click "Leave audio".

    - You should hear the disconnect sound and leave audio
    - "You have left audio conference" notification should appear

### Listen Only Mode [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/audio/audio.spec.js)

1. Join a meeting.

2. Click "Listen only" in the audio modal.

    - You should be redirected to the meeting and your microphone button and user list avatar should indicate that you are in listen only mode.

### Testing microphone (echo test) [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/audio/audio.spec.js)

1. Click on microphone and go through echo test

    - You should see 2 inputs for each input and output audio device
    - You should see a volume indicator down below "Your audio stream volume". Once you select correctly and speak, a green line indicating the volume should be displayed

### Changing audio source after joining [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/audio/audio.spec.js)

1. After joining the audio, click on the "Change audio settings" button aside the mute button

    - You should see all available devices listed in the dropdown
2.  Choose different speakers and microphone

    - The audio input and output should be changed once you click in a different one
    - To see the echo test again, you need to leave audio and rejoin

#### Joining with phone

- Joining the audio conference with a phone: The viewer should mute/unmute with the moderator's actions.

- For mute/unmute: Press the '0' key on the phone's keypad to mute/unmute (Note : In production Moderator cannot unmute other users unless enabled at the account level)

- For moderator mute/unmute dial in (select dial in from users list and choose mute/unmute) : The audio state should mute/unmute accordingly. (Note : In production Moderator cannot unmute other users unless enabled at the account level )

- Remove dial in : As a moderator click the phone number in the Users list and choose remove user. The phone hangs up and user no longer appears in the Users list

### Talking Indicator

Enable Microphone : This will cause a user name to appear on left top corner of the Presentation Area whenever a User talks.

#### Muting user from Talking Indicator [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/audio/audio.spec.js)

1.  As Moderator: Click on the name of User appearing in top left corner of the Presentation area.

    - The Talking User gets muted.

2.  As Viewer: Click on the name of User appearing in top left corner of the Presentation area.

    - The Talking User should not get muted

## Breakout rooms

### Moderators creating breakout rooms and assiging users [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/breakout/breakout.spec.js)

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

### Message to all breakout rooms [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/breakout/breakout.spec.js)

1. Click "Manage users" (cog wheel icon in the user list).

2. Select "Create breakout rooms".

3. "Breakout Rooms" modal should appear.

5. Assign users to the room.

6. Click "Create" button.

7. Join the breakout rooms with the users.

8. Moderator: open the breakout rooms panel (click "Breakout Rooms"), type a message into "Message all rooms" textbox and Press Enter / click "Send message" button.

9. Notification "Message was sent to N breakout rooms" (N - number of rooms created) should appear in the main room for the user who sent the message.

    - Public chats in all the breakout rooms should get the message highlighted by a special background color.

### Viewers choosing the breakout rooms [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/breakout/breakout.spec.js)

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

    - You should successfully leave the breakout room and shouldn't be redirected to the feedback screen.

### Switch between breakout rooms

1. Create breakout rooms.

2. As moderator, click on the breakout rooms control panel and choose "Ask to join" or "Join room" to join specific room.

    - Moderator should successfully join the room you chose.

### End breakout rooms [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/breakout/breakout.spec.js)

1. Join breakout room as moderator.

2. Inside the breakout rooms control panel ("Breakout Rooms" button in the left-hand panel), select the "Breakout options" dropdown and choose "End breakout rooms".

    - All of the breakout rooms should end and all users should get back to the main room
    - If users already got the audio on, they shouldn't get prompted for the audio modal

### Edit the duration of a breakout room [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/breakout/breakout.spec.js)

1. Join breakout room as moderator.

2. Inside the breakout rooms control panel ("breakout Rooms" button in the left-hand panel), select the "Breakout options" dropdown and choose "Manage duration".

3. Edit the duration and click "Apply".

    - The duration of the breakout room should reset
    - Public chats in all of the breakout rooms should get the message saying "Breakout time is now N minutes" (N - new duration).

### Moving of users between breakout rooms

1. Create a breakout room. Click on the three dots icon and choose "Manage Users".

2. Draw and drop a user to a different breakout room. Click "Apply".

    - The user should be notified about the removal and the prompt to confirm the joining of the new breakout room should appear
    - In case this user is already in a breakout, it should logout from that room and see the breakout invitation of the new one

### Exporting the breakout room's shared notes to the main room [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/breakout/breakout.spec.js)

1. Create a breakout room with enabling "Capture shared notes when breakout rooms end".

2. Join a breakout room. Type something in the shared notes. End the breakout room.

    - Breakout room's shared notes should be converted to a pdf and that pdf should be available for uploading to the whiteboard

### Exporting the breakout room's whiteboard annotations to the main room [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/breakout/breakout.spec.js)

1. Create a breakout room with enabling "Capture whiteboard when breakout rooms end".

2. Join a breakout room. Draw something on the whiteboard. End the breakout room.

    - Breakout room's annotations should be converted to a pdf and that pdf should be available for uploading to the whiteboard.

### Use a different presentation for each breakout room

1. Join in a meeting with a moderator and an attendee

2. As the moderator/presenter, click on the actions button, "Upload/Manage presentations" and upload a new presentation file

3. Click on "Create breakout rooms" in the manage users dropdown

    - In the "Manage rooms" section - where the assigned users are displayed - you should see a dropdown down below room's name

4. Click on the presentation dropdown in any rooms
    - you should see "current slide" option, which should set only the current slide as the breakouts' presentation
    - you should see all the uploaded files options listed. the one selected should be set as the presentation, containing all slides provided

5. Select different options for each room and click on "Create"

6. Join each user in different rooms

    - you should see the correct presentation selected displayed for each user/room

## Closed Captions / Transcription

### Use transcriptions

1. Join meeting as moderator.

2. Click to Join audio and select a language in "Automatic transcription" select button

3. Click on "Microphone" and then "Join audio"

4. Speak some words

    - The transcription button should appear in left-hand menu (above the shared notes) and it should indicate the chosen language
    - On the left side of the audio/mute button, a "CC" button should be displayed
    - Your talking indicator should have a "CC" icon on the left

5. Click on the "Transcription" button below public chat

    - You should see the transcription of the meeting, containing all spoken words tagged by the user name and the time
    - Every time a user stop speaking, the last spoken words should be incremented

### Transcription formatting

1. With a selected transcription language and audio joined, click on "Transcription" to open the sidebar content

    - Every time a user stop speaking, the last spoken words should be incremented
    - You should be able to apply all formatting tools available in shared notes as well, such as bold, italic, underline, order list, etc

### Live Automatic Closed Captions

1. With a selected transcription language and audio joined, click on "Transcription" to open the sidebar content

2. Click on "CC" button next to Actions button when it appears (after speaking something)

    - Clicking this button should enable the live transcription, similar to subtitle
    - It should show the transcription of all users speaking in the meeting that had enabled it when joining audio

3. In the "Transcription settings" dropdown, select another language
    
    - Changing this should change your captured language

4. In the "Transcription settings" dropdown, click "OFF"

    - Your voice should stop being captured and transcribed
    - You should still be able to see other users' live transcription
    - This button should change its label to "ON". Once clicked, it should re-enabled your transcription

## Chat

### Public message [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/chat/chat.spec.js)

1. Join meeting with viewers and moderators.

2. Click on "Public Chat" tab (if the public chat tab was closed).

3. Type a message in the public chat's textbox.

4. Press Enter key or click "Send message" button.

    - All users should see the message.

### Private message [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/chat/chat.spec.js)

1. Join meeting with viewers and moderators.

2. Click on any available user's user name in the user list, then select "Start a private chat".

3. Private chat message panel should open.

4. Type a message in the textbox.

5. Press Enter key or click "Send message" button.

    - The other user should see the private chat message tab and a message counter notification
    - After clicking on the tab, user should see the private message.

### Chat Character Limit [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/chat/chat.spec.js)

1. Join meeting.

2. Enter maximum number of characters in the public chat textbox (the limit is 5,000 characters per single message).

    - Warning should appear to inform about the character limit and you shouldn't be able to send the message.

### Sending Empty chat message [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/chat/chat.spec.js)

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

### Prevent specific user from sending public chat messages

1. Join in a meeting with a mod and and attendee

2. As the mod, click on the attendee's user list item

3. Click on the "Lock public chat" button

    - Attendee should not be able to send any new message in the public chat - textarea and send button should be disabled
    - Other users should still be able to send messages

4. Click on the locked attendee's user list item

5. Click on the "Unlock public chat" button

    - The user should get the permission back of sending messages in the public chat

## Custom Parameters [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/parameters/parameters.spec.js)

Client should apply custom parameters according to the descriptions from [here](/administration/customize#application-parameters).

### Override default presentation on CREATE meeting API call

(for more information, see the documentation [here](/new-features/#override-default-presentation-on-create-via-url))

1. When creating a meeting, use the following settings (required):
```sh
preUploadedPresentation=https://dagrs.berkeley.edu/sites/default/files/2020-01/sample.pdf
preUploadedPresentationOverrideDefault=true
preUploadedPresentationName=ScientificPaper.pdf
```
2. Create and join the meeting

    - You should see the "ScientificPaper.pdf" file displayed as the default - or any other value you use in the `preUploadedPresentationName` parameter

### Set a webcam background by passing a url

1. When creating a meeting, use `webcamBackgroundURL=https://upload.wikimedia.org/wikipedia/commons/3/35/Spartan_apple.jpg` parameter (check [here](/development/api/#get-join) for more information)

2. Join the meeting

3. Click to "Share webcam"

    - you should see the webcam settings dropdown displayed
    - in the preview video, you should see the apples image (or any image you set in the parameter) automatically set as the default background
    - you should be able to remove this background by clicking the "x" button in the background's top-right corner
    - once you start sharing, all users should see correctly the background applied

## Guest Policy

### Always deny [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/user/user.spec.js)

1. Join meeting as moderator.

2. Moderator: click on the cog wheel icon in the user list, select "Guest policy".

3. Moderator: "Guest policy" modal should appear.

4. Moderator: choose "Always deny".

5. Try to join the meeting as moderator

    - Moderators should be able to join

6. Try to join the meeting as viewer

    - Viewers should be automatically denied and redirected to home page

### Ask moderator [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/user/user.spec.js)

1. Join meeting as moderator.

2. Moderator: click on the cog wheel icon in the user list, select "Guest policy".

3. Moderator: "Guest policy" modal should appear.

4. Moderator: choose "Ask moderator".

5. "Waiting Users" tab should appear above the user list for all moderators.

6. Moderator: click "Waiting Users" tab, the waiting users panel should open and include "Currently no pending users..." label.

7. Try to join the meeting as moderator

    - Moderators should be able to join bypassing lobby

8. Try to join the meeting as viewer

    - You should get into a lobby screen indicating your position in the queue

9. Moderator: the waiting users panel should be populated with the list of pending viewers and options of how to proceed (if the panel is closed, the pending users counter should appear on top of the "Waiting Users" tab).

10. Moderator: type in the textbox, press Enter or click "Send" button. The message should be visible to all waiting viewers on their lobby screens (as well as in the moderator's waiting users panel).

11. Moderator: click "Message" for a specific viewer in the list, type in the textbox, press Enter or click "Send" button. The message should appear only for that specific viewer.

    - Click "Deny everyone". All the waiting viewers should see the message "Guest denied of joining the meeting" and should soon be redirected to the home page. All new viewers should not be effected by this, but instead they should be placed in the waiting lobby.

    - Select "Remember choice" and click "Deny everyone". All the waiting viewers should see the message "Guest denied of joining the meeting" and should soon be redirected to the home page. "Always deny" option should become current in the waiting users modal and all new viewers should be redirected to the home page.

    - Click "Allow everyone". All the waiting viewers should successfully join the meeting. All new viewers should not be effected by this, but instead they should be placed in the waiting lobby.

    - Select "Remember choice" and click "Allow everyone". All the waiting viewers should successfully join the meeting. "Always allow" option should become current in the waiting users modal and all new viewers should be able to join bypassing the waiting lobby.

    - Click "Accept" for the specific user in the waiting users panel. That viewer should be accepted into the meeting.

    - Click "Deny" for the specific user in teh waiting users panel. That viewer should see the message "Guest denied of joining the meeting" and should soon be redirected to the home page.

## Layout Manager

### Update everyone's layout [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/layouts/layouts.spec.js)

1. Join a meeting with a webcam and at least 2 users.

2. Click on "Manage layout" in the actions dropdown.

3. Select a new layout. Click on "Update".

    - The layout should change only for you, but stays the same for another user.

4. Click on "Manage layout" in the actions dropdown.

5. Select a new layout. Click on "Update everyone".

    - The layout should change for both you and another user.

### Focus on presentation [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/layouts/layouts.spec.js)

1. Join in a meeting with one user sharing webcam.

2. Click on "Manage layout" in the actions dropdown.

3. Select the "Focus on presentation" layout. Click on "Update".

    - you should see the cameras positioned down below the chat and the presentation fills all the main area.

    - Once you hide the public chat (or any sidebar content displayed), it's expected to hide the cameras as well.

### Grid layout [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/layouts/layouts.spec.js)

1. Join in a meeting with 3 users sharing webcams.

2. Click on "Manage layout" in the actions dropdown.

3. Select the "Grid layout". Click on "Update".

    - The presentation should be positioned down below the chat (or any sidebar content displayed). The cameras should be displayed in the main area.

4. Stop sharing webcam with a user.

    - A placeholder should be displayed in its place containing the user avatar.

### Smart layout [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/layouts/layouts.spec.js)

1. Join in a meeting with 2 users.

2. Click on "Manage layout" in the actions dropdown.

3. Select the "Smart layout". Click on "Update".
    - The elements should be displayed the same as the "Custom layout" if no webcams are being shared.

4. Start sharing webcam with a user.

    - In the full landscape viewport (1920xx1080), you should see the camera positioned between chat and presentation
    - In a portrait viewport, you should see the camera position above presentation
    - You should not be able to change the cameras' position by dragging and dropping
    - Changing the window width, you should the the elements automatically re-positioning themselves to the better fit of the viewport space

### Custom layout [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/layouts/layouts.spec.js)

1. Join in a meeting sharing webcam.

2. Click on "Manage layout" in the actions dropdown.

3. Select the "Custom layout". Click on "Update".

    - The webcam initially should be displayed above presentation

4. Between camera and presentation, press and drag to resize the size proportion.

    - You should see the size of presentation and webcams changing depending how much you set.

5. Drag and drop webcams to a different position.

    - You should be able to drop the cameras in the following positions:
        - aside presentation;
        - below presentation;
        - above presentation;
        - below chat (or any sidebar content displayed, e.g. shared notes, stopwatch, polling, etc)

## Learning Dashboard

## Lock Settings

### Webcam [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/user/user.spec.js)

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

### See other viewers webcams [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

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

### Microphone [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

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

### Public chat [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

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

### Private chat [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. Join meeting with moderators and viewers.

2. Start private chats between viewer and viewer, moderator and viewer, moderator and moderator.

3. Moderator: click on the cog wheel icon in the user list, select "Lock viewers".

4. Moderator: "Lock viewers" modal should appear.

5. Moderator: toggle "Send Private chat messages" (it becomes "Locked"), click "Apply".

6. All users should see "Private chat is disabled" notification.

7. Nothing should be changed for moderators and for the private chats between viewer and moderator. Viewers shouldn't be able to send private messages to other viewers (textbox disabled). Viewers should still be able to send private messages to moderators.

8. Moderator: demote another moderator (click on the user name in the user list and select "Demote to viewer").

9. Demoted moderator: shouldn't be able to send private chat messages to viewers.

10. Moderator: promote a viewer (click on the user name in the user list and select "Promote to moderator").

11. Promoted viewer: should be able to send private chat messages to viewers and moderators.

12. Moderator: click on the cog wheel icon in the user list, select "Lock viewers".

13. Moderator: "Lock viewers" modal should appear.

14. Moderator: toggle "Send Private chat messages" (it becomes "Unlocked"), click "Apply".

15. All users should see "Private chat is enabled" notification.

16. All private chats should get back to normal.

### Shared notes [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

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

### See other viewers in the Users list [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

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

### Unlock a specific user [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. Join meeting with viewers and moderators.

2. Moderator: click on the cog wheel icon in the user list, select "Lock viewers".

3. Moderator: "Lock viewers" modal should appear.

4. Moderator: toggle one of the lock setting (it becomes "Locked"), click "Apply".

5. Moderator: click on a viewer's user name in the user list, then select "Unlock User [user name]".

6. Unlocked user: should be able to use the features that were previously unlocked.

7. Locked user: should still see the features locked.

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
    - Chat message [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/notifications/notifications.spec.js)
    - User join [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/notifications/notifications.spec.js)
    - User leave
    - Raise hand (moderators only) [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/notifications/notifications.spec.js)

2. Enabling them, you should see a notification every time an event is triggered

## Options menu

### Access Options Menu

1. Join meeting.

2. Click on the "Options" button in the top-right corner of the client (three dots icon).

3. Dropdown list should appear with a list of available options.

### Make Full screen

1. Click "Make fullscreen".

2. The client should got to full screen mode.

### Settings

1. Click "Settings" in the Options dropdown menu.

2. Settings modal should appear.

### Application Settings

#### Animations

1. Click on the [On/Off] the switch button

2.  Enable/Disable Animations
3.  click Save to Validate your new Settings

    - The Animations is now Disabled/Enabled

#### Audio filters for Microphone

1. Click on the [On/Off] the switch button

2. Enable/Disable audio filters for Microphone

#### Dark Mode [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/options/options.spec.js)

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

#### Application Language [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/options/options.spec.js)

1. Click on the [On/Off] the switch button

1. Click on the Application Language Options List

2. Choose a language from the dropdown list

3. Click Save to Validate your new Settings

4. The screen quickly reloads to apply the language change action

#### Font Size [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/options/options.spec.js)

### Data Savings Settings

#### Enable/Disable other participants webcams

1. Click on the [On/Off] the switch button to enable/disable Webcams.

2. Click Save to Validate your new Settings.

    - The Webcams should now be disabled/enabled.

#### Enable/Disable other participants desktop sharing

1. Click on the [On/Off] the switch button to enable/disable desktop sharing.

2. Click Save to Validate your new Settings.

    - Desktop Sharing is disabled/enabled.

1. Click on (+) or (-) buttons to increase or decrease the font size of Presentation.

2. Click Save to Validate your new Settings.

3. The font size increases/decreases according to the set percentage.

## Presentation

### Uploading a Presentation [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. As a moderator, select Moderator/Presenter Action menu (+)

2. Choosing "Manage presentations"

3. Uploading presentation options:

    - using Drag and Drop
    - Upload presentation using File Explorer(browsing for files.)

4. You should see the notification displaying the upload progress

5. Presentation should appear on All Clients in sync with updates, and All Clients should see the notification with the new presentation name

### Sending presentation download link in the chat - containing the annotations [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. Join a meeting

2. Draw some annotations on the slide

3. Select Moderator/Presenter Action menu

4. Click on "Upload/Manage presentations"

5. Click on "Export options" button of the current presentation

6. Click on "Send out a download link for the presentation including whiteboard annotations" button

    - You should see a notification with the upload progress displayed
    - After the upload is done, every user should be able to see a public chat message with the name of the file + "(with whiteboard annotations)" and a downloadable link below
    - This file should contain all presentation slides **including the annotations**

### Enable/Disable presentation download [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. Join a meeting

2. Wait for the presentation to be uploaded

3. Select Moderator/Presenter Action menu

4. Click on "Upload/Manage presentations"

5. Click on "Export options" button of the current presentation

6. Click on "Enable download of the presentation (pdf)" button

    - A notification warning the presentation download is available should be displayed
    - A download button should be displayed in the bottom left corner
    - The downloaded file should be the original presentation, **not containing any annotations**
    - This should be available to all users in the meeting, including the ones joining after its enabled

7. Select the actions button -> click on "Upload/Manage presentations" -> "Export options" of the current presentation -> click on "Disable download of the original presentation (pdf)" button

    - The presentation should not be available for download anymore

### Deleting Presentation [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. Select Moderator/Presenter Action menu

2. Choose "Manage presentations"

3. Selecting trash icon to delete

4. Choose confirm

    - The presentation deleted should not be available to selection anymore
    - If the deleted presentation was the current one, it should change to another already uploaded presentation or leave the space empty

### Uploading multiple presentations [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. Select Moderator/Presenter Action menu

2. Choose "Manage presentation"

3. Select multiple presentations at once using Browse for files option

4. Set a current presentation

5. Select upload

    - You should see the notification displaying the upload progress
    - Current selected file should appear for all clients

### Deleting previously uploaded presentations [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. Presenter: open "Manage presentations" modal, upload two new presentations.

3. Presenter: open "Manage presentations" modal, delete two recently uploaded presentations.

4. Presenter: open "Manage presentations" modal, verify that there's only the default presentation name visible.

5. Another user: become a presenter.

6. New presenter: open "Manage presentations" modal, verify that there's only the default presentation name visible.

### Navigation [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. Locate slide navigation bar

2. Select next slide (\>)

3. Select previous slide (\<)

4. Use dropdown to select a specific slide.

5. The selected slide should appear

### Zoom [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. Zoom in (+) and out (-) by clicking in the buttons or using the scroll

2. Using the Pan tool, move document around while zoomed in.

### Draw and Pan [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. Zoom in by (+)

2. Changing pan tool to pen tool

3. Draw in the whiteboard area

4. Hold down the space while moving mouse to pan.

### Minimize/Restore Presentation [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. Clicking on Share webcam.

2. Minimizing presentation.

    - Presentation should be minimized, the button should change to "Restore presentation"
    - If there's any camera being shared, it should filled the entire space for presentation and webcams

3. Click on "Restore presentation"

    - Presentation should be restored.

(Note : Presentation area will auto expand when the presenter engages Screen Sharing or YouTube Link Share)

### Full Screen option [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. Click on the presentation options button and select "Fullscreen presentation"

    - Application should go to full screen

2. Draw on the whiteboard

4. Select Escape key on local keyboard.

    - Application should return to normal screen

5. Click on full screen button again

    - Application should go to full screen again

6. Click on "Undo Presentation fullscreen" button

    - Application should return to normal screen again

### Snapshot of current presentation [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. Join meeting.

2. Apply some annotations to the whiteboard.

3. Click "Options" (three dots icon on top-left of the presentation area), select "Snapshot of current presentation".

    - You should see the download starting
    - The file should contains the image of the current slide of the presentation, including the annotations applied

### Fit to width option [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. In the presentation toolbar (bottom), click on "Fit to width" button

    - Presentation should be re-positioned to fit to width
    - Hiding chat or any sidebar content should keep presentation with fit to width

2. Click on "Fit to page" button

    - Presentation should return to normal view

### Make viewer a presenter [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/user/user.spec.js)

1. Click viewer icon from users list

2. Selecting make presenter for the user.

    - Viewer selected should have all presenter capabilities and presenter Icon should appear over user icon in the users list.
    - Attendees are also able to be presenter
    - All users should see the presenter icon in the user avatar

### take presenter status[(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/user/user.spec.js)

1. After making other user presenter, click on this user icon form users list

2. Click on "Take presenter"

    - All moderators should be able to take the presenter status from any user
    - Attendees should not be able to take presenter status

## Screenshare

### Sharing screen in Full Screen mode [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/screenshare/screenshare.spec.js)

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

## Shared Notes

### Using shared notes panel [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/sharednotes/sharednotes.spec.js)

1. Join a meeting with two or more users.

2. Click "Shared Notes" on the left-hand panel.

3. Start writing in the opened shared notes panel.

    - Notification should appear on the "Shared Notes" button for those users whose shared notes panel is closed.
    - After opening the shared notes panel, all clients should see the writing as well. The username will appear near the test that user is currently typing.

### Exporting Shared notes [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. Selecting "export"

2. Choosing available format, should work with all the formats.

3. Save as to local device

    - Share notes should export and download in the chosen format.

### Pin notes onto whiteboard [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. Open shared notes, write something. Click the three dots icon. Choose "Pin notes onto whiteboard".

    - Shared notes should appear on top of the whiteboard
    - Shared Notes button should become disabled.

2. Click "Unpin notes"
    
    - Shared notes should disappear from the whiteboard
    - You should be able to open Shared Notes again.

### Convert notes to presentation [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. Open shared notes, write something

2. Click the three dots icon

3. Choose "Convert notes to presentation"

    - Shared notes should be converted to a presentation file and that file should be uploaded to the whiteboard

### Using shared notes formatting tools [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. Join a meeting with two or more users.

2. Click "Shared Notes" on the left-hand panel.

3. Use the available formatting tool (Bold, Italic, etc.).

4. Make a bulleted list.

5. Make a numbered list.

    - After opening the shared notes panel, all clients should see the text according to the formatting.

## Webcams

### Joining Webcam [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/webcam/webcam.spec.js)

1. Click on "Share webcam" icon

    - Webcam permission needs to be granted

2. Select your webcam device in the "Camera" dropdown

3. Select the video quality in the available options in the "Quality" dropdown

4. Select one of the default virtual backgrounds.

    - You should also be able to upload your own background image by clicking on the plus sign to the right of the default backgrounds and selecting a file.

5. Change the brightness of the background by using the brightness control below the list of background images

    - You should see a "Whole image" checkbox to apply the brightness in the entire webcam image

6. Click "Start sharing"

    - A small webcam video should show up and the camera share will start highlighting
    - All users should see the webcam sharing video
    - A flag should be display in the user avatar from the users list with "webcam" label

7. Click "Stop sharing webcam"

    - The webcam video should stop sharing for all users

### Make webcam fullscreen [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/webcam/webcam.spec.js)

1. Click the webcam's fullscreen button ("Make [user name] fullscreen") in the top-right.

    - The webcam should appear in fullscreen only for you
    - Pressing the Esc key or top-right button should exit the fullscreen mode

### Focus/Unfocus a webcam

1. Join meeting with at least 3 webcams.

2. Hover over one of the webcam's user name.

3. Select dropdown and choose "Focus".

    - The chosen webcam should expand (not fullscreen), while other webcams become smaller.

4. Hover over the focused webcam's user name.

5. Select dropdown and choose "Unfocus".

6. The webcams should get back to normal sizes and positions.

### Mirror webcam

1. Join meeting with a webcam.

2. Hover over the webcam's user name.

3. Select dropdown and choose "Mirror".

    - Webcam's stream should flip horizontally.

4. Hover over the webcam's user name.

5. Select dropdown and choose "Mirror" again.

    - Webcam's stream should get back to normal.

### Drag webcams

1. Share webcams

2. Drag to middle, top or bottom.

3. Release webcams in greyed area on screen.

Webcams will be moved when mouse is released. (Note: When only one webcam is shared user can drag and drop webcam anywhere in the presentation area)

### Resizing webcams area

1. Share at least one webcam
2. Drag the bottom of the webcam window
3. Increase or Decrease the size of the webcam.

    - The webcam will be resized as per the size we want.

### Stop Sharing webcam [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/webcam/webcam.spec.js)

1. Start sharing webcam.

2. Click "Stop sharing webcam".

    - The webcam sharing should stop and no other user should keep seeing your webcam sharing

### Pin/Unpin webcams [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/webcam/webcam.spec.js)

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

### Disable self-view [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/webcam/webcam.spec.js)

1. Join in a meeting with 2 users sharing webcams.

2. Select the webcam dropdown menu. Click on "Disable self-view"

    - You shouldn't see this option in other users' webcam menu
    - You should stop seeing your webcam video, replaced by a placeholder with the "Self-view disabled" label.
    - Other users should keep seeing you normally.

3. Select again the webcam dropdown menu. Click on "Enable self-view"

    - You should be able to see you again after enabling it

### Share camera as content [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

1. Join in a meeting with 2 users.

2. As the presenter, click on "Share camera as content" in the actions dropdown.

    - You should see the same webcam settings modal as normal sharing webcam.

3. Select a camera device and click on "Start sharing"

    - "Minimize presentation" button icon should change to a webcam. Clicking on it should minimize the webcam content.
    - Once it's shared, it should use the presentation area and not be affected by changes on presentations (e.g. delete, upload, enable download).
    - To start a normal webcam sharing, you need to first stop sharing and then click on "Share webcam" and "Start sharing".

## Polling

### Start a single-choice poll [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/polling/polling.spec.js)

1. Join meeting

2. Presenter: click on the presenter menu ("+" icon) button, select "Start a poll".

3. Presenter: Select one of the response types.

4. Presenter: you can edit the responses (modify, add new one, delete).

    - Poll popup should appear for all users except the presenter
    - Sound effect notification should play
    
5. Make the selection.

6. Presenter: live poll results panel should show up, indicating the overall results and how each user responded.

7. Presenter: click "Publish poll".

    - Poll results will show up in public chat and presentation area for all users.

### Start a multiple-choice poll [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/polling/polling.spec.js)

1. Join meeting

2. Presenter: click on the presenter menu ("+" icon) button, select "Start a poll".

3. Presenter: Select one of the response types.

4. Presenter: you can edit the responses.

5. Presenter: enable the "Allow multiple answers per" checkbox.

    - Poll popup should appear for all users except the presenter
    - Sound effect notification should play
    - Each user should be able to make multiple selections.

6. Presenter: live poll results panel should show up, indicating the overall results and how each user responded (each of the user's multiple responses should be counted).

7. Presenter: click "Publish poll".

    - Poll results will show up in public chat and presentation area for all users.

### Start an anonymous poll [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/polling/polling.spec.js)

1. Join meeting

2. Presenter: click on the presenter menu ("+" icon) button, select "Start a poll".

3. Presenter: Select one of the response types.

4. Presenter: you can edit the responses.

5. Presenter: enable "Anonymous Poll".

    - Poll popup should appear for all users except the presenter
    - Sound effect notification should play
    
6. Make the selection.

7. Presenter: live poll results panel should show up, without the information on how each user responded.

8. Presenter: click "Publish poll".

    - Poll results will show up in public chat and presentation area for all users.


### Custom Poll [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/polling/polling.spec.js)

1. Click on the options (+) button in the bottom left corner of the whiteboard area.

2. Click "Start a poll".

3. select Custom Poll

4. Fill the desired Poll options which is less than 5 options

5. Click Start custom poll

- A Poll shows up for all of the available users except for the Presenter
- A sound effect notification is heard to notify all of the available Viewers/Moderators that there is a Live Poll and the options to vote
  on it are available
- A live Poll Results Tab will show up to the presenter.

### Quick Poll Option [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/polling/polling.spec.js)

(Presenter feature : Choosing Quick Poll Options from the current Slide which is loaded from the Quick Poll file)

1. Click on the highlighting (+) button in the bottom left corner of the presentation screen

2. Click upload a Presentation

3. Load your Quick Poll file

4. Click upload

5. Click on the Quick Poll button highlighting in the bottom left corner of the screen next to the (+) button

6. click one of the available quick poll options available in the current presentation screen

- The chosen Poll options shows in the bottom right corner of the screen for all the users except the Presenter.

## Reactions bar

### Use a reaction

1. Join in a meeting with 2 users

2. Click on the "Reactions bar" button below presentation

    - You should be able to see a set of buttons with emojis and a "Raise your hand" button

3. Click on any emoji

    - The other user should see the emoji you reacted in your user avatar in the user list
    - The reaction should keep displayed for a while
    - The reaction should be removed once you click again in the emoji
    - The reaction should be changed once you click in a different emoji
    - if the `emojiRain` setting is enabled, all users should see an animated rain of emojis from their reactions button on every reaction 

### Raise / Lower your hand  [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/user/user.spec.js)

1. Join in a meeting with 2 users

2. Click on the "Reactions bar" button below presentation

    - You should be able to see a set of buttons with emojis and a "Raise your hand" button

3. Click on the "Raise your hand" button

    - All users should see a notification saying that you raised your hand
    - Your avatar should be changed for every users' user list
    - The button label should be changed to "Lower your hand"

4. Click on the reactions bar again and then click on "Lower your hand" button

    - The avatar and notification should be removed
    - The reaction bar button should return to its default icon
    - Any moderator should be able to lower other users' hand

## Recording

### Start recording notification: not in audio [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/notifications/notifications.spec.js)

1. Create a recorded meeting and join the meeting without joining audio.

2. Click on the recording indicator.

3. Verify that the toast notification about no active mic appears.

### Start recording notification: in listen only [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/notifications/notifications.spec.js)

1. Create a recorded meeting and join the meeting in listen only mode.

2. Click on the recording indicator.

3. Verify that the toast notification about no active mic appears.

### No start recording notification: in audio [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/notifications/notifications.spec.js)

1. Create a recorded meeting and join the meeting with microphone.

2. Click on the recording indicator.

3. Verify that the toast notification about no active mic doesn't appear.

### Start recording modal [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/notifications/notifications.spec.js)

1. Create a recorded meeting and join it.

2. Click on the recording indicator.

3. Verify that the start recording modal appears.

## User list settings

### Clear all reactions

1. Click on the reactions bar and react with some of the available options

2. Select manage users icon (cog wheel icon in users list)

3. Choose clear all status icons.

    - All the current reactions should be cleared

### Mute all users [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/user/user.spec.js)

1. Moderator: select manage users icon (cog wheel icon in users list)

2. Click "Mute all users"

    - All users (moderator/presenter included) who are already joined in the client with a functioning mic will be muted (if unmuted)

### Mute all users except presenter [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/user/user.spec.js)

1. Select manage users icon (cog wheel in users list)

2. Click on "Mute all users expect presenter"

    - All users except the current presenter who are already joined in the client with a functioning mic will be muted (if unmuted) and unable to unmute their mics
    - All moderators should be able to see and use this feature

### Saving Usernames [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/user/user.spec.js)

1. Moderator: Select manage users icon (cog wheel in users list)

2. Moderator: Choose "Save user names"

    - Users list names will download as a TXT based document to local device.

### Shortcut keys

#### Keyboard Shortcuts [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/parameters/parameters.spec.js)

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

    - You should be disconnected from the meeting and a feedback should prompt should be displayed.

### End meeting

1. Join meeting as moderator.

2. Click "Options" button in top-right corner (three dots icon)

3. Select "End meeting for all" and choose the red button

    - Only moderators should be able to end meetings
    - All users should be kicked from meeting, meeting feedback form should appear and meeting should end

## Stopwatch and Timer

### Stopwatch [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/user/user.spec.js)

1. Join in a meeting with 2 users (mod and attendee)

2. As the mod/presenter, click on the actions button

3. Click on "Activate timer/stopwatch"
    - You should see a new sidebar content with a timer countdown stopped, "Stopwatch" and "Timer" buttons on below the timer and "Start" and "Reset" buttons below
    - You should see a timer indicator in the top right corner of the meeting (below settings and connection status buttons) with the current time - initially zero
    - A new user list item should be displayed to all moderator with the title "TIME" and a button with "Stopwatch" or "Timer" (the one selected) with a clock icon
    - All moderators should be able to interact with this panel and indicator (starting, stopping, changing stopwatch <-> timer)

4. Click on "Start" button

    - The button should change its color to red and label to "Stop"
    - The timer and timer indicator should start the countdown - it's expected 1-2 seconds of difference between them
    - Timer indicator should change its color too

5. Click on "Stop" button

    - The timer should stop counting down - the indicator as well
    - The button should change its color to blue and label to "Start"

6. Click on "Start" button and then click on the timer indicator

    - You should also be able to start and stop the counting by clicking on the timer indicator

7. Click on the actions button and then click on "Deactivate timer/stopwatch"

    - The user list item should not be displayed anymore
    - Timer indicator should not be displayed anymore
    - Any active stopwatch should stop immediately, not being displayed anymore


### Timer [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/user/user.spec.js)

1. Join in a meeting with 2 users (mod and attendee)

2. As the mod/presenter, click on the actions button

3. Click on "Activate timer/stopwatch"
    - You should see a new sidebar content with a timer countdown stopped, "Stopwatch" and "Timer" buttons on below the timer and "Start" and "Reset" buttons below
    - You should see a timer indicator in the top right corner of the meeting (below settings and connection status buttons) with the current time - initially zero
    - A new user list item should be displayed to all moderator with the title "TIME" and a button with "Stopwatch" or "Timer" (the one selected) with a clock icon
    - All moderators should be able to interact with this panel and indicator (starting, stopping, changing stopwatch <-> timer)

4. Click on "Timer" button

    - You should see 3 input fields for each hours, minutes and seconds
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

7. Click on the actions button and then click on "Deactivate timer/stopwatch"

    - The user list item should not be displayed anymore
    - Timer indicator should not be displayed anymore
    - Any active timer should stop immediately, not being displayed anymore

## Whiteboard

### Use pencil (draw) tool [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/whiteboard/whiteboard.spec.js)

1. Join meeting with two or more users.

2. Presenter: Click "Draw" button in the whiteboard toolbar

3. Presenter: Draw on the whiteboard area.

    - All clients should see the drawing.

### Change shape tool size [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/whiteboard/whiteboard.spec.js)

1. Join meeting with two or more users.

2. Presenter: Select a tool from the whiteboard toolbar

3. Presenter: Click on "Styles" button on the top-right bar.

4. Presenter: Change the size

    - From now on, the drawn shapes should have the size you selected
    - If you had selected a shape before opening styles menu and changing size, the selected shape should change its size

### Changing shape tool color [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/whiteboard/whiteboard.spec.js)

1. Join meeting with two or more users.

2. Presenter: Select a tool from the whiteboard toolbar

3. Presenter: Click on "Styles" button on the top-right bar.

4. Presenter: Change the color

    - From now on, the drawn shapes should have the color you selected
    - If you had selected a shape before opening styles menu and changing color, the selected shape should change its color

### Use text tool [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/whiteboard/whiteboard.spec.js)

1. Join meeting with two or more users.

2. Presenter: Select "Text" tool

3. Presenter: Adjust the font size and color.

4. Presenter: Create a text box on the whiteboard and type text inside. Click somewhere else on the whiteboard.

    - All clients should see the text inside a text box
    - The text should appear according to the selected font size and color
    - The text should be displayed by the time it is typed (live content)

### Undo last annotation [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/whiteboard/whiteboard.spec.js)

1. Join meeting with two or more users.

2. Presenter: Draw any shape

3. Presenter: Click "Undo" button

    - It should also be triggered by pressing CTRL+Z
    - The last drawn shape should be removed to all users

### Multi-user whiteboard [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/whiteboard/whiteboard.spec.js)

1. Join meeting with two or more users.

2. Presenter: click "Turn multi-user whiteboard on", the button's icon should change and the counter of the current number of viewers should appear.

    - All clients should be able to draw and see each other's changes on the whiteboard

3. Join meeting with another viewer.

    - The counter of multi-user whiteboard viewers shouldn't change
    - The recently joined viewer shouldn't be able to draw.

4. Presenter: click "Turn multi-user whiteboard off", button's icon should change back to normal. All clients shouldn't be able to draw anymore.

5. Presenter: click "Turn multi-user whiteboard on", the button's icon should change and the counter should include the recently joined viewer.

    - All clients should be able to draw and see each other's changes on the whiteboard (including the recently joined viewer).

## YouTube Video sharing [(Automated)](https://github.com/bigbluebutton/bigbluebutton/blob/v2.7.x-release/bigbluebutton-tests/playwright/presentation/presentation.spec.js)

### Start YouTube video sharing

1. Join a meeting.

2. Presenter: Click on the action ("+" icon) button.

3. Presenter: Select "Share an external video".

4. Presenter: The popup modal should appear. Paste a YouTube link there

    - You shouldn't be able set a video link from an unsupported URL

5. Presenter: Click "Share a new video".

    - All clients will see the YouTube video playing in the presentation area
    - The video should be synchronized to all users in the meeting

### Volume/Skipping/Pausing

1. Join a meeting.

2. Presenter: Click on the action ("+" icon) button.

3. Presenter: Select "Share an external video".

4. Presenter: The popup modal should appear. Paste a YouTube link there.

5. Presenter: Click "Share a new video".

    - Presenter should be able to perform all the available actions on the YouTube video such as muting, increasing/decreasing the volume, pausing/resuming
    - Volume change should not be propagated to other users
    - Pausing and resuming should be propagated to other users

### Stopping Youtube Video Sharing

1. Join a meeting.

2. Presenter: Click on the action ("+" icon) button.

3. Presenter: Select "Share an external video".

4. Presenter: The popup modal should appear. Paste a YouTube link there.

5. Presenter: Click "Share a new video".

    - All clients will see the YouTube video playing in the presentation area.

6. Presenter: Click on the action ("+" icon) button.

7. Presenter: Select "Stop sharing external video".

    - All clients will see the video disappear and the presentation visible again.

### Playing another Video

1. Join a meeting.

2. Presenter: Click on the action ("+" icon) button.

3. Presenter: Select "Share an external video".

4. Presenter: The popup modal should appear. Paste a YouTube link there.

5. Presenter: Click "Share a new video".

    - All clients will see the YouTube video playing in the presentation area.

6. Presenter: Click on the action ("+" icon) button.

7. Presenter: Select "Stop sharing external video".

8. Presenter: Click on the action ("+" icon) button.

9. Presenter: Select "Share an external video".

10. Presenter: The popup modal should appear. Paste a new YouTube link there.

11. Presenter: Click "Share a new video".

    - All clients will see the new YouTube video playing in the presentation area.
