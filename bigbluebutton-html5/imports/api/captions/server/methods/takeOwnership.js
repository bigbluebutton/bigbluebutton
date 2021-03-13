import { check } from 'meteor/check';
import Captions from '/imports/api/captions';
import updateOwnerId from '/imports/api/captions/server/modifiers/updateOwnerId';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { CAPTIONS_TOKEN } from '/imports/api/captions/server/helpers';

export default function takeOwnership(locale) {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(locale, String);

  const pad = Captions.findOne({ meetingId, padId: { $regex: `${CAPTIONS_TOKEN}${locale}$` } });

  if (pad) {
    updateOwnerId(meetingId, requesterUserId, pad.padId);
  }
}
