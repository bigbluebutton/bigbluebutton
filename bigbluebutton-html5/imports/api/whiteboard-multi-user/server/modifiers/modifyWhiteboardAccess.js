import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user/';

export default function modifyWhiteboardAccess(meetingId, whiteboardId, multiUser) {
  check(meetingId, String);
  check(whiteboardId, String);
  check(multiUser, Array);

  const selector = {
    meetingId,
    whiteboardId,
  };

  const modifier = {
    meetingId,
    whiteboardId,
    multiUser,
  };

  try {
    const { insertedId } = WhiteboardMultiUser.upsert(selector, modifier);
    if (insertedId) {
      Logger.info(`Added multiUser flag=${multiUser} meetingId=${meetingId} whiteboardId=${whiteboardId}`);
    } else {
      Logger.info(`Upserted multiUser flag=${multiUser} meetingId=${meetingId} whiteboardId=${whiteboardId}`);
    }
  } catch (err) {
    Logger.error(`Error while adding an entry to Multi-User collection: ${err}`);
  }
}
