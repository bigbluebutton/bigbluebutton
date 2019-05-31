import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import {
  generatePadId,
  isEnabled,
  getLocalesURL,
} from '/imports/api/captions/server/helpers';
import addCaption from '/imports/api/captions/server/modifiers/addCaption';
import axios from 'axios';

export default function createCaptions(meetingId) {
  // Avoid captions creation if this feature is disabled
  if (!isEnabled()) {
    Logger.warn(`Captions are disabled for ${meetingId}`);
    return;
  }

  check(meetingId, String);

  axios({
    method: 'get',
    url: getLocalesURL(),
    responseType: 'json',
  }).then((response) => {
    const { status } = response;
    if (status !== 200) {
      Logger.error(`Could not get locales info for ${meetingId} ${status}`);
    }
    const locales = response.data;
    locales.forEach((locale) => {
      const padId = generatePadId(meetingId, locale.locale);
      addCaption(meetingId, padId, locale);
    });
  }).catch(error => Logger.error(`Could not create captions for ${meetingId}: ${error}`));
}
