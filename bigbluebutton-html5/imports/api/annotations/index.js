import { Meteor } from 'meteor/meteor';
import Users from '/imports/api/users';

const Annotations = new Mongo.Collection('annotations');
const Streamer = new Meteor.Streamer('annotations', { retransmit: false, });

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

  import sendAnnotation from './server/methods/sendAnnotation';

  Streamer.on('publish', ({ credentials, payload }) => {
    payload.forEach(annotation => sendAnnotation(credentials, annotation));
  });

  Streamer.allowRead(function(eventName, ...args) {
    return true;
  });

  Streamer.allowEmit(function(eventName, { meetingId }) {
    return this.userId && this.userId.includes(meetingId);
  });

  Streamer.allowWrite(function(eventName, { credentials }) {
    if (!this.userId || !credentials) return false;

    const { meetingId, requesterUserId: userId, requesterToken: authToken } = credentials;

    const user = Users.findOne({
      meetingId,
      userId,
      authToken,
      connectionId: this.connection.id,
      validated: true,
      connectionStatus: 'online',
    });

    if (!user) return false;

    return true;
  });
}

export default Annotations;
export const AnnotationsStreamer = Streamer;
