import { check } from 'meteor/check';
import Captions from '/imports/api/captions';
import updateOwnerId from '/imports/api/captions/server/modifiers/updateOwnerId';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { CAPTIONS_TOKEN } from '/imports/api/captions/server/helpers';
import Logger from '/imports/startup/server/logger';

export default function takeOwnership(locale) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(locale, String);

    const pad = Captions.findOne({ meetingId, padId: { $regex: `${CAPTIONS_TOKEN}${locale}$` } });

    if (pad) {
      updateOwnerId(meetingId, requesterUserId, pad.padId);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method takeOwnership ${err.stack}`);
  }
}
