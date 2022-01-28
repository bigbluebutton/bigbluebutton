import { check } from 'meteor/check';
import BreakoutsHistory from '/imports/api/breakouts-history';
import Logger from '/imports/startup/server/logger';

export default function handleBreakoutRoomsList({ body }) {
  const {
    meetingId,
    rooms,
  } = body;

  check(meetingId, String);

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: {
      meetingId,
      rooms,
    },
  };

  try {
    const { insertedId } = BreakoutsHistory.upsert(selector, modifier);

    if (insertedId) {
      Logger.info(`Added rooms to breakout-history Data: meeting=${meetingId}`);
    } else {
      Logger.info(`Upserted rooms to breakout-history Data: meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Adding rooms to the collection breakout-history: ${err}`);
  }
}
