import React from 'react';

const putRecordingTextTrackEndpointTableData = [
  {
    "name": "recordID",
    "required": true,
    "type": "String",
    "description": (<>A single recording ID to retrieve the available captions for. (Unlike other recording APIs, you cannot provide a comma-separated list of recordings.)</>)
  },
  {
    "name": "kind",
    "required": true,
    "type": "String",
    "description": (<>Indicates the intended use of the text track. See the <a href="#getrecordingtexttracks">getRecordingTextTracks</a> description for details. Using a value other than one listed in this document will cause an error to be returned.</>)
  },
  {
    "name": "lang",
    "required": true,
    "type": "String",
    "description": (<>Indicates the intended use of the text track. See the <a href="#getrecordingtexttracks">getRecordingTextTracks</a> description for details. Using a value other than one listed in this document will cause an error to be returned.</>)
  },
  {
    "name": "label",
    "required": true,
    "type": "String",
    "description": (<>A human-readable label for the text track. If not specified, the system will automatically generate a label containing the name of the language identified by the lang parameter.</>)
  }
];

export default putRecordingTextTrackEndpointTableData;
