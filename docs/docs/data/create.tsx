import React from 'react';

const createEndpointTableData = [
  {
    "name": "name",
    "required": true,
    "type": "String",
    "description": (<>A name for the meeting.  This is now required as of BigBlueButton 2.4.</>)
  },
  {
    "name": "meetingID",
    "required": true,
    "type": "String",
    "description": (<>A meeting ID that can be used to identify this meeting by the 3rd-party application. <br /><br /> This must be unique to the server that you are calling: different active meetings can not have the same meeting ID. <br /><br /> If you supply a non-unique meeting ID (a meeting is already in progress with the same meeting ID), then if the other parameters in the create call are identical, the create call will succeed (but will receive a warning message in the response). The create call is idempotent: calling multiple times does not have any side effect.  This enables a 3rd-party applications to avoid checking if the meeting is running and always call create before joining each user.<br /><br /> Meeting IDs should only contain upper/lower ASCII letters, numbers, dashes, or underscores.  A good choice for the meeting ID is to generate a <a href='https://en.wikipedia.org/wiki/Globally_unique_identifier'>GUID</a> value as this all but guarantees that different meetings will not have the same meetingID.</>)
  },
  {
    "name": "attendeePW",
    "type": "String",
    "description": (<>
      <b>[DEPRECATED]</b> The password that the <a href="#join">join</a> URL can later provide as its <code className="language-plaintext highlighter-rouge">password</code> parameter to indicate the user will join as a viewer.  If no <code className="language-plaintext highlighter-rouge">attendeePW</code> is provided, the <code className="language-plaintext highlighter-rouge">create</code> call will return a randomly generated <code className="language-plaintext highlighter-rouge">attendeePW</code> password for the meeting.
      </>)
  },
  {
    "name": "moderatorPW",
    "type": "String",
    "description": (<><b>[DEPRECATED]</b> The password that will <a href="#join">join</a> URL can later provide as its <code className="language-plaintext highlighter-rouge">password</code> parameter to indicate the user will as a moderator.  if no <code className="language-plaintext highlighter-rouge">moderatorPW</code> is provided, <code className="language-plaintext highlighter-rouge">create</code> will return a randomly generated <code className="language-plaintext highlighter-rouge">moderatorPW</code> password for the meeting.</>)
  },
  {
    "name": "welcome",
    "required": false,
    "type": "String",
    "description": (<>A welcome message that gets displayed on the chat window when the participant joins. You can include keywords (<code className="language-plaintext highlighter-rouge">%%CONFNAME%%</code>, <code className="language-plaintext highlighter-rouge">%%DIALNUM%%</code>, <code className="language-plaintext highlighter-rouge">%%CONFNUM%%</code>) which will be substituted automatically.<br /><br /> This parameter overrides the default <code className="language-plaintext highlighter-rouge">defaultWelcomeMessage</code> in <code className="language-plaintext highlighter-rouge">bigbluebutton.properties</code>.<br /><br /> The welcome message has limited support for HTML formatting. Be careful about copy/pasted HTML from e.g. MS Word, as it can easily exceed the maximum supported URL length when used on a GET request.</>)
  },
  {
    "name": "dialNumber",
    "required": false,
    "type": "String",
    "description": (<>The dial access number that participants can call in using regular phone. You can set a default dial number via <code className="language-plaintext highlighter-rouge">defaultDialAccessNumber</code> in <a href="https://github.com/bigbluebutton/bigbluebutton/blob/master/bigbluebutton-web/grails-app/conf/bigbluebutton.properties">bigbluebutton.properties</a></>)
  },
  {
    "name": "voiceBridge",
    "required": false,
    "type": "String",
    "description": (<>Voice conference number for the FreeSWITCH voice conference associated with this meeting.  This must be a 5-digit number in the range 10000 to 99999.  If you <a href="/2.2/customize.html#add-a-phone-number-to-the-conference-bridge">add a phone number</a> to your BigBlueButton server, This parameter sets the personal identification number (PIN) that FreeSWITCH will prompt for a phone-only user to enter.  If you want to change this range, edit FreeSWITCH dialplan and <code className="language-plaintext highlighter-rouge">defaultNumDigitsForTelVoice</code> of <a href="https://github.com/bigbluebutton/bigbluebutton/blob/master/bigbluebutton-web/grails-app/conf/bigbluebutton.properties">bigbluebutton.properties</a>.<br /><br />The <code className="language-plaintext highlighter-rouge">voiceBridge</code> number must be different for every meeting.<br /><br />This parameter is optional. If you do not specify a <code className="language-plaintext highlighter-rouge">voiceBridge</code> number, then BigBlueButton will assign a random unused number for the meeting.<br /><br />If do you pass a <code className="language-plaintext highlighter-rouge">voiceBridge</code> number, then you must ensure that each meeting has a unique <code className="language-plaintext highlighter-rouge">voiceBridge</code> number; otherwise, reusing same <code className="language-plaintext highlighter-rouge">voiceBridge</code> number for two different meetings will cause users from one meeting to appear as phone users in the other, which will be very confusing to users in both meetings.</>)
  },
  {
    "name": "maxParticipants",
    "required": false,
    "type": "Number",
    "description": (<>Set the maximum number of users allowed to joined the conference at the same time.</>)
  },
  {
    "name": "logoutURL",
    "required": false,
    "type": "String",
    "description": (<>The URL that the BigBlueButton client will go to after users click the OK button on the ‘You have been logged out message’.  This overrides the value for <code className="language-plaintext highlighter-rouge">bigbluebutton.web.logoutURL</code> in <a href="https://github.com/bigbluebutton/bigbluebutton/blob/master/bigbluebutton-web/grails-app/conf/bigbluebutton.properties">bigbluebutton.properties</a>.</>)
  },
  {
    "name": "record",
    "required": false,
    "type": "Boolean",
    "description": (<>Setting ‘record=true’ instructs the BigBlueButton server to record the media and events in the session for later playback. The default is false.<br /><br /> In order for a playback file to be generated, a moderator must click the Start/Stop Recording button at least once during the sesssion; otherwise, in the absence of any recording marks, the record and playback scripts will not generate a playback file. See also the <code className="language-plaintext highlighter-rouge">autoStartRecording</code> and <code className="language-plaintext highlighter-rouge">allowStartStopRecording</code> parameters in <a href="https://github.com/bigbluebutton/bigbluebutton/blob/master/bigbluebutton-web/grails-app/conf/bigbluebutton.properties">bigbluebutton.properties</a>.</>)
  },
  {
    "name": "duration",
    "required": false,
    "type": "Number",
    "description": (<>The maximum length (in minutes) for the meeting.<br /><br /> Normally, the BigBlueButton server will end the meeting when either (a) the last person leaves (it takes a minute or two for the server to clear the meeting from memory) or when the server receives an <a href="#end">end</a> API request with the associated meetingID (everyone is kicked and the meeting is immediately cleared from memory).<br /><br /> BigBlueButton begins tracking the length of a meeting when it is created.  If duration contains a non-zero value, then when the length of the meeting exceeds the duration value the server will immediately end the meeting (equivalent to receiving an end API request at that moment).</>)
  },
  {
    "name": "isBreakout",
    "required": false,
    "type": "Boolean",
    "description": (<>Must be set to <code className="language-plaintext highlighter-rouge">true</code> to create a breakout room.</>)
  },
  {
    "name": "parentMeetingID",
    "required": "(required for breakout room)",
    "type": "String",
    "description": (<>Must be provided when creating a breakout room, the parent room must be running.</>)
  },
  {
    "name": "sequence",
    "required": "(required for breakout room)",
    "type": "Number",
    "description": (<>The sequence number of the breakout room.</>)
  },
  {
    "name": "freeJoin",
    "required": "(only breakout room)",
    "type": "Boolean",
    "description": (<>If set to true, the client will give the user the choice to choose the breakout rooms he wants to join.</>)
  },
  {
    "name": "breakoutRoomsEnabled",
    "required": "Optional(Breakout Room)",
    "type": "Boolean",
    "default": "true",
    "description": (<><b>[DEPRECATED]</b> Removed in 2.5, temporarily still handled, please transition to disabledFeatures.<br /><br />If set to false, breakout rooms will be disabled.</>)
  },
  {
    "name": "breakoutRoomsPrivateChatEnabled",
    "required": "Optional(Breakout Room)",
    "type": "Boolean",
    "default": "true",
    "description": (<>If set to false, the private chat will be disabled in breakout rooms.</>)
  },
  {
    "name": "breakoutRoomsRecord",
    "required": "Optional(Breakout Room)",
    "type": "Boolean",
    "default": "true",
    "description": (<>If set to false, breakout rooms will not be recorded.</>)
  },
  {
    "name": "meta",
    "required": false,
    "type": "String",
    "description": (<>This is a special parameter type (there is no parameter named just <code className="language-plaintext highlighter-rouge">meta</code>).<br /><br /> You can pass one or more metadata values when creating a meeting. These will be stored by BigBlueButton can be retrieved later via the getMeetingInfo and getRecordings calls.<br /><br /> Examples of the use of the meta parameters are <code className="language-plaintext highlighter-rouge">meta_Presenter=Jane%20Doe</code>, <code className="language-plaintext highlighter-rouge">meta_category=FINANCE</code>, and <code className="language-plaintext highlighter-rouge">meta_TERM=Fall2016</code>.</>)
  },
  {
    "name": "moderatorOnlyMessage",
    "required": false,
    "type": "String",
    "description": (<>Display a message to all moderators in the public chat.<br /><br /> The value is interpreted in the same way as the <code className="language-plaintext highlighter-rouge">welcome</code> parameter.</>)
  },
  {
    "name": "autoStartRecording",
    "required": false,
    "type": "Boolean",
    "description": (<>Whether to automatically start recording when first user joins (default <code className="language-plaintext highlighter-rouge">false</code>).<br /><br /> When this parameter is <code className="language-plaintext highlighter-rouge">true</code>, the recording UI in BigBlueButton will be initially active. Moderators in the session can still pause and restart recording using the UI control.&lt;br/<br /> NOTE: Don’t pass <code className="language-plaintext highlighter-rouge">autoStartRecording=false</code> and <code className="language-plaintext highlighter-rouge">allowStartStopRecording=false</code> - the moderator won’t be able to start recording!</>)
  },
  {
    "name": "allowStartStopRecording",
    "required": false,
    "type": "Boolean",
    "description": (<>Allow the user to start/stop recording. (default true)<br /><br /> If you set both <code className="language-plaintext highlighter-rouge">allowStartStopRecording=false</code> and <code className="language-plaintext highlighter-rouge">autoStartRecording=true</code>, then the entire length of the session will be recorded, and the moderators in the session will not be able to pause/resume the recording.</>)
  },
  {
    "name": "webcamsOnlyForModerator",
    "required": false,
    "type": "Boolean",
    "description": (<>Setting <code className="language-plaintext highlighter-rouge">webcamsOnlyForModerator=true</code> will cause all webcams shared by viewers during this meeting to only appear for moderators (added 1.1)</>)
  },
  {
    "name": "bannerText",
    "required": false,
    "type": "String",
    "description": (<>Will set the banner text in the client. (added 2.0)</>)
  },
  {
    "name": "bannerColor",
    "required": false,
    "type": "String",
    "description": (<>Will set the banner background color in the client. The required format is color hex #FFFFFF. (added 2.0)</>)
  },
  {
    "name": "muteOnStart",
    "required": false,
    "type": "Boolean",
    "description": (<>Setting <code className="language-plaintext highlighter-rouge">true</code> will mute all users when the meeting starts. (added 2.0)</>)
  },
  {
    "name": "allowModsToUnmuteUsers",
    "required": false,
    "type": "Boolean",
    "default": "false",
    "description": (<>Setting to <code className="language-plaintext highlighter-rouge">true</code> will allow moderators to unmute other users in the meeting. (added 2.2)</>)
  },
  {
    "name": "lockSettingsDisableCam",
    "required": false,
    "type": "Boolean",
    "default": "false",
    "description": (<>Setting <code className="language-plaintext highlighter-rouge">true</code> will prevent users from sharing their camera in the meeting. (added 2.2)</>)
  },
  {
    "name": "lockSettingsDisableMic",
    "required": false,
    "type": "Boolean",
    "default": "false",
    "description": (<>Setting to <code className="language-plaintext highlighter-rouge">true</code> will only allow user to join listen only. (added 2.2)</>)
  },
  {
    "name": "lockSettingsDisablePrivateChat",
    "required": false,
    "type": "Boolean",
    "default": "false",
    "description": (<>Setting to <code className="language-plaintext highlighter-rouge">true</code> will disable private chats in the meeting. (added 2.2)</>)
  },
  {
    "name": "lockSettingsDisablePublicChat",
    "required": false,
    "type": "Boolean",
    "default": "false",
    "description": (<>Setting to <code className="language-plaintext highlighter-rouge">true</code> will disable public chat in the meeting. (added 2.2)</>)
  },
  {
    "name": "lockSettingsDisableNotes",
    "required": false,
    "type": "Boolean",
    "default": "false",
    "description": (<>Setting to <code className="language-plaintext highlighter-rouge">true</code> will disable notes in the meeting. (added 2.2)</>)
  },
  {
    "name": "lockSettingsHideUserList",
    "required": false,
    "type": "Boolean",
    "default": "false",
    "description": (<>Setting to <code className="language-plaintext highlighter-rouge">true</code> will prevent viewers from seeing other viewers in the user list. (added 2.2)</>)
  },
  {
    "name": "lockSettingsLockOnJoin",
    "required": false,
    "type": "Boolean",
    "default": "true",
    "description": (<>Setting to <code className="language-plaintext highlighter-rouge">false</code> will not apply lock setting to users when they join. (added 2.2)</>)
  },
  {
    "name": "lockSettingsLockOnJoinConfigurable",
    "required": false,
    "type": "Boolean",
    "default": "false",
    "description": (<>Setting to <code className="language-plaintext highlighter-rouge">true</code> will allow applying of <code className="language-plaintext highlighter-rouge">lockSettingsLockOnJoin</code>.</>)
  },
  {
    "name": "lockSettingsHideViewersCursor",
    "required": false,
    "type": "Boolean",
    "default": "false",
    "description": (<>Setting to <code className="language-plaintext highlighter-rouge">true</code> will prevent viewers to see other viewers cursor when multi-user whiteboard is on. (added 2.5)</>)
  },
  {
    "name": "guestPolicy",
    "required": false,
    "type": "Enum",
    "default": "ALWAYS_ACCEPT",
    "description": (<>Will set the guest policy for the meeting. The guest policy determines whether or not users who send a join request with <code className="language-plaintext highlighter-rouge">guest=true</code> will be allowed to join the meeting. Possible values are ALWAYS_ACCEPT, ALWAYS_DENY, and ASK_MODERATOR.</>)
  },
  {
    "name": "keepEvents",
    "type": "Boolean",
    "deprecated": true,
    "description": (<>Removed in 2.3 in favor of <code className="language-plaintext highlighter-rouge">meetingKeepEvents</code> and bigbluebutton.properties <code className="language-plaintext highlighter-rouge">defaultKeepEvents</code>.</>)
  },
  {
    "name": "meetingKeepEvents",
    "type": "Boolean",
    "default": "false",
    "description": (<>Defaults to the value of <code className="language-plaintext highlighter-rouge">defaultKeepEvents</code>. If <code className="language-plaintext highlighter-rouge">meetingKeepEvents</code> is true BigBlueButton saves meeting events even if the meeting is not recorded (added in 2.3)</>)
  },
  {
    "name": "endWhenNoModerator",
    "type": "Boolean",
    "default": "false",
    "description": (<>Default <code className="language-plaintext highlighter-rouge">endWhenNoModerator=false</code>. If <code className="language-plaintext highlighter-rouge">endWhenNoModerator</code> is true the meeting will end automatically after a delay - see <code className="language-plaintext highlighter-rouge">endWhenNoModeratorDelayInMinutes</code> (added in 2.3)</>)
  },
  {
    "name": "endWhenNoModeratorDelayInMinutes",
    "type": "Number",
    "default": "1",
    "description": (<>Defaults to the value of <code className="language-plaintext highlighter-rouge">endWhenNoModeratorDelayInMinutes=1</code>. If <code className="language-plaintext highlighter-rouge">endWhenNoModerator</code> is true, the meeting will be automatically ended after this many minutes (added in 2.2)</>)
  },
  {
    "name": "meetingLayout",
    "type": "Enum",
    "default": "SMART_LAYOUT",
    "description": (<>Will set the default layout for the meeting. Possible values are: CUSTOM_LAYOUT, SMART_LAYOUT, PRESENTATION_FOCUS, VIDEO_FOCUS. (added 2.4)</>)
  },
  {
    "name": "learningDashboardEnabled",
    "type": "Boolean",
    "default": "true",
    "description": (<><b>[DEPRECATED]</b> Removed in 2.5, temporarily still handled, please transition to disabledFeatures.<br /><br />Default <code className="language-plaintext highlighter-rouge">learningDashboardEnabled=true</code>. When this option is enabled BigBlueButton generates a Dashboard where moderators can view a summary of the activities of the meeting. (added 2.4)</>)
  },
  {
    "name": "learningDashboardCleanupDelayInMinutes",
    "type": "Number",
    "default": "2",
    "description": (<>Default <code className="language-plaintext highlighter-rouge">learningDashboardCleanupDelayInMinutes=2</code>. This option set the delay (in minutes) before the Learning Dashboard become unavailable after the end of the meeting. If this value is zero, the Learning Dashboard will keep available permanently. (added 2.4)</>)
  },
  {
    "name": "allowModsToEjectCameras",
    "required": false,
    "type": "Boolean",
    "default": "false",
    "description": (<>Setting to <code className="language-plaintext highlighter-rouge">true</code> will allow moderators to close other users cameras in the meeting. (added 2.4)</>)
  },
  {
    "name": "allowRequestsWithoutSession",
    "required": false,
    "type": "Boolean",
    "default": "false",
    "description": (<>Setting to <code className="language-plaintext highlighter-rouge">true</code> will allow users to join meetings without session cookie's validation. (added 2.4.3)</>)
  },
  {
    "name": "virtualBackgroundsDisabled",
    "required": false,
    "type": "Boolean",
    "default": "false",
    "description": (<><b>[DEPRECATED]</b> Removed in 2.5, temporarily still handled, please transition to disabledFeatures.<br /><br />Setting to <code className="language-plaintext highlighter-rouge">true</code> will disable Virtual Backgrounds for all users in the meeting. (added 2.4.3)</>)
  },
  {
    "name": "userCameraCap",
    "required": false,
    "type": "Number",
    "default": "3",
    "description": (<>Setting to <code className="language-plaintext highlighter-rouge">0</code> will disable this threshold. Defines the max number of webcams a single user can share simultaneously. (added 2.4.5)</>)
  },
  {
    "name": "meetingCameraCap",
    "required": false,
    "type": "Number",
    "default": "0",
    "description": (<>Setting to <code className="language-plaintext highlighter-rouge">0</code> will disable this threshold. Defines the max number of webcams a meeting can have simultaneously. (added 2.5.0)</>)
  },
  {
    "name": "meetingExpireIfNoUserJoinedInMinutes",
    "required": false,
    "type": "Number",
    "default": "5",
    "description": (<>Automatically end meeting if no user joined within a period of time after meeting created. (added 2.5)</>)
  },
  {
    "name": "meetingExpireWhenLastUserLeftInMinutes",
    "required": false,
    "type": "Number",
    "default": "1",
    "description": (<>Number of minutes to automatically end meeting after last user left. (added 2.5)<br />Setting to <code className="language-plaintext highlighter-rouge">0</code> will disable this function.</>)
  },
  {
    "name": "groups",
    "required": false,
    "type": "String",
    "description": (<>Pre-defined groups to automatically assign the students to a given breakout room. (added 2.5)<br /><br /><b>Expected value:</b> Json with Array of groups.<br /><b>Group properties:</b><br /><ul><li><code className="language-plaintext highlighter-rouge">id</code> - String with group unique id.</li><li><code className="language-plaintext highlighter-rouge">name</code> - String with name of the group <i>(optional)</i>.</li><li><code className="language-plaintext highlighter-rouge">roster</code> - Array with IDs of the users.</li></ul><br />E.g:<br /><code className="language-json highlighter-rouge">[<br />{"{\"id\":'1',name:'GroupA',roster:['1235']}"}, <br />{"{\"id\":'2',name:'GroupB',roster:['2333','2335']}"},<br />{"{\"id\":'3',roster:[]}"}<br />]</code></>)
  },
  {
    "name": "logo",
    "required": false,
    "type": "String",
    "description": (<>Pass a URL to an image which will then be visible in the area above the participants list if <code>displayBrandingArea</code> is set to <code>true</code> in bbb-html5's configuration</>)
  },
  {
    "name": "disabledFeatures",
    "required": false,
    "type": "String",
    "description": (<>List (comma-separated) of features to disable in a particular meeting. (added 2.5)<br /><br />Available options to disable:<br /><ul><li><code className="language-plaintext highlighter-rouge">breakoutRooms</code>- <b>Breakout Rooms</b> </li><li><code className="language-plaintext highlighter-rouge">captions</code>- <b>Closed Caption</b> </li><li><code className="language-plaintext highlighter-rouge">chat</code>- <b>Chat</b></li><li><code className="language-plaintext highlighter-rouge">downloadPresentationWithAnnotations</code>- <b>Annotated presentation download</b></li><li><code className="language-plaintext highlighter-rouge">externalVideos</code>- <b>Share an external video</b> </li><li><code className="language-plaintext highlighter-rouge">importPresentationWithAnnotationsFromBreakoutRooms</code>- <b>Capture breakout presentation</b></li><li><code className="language-plaintext highlighter-rouge">importSharedNotesFromBreakoutRooms</code>- <b>Capture breakout shared notes</b></li><li><code className="language-plaintext highlighter-rouge">layouts</code>- <b>Layouts</b> (allow only default layout)</li><li><code className="language-plaintext highlighter-rouge">learningDashboard</code>- <b>Learning Analytics Dashboard</b></li><li><code className="language-plaintext highlighter-rouge">polls</code>- <b>Polls</b> </li><li><code className="language-plaintext highlighter-rouge">screenshare</code>- <b>Screen Sharing</b></li><li><code className="language-plaintext highlighter-rouge">sharedNotes</code>- <b>Shared Notes</b></li><li><code className="language-plaintext highlighter-rouge">virtualBackgrounds</code>- <b>Virtual Backgrounds</b></li><li><code className="language-plaintext highlighter-rouge">customVirtualBackgrounds</code>- <b>Virtual Backgrounds Upload</b></li><li><code className="language-plaintext highlighter-rouge">liveTranscription</code>- <b>Live Transcription</b></li><li><code className="language-plaintext highlighter-rouge">presentation</code>- <b>Presentation</b></li></ul></>)
  },
  {
    "name": "disabledFeaturesExclude",
    "required": false,
    "type": "String",
    "description": (<>List (comma-separated) of features to no longer disable in a particular meeting. This is particularly useful if you disabled a list of features on a per-server basis but want to allow one of two of these features for a specific meeting. (added 2.6.9)<br /><br />The available options to exclude are exactly the same as for <code className="language-plaintext highlighter-rouge">disabledFeatures</code></>)
  },
  {
    "name": "preUploadedPresentationOverrideDefault",
    "required": false,
    "type": "Boolean",
    "default": "true",
    "description": (<>If it is true, the <code>default.pdf</code> document is not sent along with the other presentations in the /create endpoint, on the other hand, if that's false, the <code>default.pdf</code> is sent with the other documents. By default it is true.</>)
  },
  {
    "name": "notifyRecordingIsOn",
    "required": false,
    "type": "Boolean",
    "default": "false",
    "description": (<>If it is true, a modal will be displayed to collect recording consent from users when meeting recording starts (only if <code className="language-plaintext highlighter-rouge">remindRecordingIsOn=true</code>). By default it is false. (added 2.6)</>)
  },
  {
    "name": "presentationUploadExternalUrl",
    "required": false,
    "type": "String",
    "description": (<>Pass a URL to a specific page in external application to select files for inserting documents into a live presentation. Only works if <code className="language-plaintext highlighter-rouge">presentationUploadExternalDescription</code> is also set. (added 2.6)</>)
  },
  {
    "name": "presentationUploadExternalDescription",
    "required": false,
    "type": "String",
    "description": (<>Message to be displayed in presentation uploader modal describing how to use an external application to upload presentation files. Only works if <code className="language-plaintext highlighter-rouge">presentationUploadExternalUrl</code> is also set. (added 2.6)</>)
  }
]

export default createEndpointTableData
