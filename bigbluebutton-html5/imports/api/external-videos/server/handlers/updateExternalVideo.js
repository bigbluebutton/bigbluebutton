import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import ExternalVideoStreamer from '/imports/api/external-videos/server/streamer';

export default function handleUpdateExternalVideo({ header, body }, meetingId) {
  const { userId } = header;
  check(body, Object);
  check(meetingId, String);
  check(userId, String);

  const user = Users.findOne({ meetingId: meetingId, userId: userId })

  if (user && user.presenter) {
    try {
      Logger.info(`UpdateExternalVideoEvtMsg received for user ${userId} and meeting ${meetingId} event:${body.status}`);
      ExternalVideoStreamer(meetingId).emit(body.status, { ...body, meetingId: meetingId, userId: userId });
    } catch (err) {
      Logger.error(`Error on setting shared external video update in Meetings collection: ${err}`);
    }

  }

}
