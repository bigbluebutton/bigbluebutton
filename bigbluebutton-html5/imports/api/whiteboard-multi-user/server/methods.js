import { Meteor } from 'meteor/meteor';
import addIndividualAccess from './methods/addIndividualAccess';
import removeIndividualAccess from './methods/removeIndividualAccess';

Meteor.methods({
  addIndividualAccess,
  removeIndividualAccess,
});
