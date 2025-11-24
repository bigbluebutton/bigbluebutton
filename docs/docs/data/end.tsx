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
    "type": "String",
    deprecated: true,
    "description": (
      <>
        <i>Deprecated:</i> In older BigBlueButton versions, this parameter had to be set to the moderator password for the meeting. It is no longer required.
      </>
    )
  }
];

export default endEndpointTableData;
