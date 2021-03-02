import { Meteor } from 'meteor/meteor';

const Annotations = new Mongo.Collection('annotations');

if (Meteor.isServer) {
  // types of queries for the annotations  (Total):
  // 1. meetingId, id, userId               ( 8 )
  // 2. meetingId, id, userId, whiteboardId ( 1 )
  // 3. meetingId                           ( 1 )
  // 4. meetingId, whiteboardId             ( 1 )
  // 5. meetingId, whiteboardId, id         ( 1 )
  // 6. meetingId, whiteboardId, userId     ( 1 )
  // These 2 indexes seem to cover all of the cases

  Annotations._ensureIndex({ id: 1 });
  Annotations._ensureIndex({ meetingId: 1, whiteboardId: 1, userId: 1 });
}

export default Annotations;
