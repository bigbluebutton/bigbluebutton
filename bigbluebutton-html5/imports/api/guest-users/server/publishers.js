import GuestUsers from '/imports/api/guest-users/';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

function guestUsers(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  Logger.info(`Publishing Slides for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return GuestUsers.find({ meetingId });
}

function publish(...args) {
  const boundSlides = guestUsers.bind(this);
  return boundSlides(...args);
}

Meteor.publish('guestUser', publish);
