import { Meteor } from 'meteor/meteor';

const Slides = new Mongo.Collection('slides');

if (Meteor.isServer) {
  // types of queries for the slides:
  // 1. meetingId
  // 2. meetingId, presentationId
  // 3. meetingId, presentationId, id

  Slides._ensureIndex({ meetingId: 1, presentationId: 1, id: 1 });
}

export default Slides;
