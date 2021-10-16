import { Meteor } from 'meteor/meteor';
import takeOwnership from '/imports/api/captions/server/methods/takeOwnership';
import appendText from '/imports/api/captions/server/methods/appendText';
import getPadId from '/imports/api/captions/server/methods/getPadId';

Meteor.methods({
  takeOwnership,
  appendText,
  getPadId,
});
