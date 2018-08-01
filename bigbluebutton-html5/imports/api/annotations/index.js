import { Meteor } from 'meteor/meteor';
import Users from '/imports/api/users';

const Annotations = new Mongo.Collection('annotations');
const Streamer = new Meteor.Streamer('annotations', { retransmit: false, });

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
