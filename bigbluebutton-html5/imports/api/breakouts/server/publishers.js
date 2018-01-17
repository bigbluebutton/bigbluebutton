import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import Breakouts from '/imports/api/breakouts';
import Logger from '/imports/startup/server/logger';

function breakouts(credentials) {
  const {
    meetingId,
    requesterUserId,
  } = credentials;

  Logger.info(`Publishing Breakouts for ${meetingId} ${requesterUserId}`);

  return Breakouts.find({
    $or: [
      { breakoutId: meetingId },
      { meetingId },
      {
        users: {
          $elemMatch: { userId: requesterUserId },
        },
      },
    ],
  });
}

function publish(...args) {
  const boundBreakouts = breakouts.bind(this);
  return mapToAcl('subscriptions.breakouts', boundBreakouts)(args);
}

Meteor.publish('breakouts', publish);
