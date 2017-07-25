import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import userLogout from './methods/userLogout';
import validateAuthToken from './methods/validateAuthToken';
import setEmojiStatus from './methods/setEmojiStatus';

Meteor.methods(mapToAcl(['methods.userLogout', 'methods.setEmojiStatus',
], {
  userLogout,
  setEmojiStatus,
}));

Meteor.methods({ validateAuthToken2x: validateAuthToken });
