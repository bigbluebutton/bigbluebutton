import { Meteor } from 'meteor/meteor';
import takeOwnership from '/imports/api/captions/server/methods/takeOwnership';
import appendText from '/imports/api/captions/server/methods/appendText';

Meteor.methods({
  takeOwnership,
  appendText,
});
