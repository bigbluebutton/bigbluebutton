import { Meteor } from 'meteor/meteor';
import takeOwnership from '/imports/api/captions/server/methods/takeOwnership';
import vrEditCaptions from '/imports/api/captions/server/methods/vrEditCaptions';

Meteor.methods({
  takeOwnership,
  vrEditCaptions,
});
