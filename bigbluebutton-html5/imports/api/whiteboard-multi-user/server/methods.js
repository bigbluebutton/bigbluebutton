import { Meteor } from 'meteor/meteor';
import addIndividualAccess from './methods/addIndividualAccess';
import removeGlobalAccess from './methods/removeGlobalAccess';
import removeIndividualAccess from './methods/removeIndividualAccess';

Meteor.methods({
  addIndividualAccess,
  removeGlobalAccess,
  removeIndividualAccess,
});
