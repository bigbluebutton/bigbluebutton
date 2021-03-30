import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import {
  generatePadId,
  isEnabled,
  getLocalesURL,
} from '/imports/api/captions/server/helpers';
import addCaption from '/imports/api/captions/server/modifiers/addCaption';
import addCaptionsPads from '/imports/api/captions/server/methods/addCaptionsPads';
import axios from 'axios';

export default function createCaptions(meetingId) {
  // Avoid captions creation if this feature is disabled
  if (!isEnabled()) {
    Logger.warn(`Closed captions are disabled`);
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
      return;
    }
    const padIds = [];
    const locales = response.data;
    locales.forEach((locale) => {
      const padId = generatePadId(meetingId, locale.locale);
      addCaption(meetingId, padId, locale);
      padIds.push(padId);
    });
    addCaptionsPads(meetingId, padIds);
  }).catch(error => Logger.error(`Could not create captions for ${meetingId}: ${error}`));
}
