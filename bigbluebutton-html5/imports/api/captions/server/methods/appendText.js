import axios from 'axios';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Captions from '/imports/api/captions';
import { appendTextURL } from '/imports/api/common/server/etherpad';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function appendText(text, locale) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(text, String);
    check(locale, String);

    const captions = Captions.findOne({
      meetingId,
      locale,
      ownerId: requesterUserId,
    });

    if (!captions) {
      Logger.error(`Could not find captions' pad for meetingId=${meetingId} locale=${locale}`);
      return;
    }

    const { padId } = captions;

    axios({
      method: 'get',
      url: appendTextURL(padId, text),
      responseType: 'json',
    }).then((response) => {
      const { status } = response;
      if (status !== 200) {
        Logger.error(`Could not append captions for padId=${padId}`);
      }
    }).catch((error) => Logger.error(`Could not append captions for padId=${padId}: ${error}`));
  } catch (err) {
    Logger.error(`Exception while invoking method appendText ${err.stack}`);
  }
}
