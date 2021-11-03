import { Meteor } from 'meteor/meteor';
import addGlobalAccess from './methods/addGlobalAccess';
import addIndividualAccess from './methods/addIndividualAccess';
import removeGlobalAccess from './methods/removeGlobalAccess';
import removeIndividualAccess from './methods/removeIndividualAccess';

Meteor.methods({
  addGlobalAccess,
  addIndividualAccess,
  removeGlobalAccess,
  removeIndividualAccess,
});
