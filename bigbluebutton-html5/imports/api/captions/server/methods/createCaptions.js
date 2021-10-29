import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import {
  generatePadId,
  isEnabled,
  getLocalesURL,
} from '/imports/api/captions/server/helpers';
import { withInstaceId } from '/imports/api/common/server/etherpad';
import addCaption from '/imports/api/captions/server/modifiers/addCaption';
import addCaptionsPads from '/imports/api/captions/server/methods/addCaptionsPads';
import axios from 'axios';

export default function createCaptions(meetingId, instanceId) {
  // Avoid captions creation if this feature is disabled
  if (!isEnabled()) {
    Logger.warn('Closed captions are disabled');
    return;
  }

  try {
    check(meetingId, String);
    check(instanceId, Number);

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
        const padId = withInstaceId(instanceId, generatePadId(meetingId, locale.locale));
        addCaption(meetingId, padId, locale.locale, locale.name);
        padIds.push(padId);
      });
      addCaptionsPads(meetingId, padIds);
    }).catch((error) => Logger.error(`Could not create captions for ${meetingId}: ${error}`));
  } catch (err) {
    Logger.error(`Exception while invoking method createCaptions ${err.stack}`);
  }
}
