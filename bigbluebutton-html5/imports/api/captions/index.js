import { Meteor } from 'meteor/meteor';

const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

const Captions = new Mongo.Collection('captions', collectionOptions);

if (Meteor.isServer) {
  Captions._ensureIndex({ meetingId: 1, locale: 1 });
}

export default Captions;
