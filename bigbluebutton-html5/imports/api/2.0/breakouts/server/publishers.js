import Breakouts from './../';
import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';

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
}

function publish(...args) {
  console.err("breakout2x publish");
  const boundBreakouts = breakouts.bind(this);
  return mapToAcl('subscriptions.breakouts', boundBreakouts)(args);
}

Meteor.publish('breakouts2x', publish);
