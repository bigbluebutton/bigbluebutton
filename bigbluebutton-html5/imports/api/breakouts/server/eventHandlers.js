import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { XMLHttpRequest } from 'xmlhttprequest';
import xml2js from 'xml2js';

const xmlParser = new xml2js.Parser();

import Breakouts from '/imports/api/breakouts';

RedisPubSub.on('CreateBreakoutRoomRequest', ({ payload }) => {
  const selector = {
    breakoutMeetingId: payload.breakoutMeetingId,
  };
  const modifier = payload;

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding breakout to collection: ${err}`);
    }

    const {
      insertedId,
    } = numChanged;
    if (insertedId) {
      return Logger.info(`Added breakout id=${payload.breakoutMeetingId}`);
    }

    return Logger.info(`Upserted breakout id=${payload.breakoutMeetingId}`);
  };

  Breakouts.upsert(selector, modifier, cb);
});

RedisPubSub.on('BreakoutRoomStarted', ({ payload }) => {
  const selector = {
    breakoutMeetingId: payload.meetingId,
  };

  modifier = {
    $set: {
      users: [],
      externalMeetingId: payload.externalMeetingId,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding breakout to collection: ${err}`);
    }

    const {
      insertedId,
    } = numChanged;
    if (insertedId) {
      return Logger.info(`Added breakout id=${payload.meetingId}`);
    }

    return Logger.info(`Upserted breakout id=${payload.meetingId}`);
  };

  Breakouts.upsert(selector, modifier, cb);
});

RedisPubSub.on('BreakoutRoomJoinURL', ({ payload }) => {
  const REDIS_CONFIG = Meteor.settings.redis;

  const {
    meetingId,
    joinURL,
  } = payload;

  let urlParams = {};
  joinURL.split('?')[1].split('&').map(s => {
    const p = s.split('=');
    urlParams[p[0]] = p[1];
  });

  const selector = {
    externalMeetingId: urlParams.meetingID,
  };

  let breakout = Breakouts.findOne(selector);

  if (urlParams.redirect !== 'false') {
    const MessageContent = {
      breakoutMeetingId: breakout.externalMeetingId,
      meetingId: breakout.parentMeetingId,
      redirect: false,
      userId: payload.userId,
    };

    const CHANNEL = REDIS_CONFIG.channels.toBBBApps.users;
    const eventName = 'RequestBreakoutJoinURL';

    RedisPubSub.publish(CHANNEL, eventName, MessageContent);
  } else {
    const res = Meteor.http.call('get', joinURL);
    xmlParser.parseString(res.content, (err, parsedXML) => {
      breakout = Breakouts.findOne(selector);

      const { response } = parsedXML;
      let users = breakout.users;

      let user = {
        userId: payload.userId,
        urlParams: {
          meetingId: response.meeting_id[0],
          userId: response.user_id[0],
          authToken: response.auth_token[0],
        },
      };

      const userExists = users.find(u => user.userId === u.userId);

      if (userExists) {
        return;
      }

      const modifier = {
        $push: {
          users: user,
        },
      };

      Breakouts.upsert(selector, modifier);
    });
  }
});

RedisPubSub.on('UpdateBreakoutUsers', ({ payload }) => console.info('UPDT', payload));

RedisPubSub.on('BreakoutRoomClosed', ({ payload }) => {
  Breakouts.remove({
    breakoutMeetingId: payload.meetingId,
  });
});
