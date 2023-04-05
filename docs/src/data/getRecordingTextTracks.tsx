import React from 'react';

const getRecordingTextTracksEndpointTableData = [
  {
    "name": "recordID",
    "required": true,
    "type": "String",
    "description": (<>A single recording ID to retrieve the available captions for. (Unlike other recording APIs, you cannot provide a comma-separated list of recordings.)</>)
  }
];

export default getRecordingTextTracksEndpointTableData;
