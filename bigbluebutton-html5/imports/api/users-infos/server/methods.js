import { Meteor } from 'meteor/meteor';
import requestUserInformation from './methods/requestUserInformation';
import removeUserInformation from './methods/removeUserInformation';

Meteor.methods({
  requestUserInformation,
  removeUserInformation,
});
