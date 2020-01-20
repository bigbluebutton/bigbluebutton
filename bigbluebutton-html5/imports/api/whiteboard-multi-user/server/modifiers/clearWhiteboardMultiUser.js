import Logger from '/imports/startup/server/logger';
import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user/';

export default function clearWhiteboardMultiUser(meetingId) {
  const cb = (err) => {
    if (err) {
      return Logger.error(`clearing whiteboard multi user to collection: ${err}`);
    }

    return Logger.info(`cleared meeting whiteboard multi user meetingId=${meetingId}`);
  };

  if (meetingId) {
    return WhiteboardMultiUser.remove({ meetingId }, cb);
  }
  return WhiteboardMultiUser.remove({}, cb);
}
