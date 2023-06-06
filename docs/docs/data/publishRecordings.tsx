import React from 'react';

const publishRecordingsEndpointTableData = [
  {
    "name": "recordID",
    "required": true,
    "type": "String",
    "description": (<>A record ID for specify the recordings to apply the publish action. It can be a set of record IDs separated by commas.</>)
  },
  {
    "name": "publish",
    "required": true,
    "type": "String",
    "description": (<>The value for publish or unpublish the recording(s). Available values: true or false.</>)
  }
];

export default publishRecordingsEndpointTableData;
