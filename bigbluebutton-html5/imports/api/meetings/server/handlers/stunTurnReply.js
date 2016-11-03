import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';

export default function handleStunTurnReply({ payload }) {
  const meetingId = payload.meeting_id;
  const { stuns, turns } = payload;

  check(meetingId, String);

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: {
      stuns,
      turns,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Updating meeting stuns/turns: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Updated meeting stuns/turns id=${meetingId}`);
    }
  };

  return Meetings.update(selector, modifier, cb);
};
