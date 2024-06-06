import React from 'react';

const endEndpointTableData = [
  {
    "name": "meetingID",
    "required": true,
    "type": "String",
    "description": (<>The meeting ID that identifies the meeting you are attempting to end.</>)
  },
  {
    "name": "password",
    "required": true,
    "type": "String",
    "description": (<><b>[DEPRECATED]</b> The moderator password for this meeting. You can not end a meeting using the attendee password.</>)
  }
];

export default endEndpointTableData;
