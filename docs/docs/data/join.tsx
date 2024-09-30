import React from 'react';

const joinEndpointTableData = [
  {
    "name": "fullName",
    "required": true,
    "type": "String",
    "description": (<>The full name that is to be used to identify this user to other conference attendees.</>)
  },
  {
    "name": "meetingID",
    "required": true,
    "type": "String",
    "description": (<>The meeting ID that identifies the meeting you are attempting to join.</>)
  },
  {
    "name": "password",
    "required": true,
    "type": "String",
    "description": (<><b>[DEPRECATED]</b> This password value is used to determine the role of the user based on whether it matches the moderator or attendee password.  Note: This parameter is <b>not</b> required when the role parameter is passed.</>)
  },
  {
    "name": "role",
    "required": true,
    "type": "String",
    "description": (<>Define user role for the meeting.  Valid values are MODERATOR or VIEWER (case insensitive). If the role parameter is present and valid, it overrides the password parameter.  You must specify either password parameter or role parameter in the join request.</>)
  },
  {
    "name": "createTime",
    "required": false,
    "type": "String",
    "description": (<>Third-party apps using the API can now pass createTime parameter (which was created in the create call), BigBlueButton will ensure it matches the ‘createTime’ for the session.  If they differ, BigBlueButton will not proceed with the join request. This prevents a user from reusing their join URL for a subsequent session with the same meetingID.</>)
  },
  {
    "name": "userID",
    "required": false,
    "type": "String",
    "description": (<>An identifier for this user that will help your application to identify which person this is.  This user ID will be returned for this user in the getMeetingInfo API call so that you can check</>)
  },
  {
    "name": "webVoiceConf",
    "required": false,
    "type": "String",
    "description": (<>If you want to pass in a custom voice-extension when a user joins the voice conference using voip. This is useful if you want to collect more info in you Call Detail Records about the user joining the conference. You need to modify your /etc/asterisk/bbb-extensions.conf to handle this new extensions.</>)
  },
  {
    "name": "avatarURL",
    "required": false,
    "type": "String",
    "description": (<>The link for the user’s avatar to be displayed (default can be enabled/disabled and set with “useDefaultAvatar“ and “defaultAvatarURL“ in bbb-web.properties).</>)
  },
  {
    "name": "webcamBackgroundURL",
    "required": false,
    "type": "String",
    "description": (<>The link for the user's webcam background to be displayed (default can be enabled/disabled and set with “useDefaultWebcamBackground“ and “defaultWebcamBackgroundURL“ in bigbluebutton.properties). Added in BigBlueButton 2.7.10.</>)
  },
  {
    "name": "redirect",
    "required": false,
    "type": "String",
    "description": (<>The default behaviour of the JOIN API is to redirect the browser to the HTML5 client when the JOIN call succeeds. There have been requests if it’s possible to embed the HTML5 client in a “container” page and that the client starts as a hidden DIV tag which becomes visible on the successful JOIN. Setting this variable to FALSE will not redirect the browser but returns an XML instead whether the JOIN call has succeeded or not. The third party app is responsible for displaying the client to the user.</>)
  },
  {
    "name": "errorRedirectUrl",
    "required": false,
    "type": "String",
    "description": (<>A custom URL to redirect users to when an error occurs while joining. By default users are redirected to the meeting's default logout URL.</>)
  },
  {
    "name": "joinViaHtml5",
    "required": false,
    "type": "String",
    "description": (<><b>[DEPRECATED]</b>Set to “true” to force the HTML5 client to load for the user. (removed in 2.3 since HTML5 is the only client)</>),
    "deprecated": true
  },
  {
    "name": "guest",
    "required": false,
    "type": "String",
    "description": (<>Set to “true” to indicate that the user is a guest, otherwise do NOT send this parameter.</>)
  },
  {
    "name": "excludeFromDashboard",
    "required": false,
    "type": "String",
    "description": (<>If the parameter is passed on JOIN with value `true`, the user will be omitted from being displayed in the Learning Dashboard. The use case is for support agents who drop by to support the meeting / resolve tech difficulties. Added in BBB 2.4</>)
  },{
    "name": "enforceLayout",
    "required": false,
    "type": "String",
    "description": (<>If passed it overrides the value of `meetingLayout` passed on CREATE or the value of `defaultMeetingLayout` read from configuration. Accepted values are the standard layouts: CUSTOM_LAYOUT, SMART_LAYOUT, PRESENTATION_FOCUS, VIDEO_FOCUS, but also several layouts which are not meant to be selectable via UI: CAMERAS_ONLY, PARTICIPANTS_CHAT_ONLY, PRESENTATION_ONLY. Added in BBB 3.0</>)
  }
];

export default joinEndpointTableData;
