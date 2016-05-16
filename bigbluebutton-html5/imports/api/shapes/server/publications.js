import Shapes from '/imports/api/shapes';

Meteor.publish('shapes', function (meetingId) {
  return Shapes.find({
    meetingId: meetingId,
  });
});
