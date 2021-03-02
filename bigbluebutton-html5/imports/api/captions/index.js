import { Meteor } from 'meteor/meteor';

const Captions = new Mongo.Collection('captions');

if (Meteor.isServer) {
  Captions._ensureIndex({ meetingId: 1, padId: 1 });
}

export default Captions;
