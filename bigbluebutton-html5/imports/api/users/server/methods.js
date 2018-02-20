import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import validateAuthToken from './methods/validateAuthToken';
import setEmojiStatus from './methods/setEmojiStatus';
import assignPresenter from './methods/assignPresenter';
import changeRole from './methods/changeRole';
import removeUser from './methods/removeUser';

Meteor.methods(mapToAcl(['methods.setEmojiStatus', 'methods.assignPresenter', 'methods.changeRole',
  'methods.removeUser'], {
  setEmojiStatus,
  assignPresenter,
  changeRole,
  removeUser,
}));

Meteor.methods({ validateAuthToken });
