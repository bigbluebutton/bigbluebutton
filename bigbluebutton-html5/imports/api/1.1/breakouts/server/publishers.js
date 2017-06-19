import Breakouts from '/imports/api/1.1/breakouts';
import { Meteor } from 'meteor/meteor';

Meteor.publish('breakouts', (credentials) => {
  const {
    meetingId,
    requesterUserId,
  } = credentials;

  return Breakouts.find({
    $or: [
      { breakoutMeetingId: meetingId },
      {
        users: {
          $elemMatch: { userId: requesterUserId },
        },
      },
    ],
  });
});
