import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';

// import handleChatMessage from './handlers/chatMessage';
// import handleChatHistory from './handlers/chatHistory';

import Breakouts from '/imports/api/breakouts';

RedisPubSub.on('CreateBreakoutRoomRequest', ({ payload }) => {
  console.info('CreateBreakoutRoomRequest', payload);

  const selector = {
    breakoutMeetingId: payload.breakoutMeetingId,
  };
  const modifier = payload;

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding breakout to collection: ${err}`);
    }

    const { insertedId } = numChanged;
    if (insertedId) {
      return Logger.info(`Added breakout id=${payload.breakoutMeetingId}`);
    }

    return Logger.info(`Upserted breakout id=${payload.breakoutMeetingId}`);
  };

  Breakouts.upsert(selector, modifier, cb);
});

RedisPubSub.on('BreakoutRoomStarted', ({ payload }) => {
  console.info('BreakoutRoomStarted', payload);

  const selector = {
    breakoutMeetingId: payload.meetingId,
  };

  modifier = {
    $set: {
      externalMeetingId: payload.externalMeetingId,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding breakout to collection: ${err}`);
    }

    const { insertedId } = numChanged;
    if (insertedId) {
      return Logger.info(`Added breakout id=${payload.meetingId}`);
    }

    return Logger.info(`Upserted breakout id=${payload.meetingId}`);
  };

  Breakouts.upsert(selector, modifier, cb);
});

RedisPubSub.on('BreakoutRoomJoinURL', ({ payload }) => {
  console.info('BreakoutRoomJoinURL', payload);
});
