import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user/';
import Users from '/imports/api/users';

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

  try {
    if (!multiUser) {
      const usersSelector = { meetingId };
  
      const mod = {
        $set: {
          whiteboardAccess: false,
        },
      };
  
      Users.update(usersSelector, mod, { multi: true }, (err) => {
        if (err) {
          return Logger.error(`Error removing whiteboard access, User collection: ${err}`);
        }
        return Logger.info(`updated Users whiteboardAccess flag=${false} meetingId=${meetingId} whiteboardId=${whiteboardId}`);
      });
    }

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
