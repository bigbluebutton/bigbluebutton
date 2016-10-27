import Breakouts from '/imports/api/breakouts';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { isAllowedTo } from '/imports/startup/server/userPermissions';

Meteor.publish('breakouts', credentials => {
  Logger.info(credentials);
  Breakouts.find({
    parentMeetingId: credentials.meetingId,
  });
});
