import { Meteor } from 'meteor/meteor';

const Captions = new Mongo.Collection('captions');

if (Meteor.isServer) {
  // types of queries for the captions:
  // 1. meetingId, locale, 'captionHistory.index' (History)
  // 2. meetingId, locale (Owner update, Caption update, addCaption)
  // 3. meetingId ( clear Captions)

  Captions._ensureIndex({ meetingId: 1, locale: 1 });
}

export default Captions;
