import Breakouts from '/imports/api/breakouts';
import { Meteor } from 'meteor/meteor';

import mapToAcl from '/imports/startup/mapToAcl';

Meteor.publish('breakouts', function () {
  const boundBreakouts = breakouts.bind(this);
  return mapToAcl('subscriptions.breakouts', boundBreakouts)(arguments);
});

function breakouts(credentials) {
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
};
