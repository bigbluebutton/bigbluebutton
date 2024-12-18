import React from 'react';

const sendChatMessageEndpointTableData = [
  {
    "name": "meetingID",
    "required": true,
    "type": "String",
    "description": (<>The meeting ID that identifies the meeting you are attempting to send a message.</>)
  },
  {
    "name": "message",
    "required": true,
    "type": "String",
    "description": (<>The message you want to send to the public chat of the meeting.</>)
  },
  {
    "name": "userName",
    "required": false,
    "type": "String",
    "default": "System",
    "description": (<>Optional param to set the name that will be showed as the author of the message.</>)
  }
];

export default sendChatMessageEndpointTableData;
