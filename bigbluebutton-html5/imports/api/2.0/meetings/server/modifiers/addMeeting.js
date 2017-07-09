import flat from 'flat';
import { check } from 'meteor/check';
import Meetings from '/imports/api/2.0/meetings';
import Logger from '/imports/startup/server/logger';
import initializeCursor from '/imports/api/1.1/cursor/server/modifiers/initializeCursor';

export default function addMeeting(meeting) {
  const meetingId = meeting.meetingProp.intId;

  check(meeting, Object);
  check(meetingId, String);

  const selector = {
    'meetingProp.intId': meetingId,
  };

  const modifier = {
    $set: flat(meeting),
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Adding meeting to collection: ${err}`);
      return;
    }

    initializeCursor(meetingId);

    const { insertedId } = numChanged;
    if (insertedId) {
      Logger.info(`Added meeting2x id=${meetingId}`);
    }

    if (numChanged) {
      Logger.info(`Upserted meeting2x id=${meetingId}`);
    }
  };

  return Meetings.upsert(selector, modifier, cb);
}
