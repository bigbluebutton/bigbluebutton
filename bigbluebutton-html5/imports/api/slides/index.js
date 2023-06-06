import { Meteor } from 'meteor/meteor';

const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

const Slides = new Mongo.Collection('slides', collectionOptions);
const SlidePositions = new Mongo.Collection('slide-positions', collectionOptions);

if (Meteor.isServer) {
  // types of queries for the slides:

  // 1. meetingId                                  ( 1 )
  // 2. meetingId, podId                           ( 1 )
  // 3. meetingId, presentationId                  ( 1 )
  // 3. meetingId, presentationId, num             ( 1 )
  // 4. meetingId, podId, presentationId, id       ( 3 ) - incl. resizeSlide, which can be intense
  // 5. meetingId, podId, presentationId, current  ( 1 )

  Slides.createIndexAsync({
    meetingId: 1, podId: 1, presentationId: 1, id: 1,
  });

  SlidePositions.createIndexAsync({
    meetingId: 1, podId: 1, presentationId: 1, id: 1,
  });
}

export { Slides, SlidePositions };
