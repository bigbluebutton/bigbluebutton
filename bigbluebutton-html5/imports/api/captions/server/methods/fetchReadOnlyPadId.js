import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { getReadOnlyIdURL } from '/imports/api/common/server/etherpad';
import { getDataFromResponse } from '/imports/api/note/server/helpers';
import updateReadOnlyPadId from '/imports/api/captions/server/modifiers/updateReadOnlyPadId';
import axios from 'axios';

export default function fetchReadOnlyPadId(padId) {
  check(padId, String);

  axios({
    method: 'get',
    url: getReadOnlyIdURL(padId),
    responseType: 'json',
  }).then((response) => {
    const { status } = response;
    if (status !== 200) {
      Logger.error(`Could not get closed captions readOnlyID for ${padId} ${status}`);
      return;
    }
    const readOnlyPadId = getDataFromResponse(response.data, 'readOnlyID');
    if (readOnlyPadId) {
      updateReadOnlyPadId(padId, readOnlyPadId);
    } else {
      Logger.error(`Could not get pad readOnlyID for ${padId}`);
    }
  }).catch(error => Logger.error(`Could not get pad readOnlyID for ${padId}: ${error}`));
}
