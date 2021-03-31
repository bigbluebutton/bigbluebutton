import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import {
  createPadURL,
  getReadOnlyIdURL,
} from '/imports/api/common/server/etherpad';
import {
  generatePadId,
  isEnabled,
  getDataFromResponse,
} from '/imports/api/note/server/helpers';
import addNote from '/imports/api/note/server/modifiers/addNote';
import axios from 'axios';

export default function createNote(meetingId) {
  // Avoid note creation if this feature is disabled
  if (!isEnabled()) {
    Logger.warn(`Shared notes are disabled`);
    return;
  }

  check(meetingId, String);

  const noteId = generatePadId(meetingId);
  const createURL = createPadURL(noteId);

  axios({
    method: 'get',
    url: createURL,
    responseType: 'json',
  }).then((responseOuter) => {
    const { status } = responseOuter;
    if (status !== 200) {
      Logger.error(`Could not get note info for ${meetingId} ${status}`);
      return;
    }
    const readOnlyURL = getReadOnlyIdURL(noteId);
    axios({
      method: 'get',
      url: readOnlyURL,
      responseType: 'json',
    }).then((response) => {
      const readOnlyNoteId = getDataFromResponse(response.data, 'readOnlyID');
      if (readOnlyNoteId) {
        addNote(meetingId, noteId, readOnlyNoteId);
      } else {
        Logger.error(`Could not get note readOnlyID for ${meetingId}`);
      }
    }).catch(error => Logger.error(`Could not get note readOnlyID for ${meetingId}: ${error}`));
  }).catch(error => Logger.error(`Could not create note for ${meetingId}: ${error}`));
}
