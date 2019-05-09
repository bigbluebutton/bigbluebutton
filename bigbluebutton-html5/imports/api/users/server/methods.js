import { Meteor } from 'meteor/meteor';
import validateAuthToken from './methods/validateAuthToken';
import setEmojiStatus from './methods/setEmojiStatus';
import assignPresenter from './methods/assignPresenter';
import changeRole from './methods/changeRole';
import removeUser from './methods/removeUser';
import toggleUserLock from './methods/toggleUserLock';
import setUserEffectiveConnectionType from './methods/setUserEffectiveConnectionType';
import userActivitySign from './methods/userActivitySign';
import userChangedSettings from './methods/userChangedSettings';

Meteor.methods({
  setEmojiStatus,
  assignPresenter,
  changeRole,
  removeUser,
  validateAuthToken,
  toggleUserLock,
  setUserEffectiveConnectionType,
  userActivitySign,
  userChangedSettings,
});
