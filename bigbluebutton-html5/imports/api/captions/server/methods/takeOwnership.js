import { check } from 'meteor/check';
import Captions from '/imports/api/captions';
import updateOwnerId from '/imports/api/captions/server/modifiers/updateOwnerId';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function takeOwnership(locale) {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(locale, String);

  const pad = Captions.findOne({ meetingId, padId: { $regex: `_captions_${locale}$` } });

  if (pad) {
    updateOwnerId(meetingId, requesterUserId, pad.padId);
  }
}
