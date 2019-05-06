import { check } from 'meteor/check';
import meetingHasEnded from '../modifiers/meetingHasEnded';
import Meetings from '/imports/api/meetings';
import Breakouts from '/imports/api/breakouts';
import setConnectionStatus from '/imports/api/users/server/modifiers/setConnectionStatus';
import Users from '/imports/api/users/';

export default function handleMeetingEnd({ body }, meetingId) {
  check(meetingId, String);

  const cb = () => {
    Users.find({ meetingId }).fetch().map(user => setConnectionStatus(user.meetingId, user.userId, 'offline'));
    return Meteor.setTimeout(() => { meetingHasEnded(meetingId); }, 10000);
  };

  Meetings.update({
    meetingId,
  }, {
    $set: {
      meetingEnded: true,
    },
  }, cb);

  Breakouts.update({
    parentMeetingId: meetingId,
  }, {
    $set: {
      meetingEnded: true,
    },
  }, cb);
}
