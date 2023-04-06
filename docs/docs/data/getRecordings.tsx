import React from 'react';

const getRecordingsEndpointTableData = [
  {
    "name": "meetingID",
    "required": false,
    "type": "String",
    "description": (<>A meeting ID for get the recordings. It can be a set of meetingIDs separate by commas. If the meeting ID is not specified, it will get ALL the recordings. If a recordID is specified, the meetingID is ignored.</>)
  },
  {
    "name": "recordID",
    "required": false,
    "type": "String",
    "description": (<>A record ID for get the recordings. It can be a set of recordIDs separate by commas. If the record ID is not specified, it will use meeting ID as the main criteria. If neither the meeting ID is specified, it will get ALL the recordings. The recordID can also be used as a wildcard by including only the first characters in the string.</>)
  },
  {
    "name": "state",
    "required": false,
    "type": "String",
    "description": (<>Since version 1.0 the recording has an attribute that shows a state that Indicates if the recording is [processing|processed|published|unpublished|deleted]. The parameter state can be used to filter results. It can be a set of states separate by commas. If it is not specified only the states [published|unpublished] are considered (same as in previous versions). If it is specified as “any”, recordings in all states are included.</>)
  },
  {
    "name": "meta",
    "required": false,
    "type": "String",
    "description": (<>You can pass one or more metadata values to filter the recordings returned. The format of these parameters is the same as the metadata passed to the <code className="language-plaintext highlighter-rouge">create</code> call. For more information see <a href="https://docs.bigbluebutton.org/dev/api.html#create">the docs for the create call</a>.</>)
  },
  {
    "name": "offset",
    "required": false,
    "type": "Integer",
    "description": (<>The starting index for returned recordings. Number must greater than or equal to 0.</>)
  },
  {
    "name": "limit",
    "required": false,
    "type": "Integer",
    "description": (<>The maximum number of recordings to be returned. Number must be between 1 and 100.</>)
  }
];

export default getRecordingsEndpointTableData;
