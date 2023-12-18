import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Breakouts from '/imports/api/breakouts';

export default async function handleUpdateTimeRemaining({ body }, meetingId) {
  const {
    timeRemaining,
  } = body;

  check(meetingId, String);
  check(timeRemaining, Number);

  const selector = {
    parentMeetingId: meetingId,
  };

  const modifier = {
    $set: {
      timeRemaining,
    },
  };

  const options = {
    multi: true,
  };
  const numberAffected = Breakouts.updateAsync(selector, modifier, options);

  if (numberAffected) {
    Logger.info(`Updated breakout time remaining for breakouts where parentMeetingId=${meetingId}`);
  } else {
    Logger.error(`Updating breakouts: ${numberAffected}`);
  }
}
