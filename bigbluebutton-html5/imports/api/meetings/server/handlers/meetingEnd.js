import { check } from 'meteor/check';
import meetingHasEnded from '../modifiers/meetingHasEnded';
import Meetings from '/imports/api/meetings';
import Breakouts from '/imports/api/breakouts';
import Users from '/imports/api/users/';
import Logger from '/imports/startup/server/logger';

export default function handleMeetingEnd({ body }) {
  check(body, Object);
  const { meetingId } = body;
  check(meetingId, String);

  const cb = (err, num, meetingType) => {
    if (err) {
      Logger.error(`${meetingType} ending error: ${err}`);
      return;
    }
    if (num) {
      Users.update({ meetingId },
        { $set: { connectionStatus: 'offline' } },
        (error, numAffected) => {
          if (error) {
            Logger.error(`Error marking ending ${meetingType} users as offline: ${meetingId} ${err}`);
            return;
          }

          if (numAffected) {
            Logger.info(`Success marking ending ${meetingType} users as offline: ${meetingId}`);
          }
        });
      Meteor.setTimeout(() => { meetingHasEnded(meetingId); }, 10000);
    }
  };

  Meetings.update({ meetingId },
    { $set: { meetingEnded: true } },
    (err, num) => { cb(err, num, 'Meeting'); });

  Breakouts.update({ parentMeetingId: meetingId },
    { $set: { meetingEnded: true } },
    (err, num) => { cb(err, num, 'Breakout'); });
}
