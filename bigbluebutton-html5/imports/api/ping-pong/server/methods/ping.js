import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Users from '/imports/api/users';

export default function ping(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);


  return Users.upsert({
    meetingId,
    userId: requesterUserId,
  }, {
    $set: {
      lastPing: Date.now(),
    },
  });
}
