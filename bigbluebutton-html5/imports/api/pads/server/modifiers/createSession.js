import { check } from 'meteor/check';
import { PadsSessions } from '/imports/api/pads';
import Logger from '/imports/startup/server/logger';

export default function createSession(meetingId, userId, externalId, sessionId) {
  try {
    check(meetingId, String);
    check(userId, String);
    check(externalId, String);
    check(sessionId, String);

    const selector = {
      meetingId,
      userId,
    };

    const modifier = {
      $push: {
        sessions: {
          [externalId]: sessionId,
        },
      },
    };

    const { insertedId } = PadsSessions.upsert(selector, modifier);

    if (insertedId) {
      Logger.debug(`Added pad session=${sessionId} external=${externalId} user=${userId} meeting=${meetingId}`);
    } else {
      Logger.debug(`Upserted pad session=${sessionId} external=${externalId} user=${userId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Adding pad session to the collection: ${err}`);
  }
}
