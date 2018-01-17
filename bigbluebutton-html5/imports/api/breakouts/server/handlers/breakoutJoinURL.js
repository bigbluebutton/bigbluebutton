import xml2js from 'xml2js';
import url from 'url';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Breakouts from '/imports/api/breakouts';

const xmlParser = new xml2js.Parser();

const getUrlParams = (urlToParse) => {
  const options = { parseQueryString: true };
  const parsedUrl = url.parse(urlToParse, options);
  return parsedUrl.query;
};


export default function handleBreakoutJoinURL({ body }) {
  const {
    noRedirectJoinURL,
    userId,
    breakoutId,
  } = body;

  check(noRedirectJoinURL, String);

  const urlParams = getUrlParams(noRedirectJoinURL);

  const selector = {
    breakoutId,
  };

  const res = Meteor.http.call('get', noRedirectJoinURL);

  xmlParser.parseString(res.content, (err, parsedXML) => {
    if (err) {
      return Logger.error(`An Error occured when parsing xml response for: ${noRedirectJoinURL}`);
    }

    const breakout = Breakouts.findOne(selector);

    const { response } = parsedXML;
    const users = breakout.users;

    const user = {
      userId,
      urlParams: {
        meetingId: response.meeting_id[0],
        userId: response.user_id[0],
        authToken: response.auth_token[0],
        sessionToken: response.session_token[0],
      },
    };

    const userExists = users.find(u => user.userId === u.userId);

    if (userExists) {
      return null;
    }

    const modifier = {
      $push: {
        users: user,
      },
    };

    const cb = (cbErr, numChanged) => {
      if (cbErr) {
        return Logger.error(`Adding breakout to collection: ${cbErr}`);
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
