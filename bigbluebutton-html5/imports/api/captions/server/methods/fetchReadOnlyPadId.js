import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import {
  getReadOnlyIdURL,
  getDataFromResponse,
} from '/imports/api/note/server/helpers';
import addReadOnlyPadId from '/imports/api/captions/server/modifiers/addReadOnlyPadId';
import axios from 'axios';

export default function fetchReadOnlyPadId(padId) {
  check(padId, String);

  const readOnlyURL = getReadOnlyIdURL(padId);
  axios({
    method: 'get',
    url: readOnlyURL,
    responseType: 'json',
  }).then((response) => {
    const readOnlyNoteId = getDataFromResponse(response.data, 'readOnlyID');
    if (readOnlyNoteId) {
      addReadOnlyPadId(padId, readOnlyNoteId);
    } else {
      Logger.error(`Could not get pad readOnlyID for ${padId}`);
    }
  }).catch(error => Logger.error(`Could not get pad readOnlyID for ${padId}: ${error}`));
}
