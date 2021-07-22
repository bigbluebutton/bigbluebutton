import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';
import { check } from 'meteor/check';
import { LAYOUT_TYPE } from '/imports/ui/components/layout/enums';

export default function changeLayout(meetingId, layout, requesterUserId, affectedUsers) {
  try {
    check(meetingId, String);
    check(requesterUserId, String);
    check(layout, String);
    check(affectedUsers, Match.Maybe([String]));

    const selector = {
      meetingId,
    };

    const modifier = {
      $set: {
        layout: LAYOUT_TYPE[layout] || 'smart',
      },
    };

    const numberAffected = Meetings.update(selector, modifier);

    if (numberAffected) {
      Logger.info(`Meeting layout changed to ${layout} for meeting=${meetingId} requested by user=${requesterUserId}`);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method changeLayout ${err.stack}`);
  }
}
