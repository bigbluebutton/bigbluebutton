import { Meteor } from 'meteor/meteor';
import validateAuthToken from './methods/validateAuthToken';
import setEmojiStatus from './methods/setEmojiStatus';
import setMobileUser from './methods/setMobileUser';
import assignPresenter from './methods/assignPresenter';
import changeRole from './methods/changeRole';
import removeUser from './methods/removeUser';
import toggleUserLock from './methods/toggleUserLock';
import setUserEffectiveConnectionType from './methods/setUserEffectiveConnectionType';
import userActivitySign from './methods/userActivitySign';
import userLeftMeeting from './methods/userLeftMeeting';
import changePin from './methods/changePin';
import setRandomUser from './methods/setRandomUser';
import setExitReason from './methods/setExitReason';

Meteor.methods({
  setEmojiStatus,
  setMobileUser,
  assignPresenter,
  changeRole,
  removeUser,
  validateAuthToken,
  toggleUserLock,
  setUserEffectiveConnectionType,
  userActivitySign,
  userLeftMeeting,
  changePin,
  setRandomUser,
  setExitReason,
});
