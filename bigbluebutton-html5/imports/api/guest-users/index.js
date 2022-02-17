import { Mongo } from 'meteor/mongo';

const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

const GuestUsers = new Mongo.Collection('guestUsers', collectionOptions);

export default GuestUsers;
