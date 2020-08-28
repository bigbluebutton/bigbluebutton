import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';

export default function handleStopExternalVideo({ header, body }, meetingId) {
  const { userId } = header;
  check(body, Object);
  check(meetingId, String);
  check(userId, String);

  const user = Users.findOne({ meetingId: meetingId, userId: userId })

  if (user && user.presenter) {
      Logger.info(`User id=${userId} stop sharing an external video for meeting ${meetingId}`);
      Meetings.update({ meetingId }, { $set: { externalVideoUrl: null } });
  }
}
