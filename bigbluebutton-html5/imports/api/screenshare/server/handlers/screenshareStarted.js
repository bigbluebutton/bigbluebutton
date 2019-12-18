import { check } from 'meteor/check';
import Meetings from '/imports/api/meetings';
import addScreenshare from '../modifiers/addScreenshare';
import Logger from '/imports/startup/server/logger';

export default function handleScreenshareStarted({ body }, meetingId) {
  check(meetingId, String);
  check(body, Object);

  const meeting = Meetings.findOne({ meetingId });
  if (meeting && meeting.externalVideoUrl) {
    Logger.info(`ScreenshareStarted: There is external video being shared. Stopping it due to presenter change, ${meeting.externalVideoUrl}`);
    Meetings.update({ meetingId }, { $set: { externalVideoUrl: null } });
  }
  return addScreenshare(meetingId, body);
}
