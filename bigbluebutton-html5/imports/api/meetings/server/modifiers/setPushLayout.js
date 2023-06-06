import Logger from '/imports/startup/server/logger';
import { LayoutMeetings } from '/imports/api/meetings';
import { check } from 'meteor/check';

export default async function setPushLayout(meetingId, pushLayout, requesterUserId) {
  try {
    check(meetingId, String);
    check(requesterUserId, String);

    const selector = {
      meetingId,
    };

    // TODO: create a exclusive collection for layout changes
    const modifier = {
      $set: {
        pushLayout,
      },
    };

    const numberAffected = await LayoutMeetings.updateAsync(selector, modifier);

    if (numberAffected) {
      Logger.info(`MeetingLayout pushLayout changed to ${pushLayout} for meeting=${meetingId} requested by user=${requesterUserId}`);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method setPushLayout ${err.stack}`);
  }
}
