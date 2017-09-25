import { Meteor } from 'meteor/meteor';

const Annotations = new Mongo.Collection('annotations');

if (Meteor.isServer) {
  // types of queries for the annotations:
  // 1. meetingId, whiteboardId
  // 2. meetingId, whiteboardId, userId
  // 3. meetingId, id, userId
  // 4. meetingId, whiteboardId, id
  // These 2 indexes seem to cover all of the cases
  // Either mongo uses a whole or a part of the compound index
  // Or it uses 'id' and then matches other fields

  Annotations._ensureIndex({ id: 1 });
  Annotations._ensureIndex({ meetingId: 1, whiteboardId: 1, userId: 1 });
}

export default Annotations;
