import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user/';


export default function modifyWhiteboardAccess(meetingId, whiteboardId, multiUser) {
  check(meetingId, String);
  check(whiteboardId, String);
  check(multiUser, Boolean);

  const selector = {
    meetingId,
    whiteboardId,
  };

  const modifier = {
    meetingId,
    whiteboardId,
    multiUser,
  };


  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Error while adding an entry to Multi-User collection: ${err}`);
    }

    const { insertedId } = numChanged;
    if (insertedId) {
      return Logger.info(`Added multiUser flag meetingId=${meetingId} whiteboardId=${whiteboardId}`);
    }

    return Logger.info(`Upserted multiUser flag meetingId=${meetingId} whiteboardId=${whiteboardId}`);
  };

  return WhiteboardMultiUser.upsert(selector, modifier, cb);
}
