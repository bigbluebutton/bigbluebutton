import React from 'react';

const updateRecordingsEndpointTableData = [
  {
    "name": "recordID",
    "required": true,
    "type": "String",
    "description": (<>A record ID for specify the recordings to apply the publish action. It can be a set of record IDs separated by commas.</>)
  },
  {
    "name": "meta",
    "required": false,
    "type": "String",
    "description": (<>You can pass one or more metadata values to be updated. The format of these parameters is the same as the metadata passed to the <code className="language-plaintext highlighter-rouge">create</code> call. For more information see <a href="https://docs.bigbluebutton.org/dev/api.html#create">the docs for the create call</a>. When meta_parameter=NOT EMPTY and meta_parameter exists its value is updated, if it doesn’t exist, the parameter is added. When meta_parameter=, and meta_parameter exists the key is removed, when it doesn’t exist the action is ignored.</>)
  }
];

export default updateRecordingsEndpointTableData;
