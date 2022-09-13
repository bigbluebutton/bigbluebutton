import { check } from 'meteor/check';
import { PadsUpdates } from '/imports/api/pads';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function getPadContent(externalId) {
  try {
    const { meetingId } = extractCredentials(this.userId);

    check(meetingId, String);

    const { content = '', contentLastUpdatedAt = 0 } = PadsUpdates.findOne(
      {
        meetingId,
        externalId,
      },
      {
        fields: {
          content: 1,
          contentLastUpdatedAt: 1,
        },
      },
    ) || {};

    return { content, contentLastUpdatedAt };
  } catch (err) {
    return null;
  }
}
