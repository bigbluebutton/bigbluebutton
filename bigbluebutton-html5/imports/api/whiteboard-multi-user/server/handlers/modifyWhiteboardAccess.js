import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user/';

export default function handleModifyWhiteboardAccess({ body }, meetingId) {
  const { multiUser } = body;

  check(multiUser, Boolean);
  check(meetingId, String);

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: {
      meetingId,
      multiUser,
    },
  };


  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Error while adding an entry to Multi-User collection: ${err}`);
    }

    const { insertedId } = numChanged;
    if (insertedId) {
      return Logger.info(`Added multiUser flag to the meetingId=${meetingId}`);
    }

    return Logger.info(`Upserted multiUser flag into meetingId=${meetingId}`);
  };

  return WhiteboardMultiUser.upsert(selector, modifier, cb);
}
