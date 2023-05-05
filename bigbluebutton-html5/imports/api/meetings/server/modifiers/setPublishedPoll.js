import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function setPublishedPoll(meetingId, isPublished) {
  check(meetingId, String);
  check(isPublished, Boolean);

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: {
      publishedPoll: isPublished,
    },
  };

  try {
    const { numberAffected } = Meetings.upsert(selector, modifier);

    if (numberAffected) {
      Logger.info(`Set publishedPoll=${isPublished} in meeitingId=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Setting publishedPoll=${isPublished} for meetingId=${meetingId}`);
  }
}
