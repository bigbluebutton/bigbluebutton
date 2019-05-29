import { check } from 'meteor/check';
import Captions from '/imports/api/captions';
import updateOwnerId from '/imports/api/captions/server/modifiers/updateOwnerId';

export default function takeOwnership(credentials, locale) {
  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(locale, String);

  const pad = Captions.findOne({ meetingId, padId: { $regex: `_captions_${locale}$` } });

  if (pad) {
    updateOwnerId(meetingId, requesterUserId, pad.padId);
  }
}
