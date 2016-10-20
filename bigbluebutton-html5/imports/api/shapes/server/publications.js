import Shapes from '/imports/api/shapes';

Meteor.publish('shapes', function (credentials) {
  const { meetingId } = credentials;
  return Shapes.find({
    meetingId: meetingId,
  });
});
