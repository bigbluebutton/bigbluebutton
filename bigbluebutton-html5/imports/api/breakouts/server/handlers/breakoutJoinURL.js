import Breakouts from '/imports/api/breakouts';
import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import { XMLHttpRequest } from 'xmlhttprequest';
import xml2js from 'xml2js';
const xmlParser = new xml2js.Parser();

const getUrlParams = url => {
  let urlParams = {};
  url.split('?')[1].split('&').map(s => {
    const p = s.split('=');
    urlParams[p[0]] = p[1];
  });

  return urlParams;
};

export default function breakoutJoinURL({ payload }) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CLIENT_HTML = 'HTML5';

  const {
    noRedirectJoinURL,
  } = payload;

  check(noRedirectJoinURL, String);

  const urlParams = getUrlParams(noRedirectJoinURL);

  const selector = {
    externalMeetingId: urlParams.meetingID,
  };

  let breakout = Breakouts.findOne(selector);

  const res = Meteor.http.call('get', noRedirectJoinURL);
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

    const cb = (err, numChanged) => {
      if (err) {
        return Logger.error(`Adding breakout to collection: ${err}`);
      }

      const {
        insertedId,
      } = numChanged;
      if (insertedId) {
        return Logger.info(`Added breakout id=${urlParams.meetingID}`);
      }

      return Logger.info(`Upserted breakout id=${urlParams.meetingID}`);
    };

    return Breakouts.upsert(selector, modifier, cb);
  });
}
