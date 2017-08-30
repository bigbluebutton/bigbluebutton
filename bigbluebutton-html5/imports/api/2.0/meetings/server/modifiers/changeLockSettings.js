import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/2.0/meetings';

export default function ChangeLockSettings(meetingId, payload) {

  const selector = {
    meetingId
  };

  const modifier = {
    $set: {
      body: payload,
    },
  };

  Meetings.upsert(selector, modifier, cb);

  const cb = (err) => {
    if (err) {
      return Logger.error(`Removing user from collection: ${err}`);
    }
  };
  
  const settings = JSON.stringify(body);
  return Logger.info(`updated lock settings=${settings} for meeting=${meetingId} `);;
};