import GuestUsers from '/imports/api/guest-users/';
import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

function guestUsers() {
  if (!this.userId) {
    return GuestUsers.find({ meetingId: '' });
  }

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  Logger.info(`Publishing Slides for ${meetingId} ${requesterUserId}`);

  return GuestUsers.find({ meetingId });
}

function publish(...args) {
  const boundSlides = guestUsers.bind(this);
  return boundSlides(...args);
}

Meteor.publish('guestUser', publish);
