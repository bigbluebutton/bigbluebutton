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
    "type": "Boolean",
    "description": (<>Either <code>true</code> to publish the recording(s), or <code>false</code> to unpublish the recording(s).</>)
  }
];

export default publishRecordingsEndpointTableData;
