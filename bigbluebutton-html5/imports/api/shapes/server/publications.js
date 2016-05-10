import { Shapes } from '/imports/api/shapes/shapesCollection';

Meteor.publish('shapes', function (meetingId) {
  return Shapes.find({
    meetingId: meetingId,
  });
});
