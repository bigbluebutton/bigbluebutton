import { check } from 'meteor/check';
import Pads from '/imports/api/pads';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function getPadId(externalId) {
  try {
    const { meetingId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(externalId, String);

    const pad = Pads.findOne(
      {
        meetingId,
        externalId,
      },
      {
        fields: {
          padId: 1,
        }
      },
    );

    if (pad && pad.padId) {
      return pad.padId;
    }

    return null;
  } catch (err) {
    return null;
  }
}
