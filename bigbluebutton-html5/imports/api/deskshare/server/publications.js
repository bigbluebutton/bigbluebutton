import { Deskshare } from '/imports/api/deskshare/deskshare';

Meteor.publish('deskshare', function (meetingId) {
  Meteor.log.info(`publishing deskshare for ${meetingId}`);
  return Deskshare.find({meetingId: meetingId});
});
