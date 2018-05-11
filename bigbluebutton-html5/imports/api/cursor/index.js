import { Meteor } from 'meteor/meteor';
import Users from '/imports/api/users';

const Cursor = new Mongo.Collection('cursor');
const Streamer = new Meteor.Streamer('cursor', { retransmit: false, });

if (Meteor.isServer) {
  import publishCursorUpdate from './server/methods/publishCursorUpdate';

  Streamer.on('publish', (message) => {
    publishCursorUpdate(message.credentials, message.payload);
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

export default Cursor;
export const CursorStreamer = Streamer;
