import { Meteor } from 'meteor/meteor';

const Pads = new Mongo.Collection('pads');
const PadsSessions = new Mongo.Collection('pads-sessions');
const PadsUpdates = new Mongo.Collection('pads-updates');

if (Meteor.isServer) {
  Pads._ensureIndex({ meetingId: 1, externalId: 1 });
  PadsSessions._ensureIndex({ meetingId: 1, userId: 1 });
  PadsUpdates._ensureIndex({ meetingId: 1, externalId: 1 });
}

export {
  PadsSessions,
  PadsUpdates,
};

export default Pads;
