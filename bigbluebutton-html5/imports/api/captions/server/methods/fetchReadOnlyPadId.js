import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import {
  getReadOnlyIdURL,
  getDataFromResponse,
} from '/imports/api/note/server/helpers';
import updateReadOnlyPadId from '/imports/api/captions/server/modifiers/updateReadOnlyPadId';
import axios from 'axios';

export default function fetchReadOnlyPadId(padId) {
  check(padId, String);

  const readOnlyURL = getReadOnlyIdURL(padId);
  axios({
    method: 'get',
    url: readOnlyURL,
    responseType: 'json',
  }).then((response) => {
    const readOnlyPadId = getDataFromResponse(response.data, 'readOnlyID');
    if (readOnlyPadId) {
      updateReadOnlyPadId(padId, readOnlyPadId);
    } else {
      Logger.error(`Could not get pad readOnlyID for ${padId}`);
    }
  }).catch(error => Logger.error(`Could not get pad readOnlyID for ${padId}: ${error}`));
}
