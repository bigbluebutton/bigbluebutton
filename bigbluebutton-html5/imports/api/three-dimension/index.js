import { Meteor } from 'meteor/meteor';

const Three = new Mongo.Collection('three-d');

if (Meteor.isServer) {
  Three.allow({
    insert(userId, doc) {
      return true;
    },
  });

  Three._ensureIndex({ id: 1 });
}

export default Three;
