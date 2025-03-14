import React from 'react';

const sendChatMessageEndpointTableData = [
  {
    "name": "meetingID",
    "required": true,
    "type": "String",
    "description": (
      <p>The ID of the meeting to send the chat message to.</p>
    )
  },
  {
    "name": "message",
    "required": true,
    "type": "String",
    "minLength": 1,
    "maxLength": 500,
    "description": (
      <>
        <p>The contents of the chat message to send.</p>
        <p>Any special characters included in the message will be escaped before the message is displayed. You cannot include HTML or Markdown code to format the message.</p>
      </>
    )
  },
  {
    "name": "userName",
    "required": false,
    "type": "String",
    "maxLength": 255,
    "default": "System",
    "description": (
      <p>The name that will be shown as the sender of the chat message.</p>
    )
  }
];

export default sendChatMessageEndpointTableData;
