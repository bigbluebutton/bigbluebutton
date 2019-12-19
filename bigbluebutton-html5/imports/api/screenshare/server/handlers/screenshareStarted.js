import { check } from 'meteor/check';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import addScreenshare from '../modifiers/addScreenshare';
import Logger from '/imports/startup/server/logger';
import stopWatchingExternalVideo from '/imports/api/external-videos/server/methods/stopWatchingExternalVideo';

export default function handleScreenshareStarted({ body }, meetingId) {
  check(meetingId, String);
  check(body, Object);

  const meeting = Meetings.findOne({ meetingId });
  const presenter = Users.findOne({ meetingId, presenter: true });
  const presenterId = presenter && presenter.userId ? presenter.userId : 'system-screenshare-starting';
  if (meeting && meeting.externalVideoUrl) {
    Logger.info(`ScreenshareStarted: There is external video being shared. Stopping it due to presenter change, ${meeting.externalVideoUrl}`);
    stopWatchingExternalVideo({ meetingId, requesterUserId: presenterId });
  }
  return addScreenshare(meetingId, body);
}
