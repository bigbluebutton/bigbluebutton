import { check } from 'meteor/check';
import { PadsSessions } from '/imports/api/pads';
import Logger from '/imports/startup/server/logger';

export default function deleteSession(meetingId, externalId, userId, sessionId) {
  try {
    check(meetingId, String);
    check(externalId, String);
    check(userId, String);
    check(sessionId, String);

    const selector = {
      meetingId,
      userId,
    };

    const modifier = {
      $pull: {
        sessions: {
          [externalId] : sessionId,
        },
      },
    };

    PadsSessions.upsert(selector, modifier);
    Logger.debug(`Removed pad session=${sessionId} external=${externalId} user=${userId} meeting=${meetingId}`);
  } catch (err) {
    Logger.error(`Removing pad session to the collection: ${err}`);
  }
}
