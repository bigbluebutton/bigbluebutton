import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import BreakoutsHistory from '/imports/api/breakouts-history';

export default function handleSendMessageToAllBreakoutRoomsEvtMsg({ body }, meetingId) {

  const {
    senderId,
    msg,
    totalOfRooms,
  } = body;

  check(meetingId, String);
  check(senderId, String);
  check(msg, String);
  check(totalOfRooms, Number);

  const selector = {
    meetingId,
  };

  const modifier = {
    $push: {
      broadcastMsgs: {
        senderId,
        msg,
        totalOfRooms,
      },
    },
  };

  try {
    const { insertedId } = BreakoutsHistory.upsert(selector, modifier);

    if (insertedId) {
      Logger.info(`Added broadCastMsg to breakout-history Data: meeting=${meetingId}`);
    } else {
      Logger.info(`Upserted broadCastMsg to breakout-history Data: meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Adding broadCastMsg to the collection breakout-history: ${err}`);
  }
}
