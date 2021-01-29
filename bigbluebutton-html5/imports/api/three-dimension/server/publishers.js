import { Meteor } from 'meteor/meteor';
import Three from '/imports/api/three-dimension';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

function threeD() {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  Logger.debug(`Publishing ThreeD for ${meetingId} ${requesterUserId}`);

  return Three.find({ userId: { $exists: false } }, {
    fields: Three,
  });
}

function publish(...args) {
  const boundThreeD = threeD.bind(this);
  return boundThreeD(...args);
}

Meteor.publish('three-d', publish);
