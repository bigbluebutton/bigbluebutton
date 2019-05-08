import { check } from 'meteor/check';
import meetingHasEnded from '../modifiers/meetingHasEnded';
import Meetings from '/imports/api/meetings';
import Breakouts from '/imports/api/breakouts';
import setConnectionStatus from '/imports/api/users/server/modifiers/setConnectionStatus';
import Users from '/imports/api/users/';
import Logger from '/imports/startup/server/logger';

export default function handleMeetingEnd({ body }, meetingId) {
  check(meetingId, String);

  const cb = (err, num) => {
    if (err) {
      Logger.error(`Meeting endind error: ${err}`);
      return;
    }
    if (num) {
      Users.find({ meetingId })
        .fetch().map(user => setConnectionStatus(user.meetingId, user.userId, 'offline'));
      Meteor.setTimeout(() => { meetingHasEnded(meetingId); }, 10000);
    }
  };

  Meetings.update({ meetingId }, { $set: { meetingEnded: true } }, cb);
  Breakouts.update({ parentMeetingId: meetingId }, { $set: { meetingEnded: true } }, cb);
}
