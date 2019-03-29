import { check } from 'meteor/check';
import Note from '/imports/api/note';
import Logger from '/imports/startup/server/logger';
import { generateNoteId, createPadURL, getReadOnlyIdURL, isEnabled } from '/imports/api/note/server/helpers';
import addNote from '/imports/api/note/server/modifiers/addNote';

const getDataFromResponse = (data, key) => {
  if (data) {
    const innerData = data.data;
    if (innerData && innerData[key]) {
      return innerData[key];
    }
  }
};

export default function createNote(meetingId) {
  // Avoid note creation if this feature is disabled
  if (!isEnabled()) {
    Logger.warn(`Notes are disabled for ${meetingId}`);
    return;
  }

  check(meetingId, String);

  const noteId = generateNoteId(meetingId);

  const axios = require('axios');
  const createURL = createPadURL(noteId);
  axios({
    method:'get',
    url: createURL,
    responseType: 'json'
  }).then(response => {
    const readOnlyURL = getReadOnlyIdURL(noteId);
    axios({
      method:'get',
      url: readOnlyURL,
      responseType: 'json'
    }).then(response => {
      const readOnlyNoteId =getDataFromResponse(response.data, 'readOnlyID');
      if (readOnlyNoteId) {
        addNote(meetingId, noteId, readOnlyNoteId);
      } else {
        Logger.error(`Could not get note readOnlyID for ${meetingId}`);
      }
    }).catch(error => Logger.error(`Could not get note readOnlyID for ${meetingId}: ${error}`));
  }).catch(error => Logger.error(`Could not create note for ${meetingId}: ${error}`));
}
