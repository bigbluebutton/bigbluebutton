import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

const GuestUsers = new Mongo.Collection('guestUsers');

export default GuestUsers;
