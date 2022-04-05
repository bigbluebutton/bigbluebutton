// import { Meteor } from 'meteor/meteor';

// const collectionOptions = Meteor.isClient ? {
//   connection: null,
// } : {};

// const Shapes = new Mongo.Collection('shapes', collectionOptions);

// if (Meteor.isServer) {
//   // types of queries for the users:
//   // 1. meetingId
//   // 2. meetingId, id
//   // { connection: Meteor.isClient ? null : true }
//   // Shapes._ensureIndex({ });
//   Shapes._ensureIndex({ meetingId: 1 });
//   Shapes._ensureIndex({ id: 1 });
// }

// export default Shapes;


import { Meteor } from 'meteor/meteor';

const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

const Shapes = new Mongo.Collection('shapes', collectionOptions);

if (Meteor.isServer) {
  // types of queries for the users:
  // 1. meetingId
  // 2. meetingId, id
  // { connection: Meteor.isClient ? null : true }
  // Shapes._ensureIndex({ });
  Shapes._ensureIndex({ meetingId: 1, id: 1 });
  Shapes._ensureIndex({ meetingId: 1 });
  Shapes._ensureIndex({ id: 1 });
}

export default Shapes;
