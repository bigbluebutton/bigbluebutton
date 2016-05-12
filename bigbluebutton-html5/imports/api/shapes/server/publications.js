import Shapes from '/imports/api/shapes/collection';

Meteor.publish('shapes', function (meetingId) {
  return Shapes.find({
    meetingId: meetingId,
  });
});
