import Slides from '/imports/api/slides';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import mapToAcl from '/imports/startup/mapToAcl';


Meteor.publish('slides', function() {
  const boundSlides = slides.bind(this);
  return mapToAcl('slides', boundSlides)(arguments);
});

function slides(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  Logger.info(`Publishing Slides for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return Slides.find({ meetingId });
};
