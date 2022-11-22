import { Meteor } from 'meteor/meteor';
import takeOwnership from '/imports/api/captions/server/methods/takeOwnership';
import appendText from '/imports/api/captions/server/methods/appendText';
import getPadId from '/imports/api/captions/server/methods/getPadId';
import toggleAutoTranslation from '/imports/api/captions/server/methods/toggleAutoTranslation';

Meteor.methods({
  takeOwnership,
  appendText,
  getPadId,
  toggleAutoTranslation,
});
