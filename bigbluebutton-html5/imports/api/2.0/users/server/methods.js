import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import userLogout from './methods/userLogout';
import validateAuthToken from './methods/validateAuthToken';
import setEmojiStatus from './methods/setEmojiStatus';
import listenOnlyToggle from './methods/listenOnlyToggle';

Meteor.methods(mapToAcl(['methods.userLogout', 'methods.setEmojiStatus', 'methods.listenOnlyToggle',
], {
  userLogout,
  setEmojiStatus,
  listenOnlyToggle,
}));

Meteor.methods({ validateAuthToken2x: validateAuthToken });
