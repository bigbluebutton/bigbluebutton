import { Meteor } from 'meteor/meteor';
import validateAuthToken from './methods/validateAuthToken';
import setSpeechLocale from './methods/setSpeechLocale';
import setEmojiStatus from './methods/setEmojiStatus';
import assignPresenter from './methods/assignPresenter';
import removeUser from './methods/removeUser';
import toggleUserLock from './methods/toggleUserLock';
import setUserEffectiveConnectionType from './methods/setUserEffectiveConnectionType';
import userActivitySign from './methods/userActivitySign';
import userLeftMeeting from './methods/userLeftMeeting';
import setRandomUser from './methods/setRandomUser';
import setExitReason from './methods/setExitReason';
import clearAllUsersEmoji from './methods/clearAllUsersEmoji';

Meteor.methods({
  setSpeechLocale,
  setEmojiStatus,
  clearAllUsersEmoji,
  assignPresenter,
  removeUser,
  validateAuthToken,
  toggleUserLock,
  setUserEffectiveConnectionType,
  userActivitySign,
  userLeftMeeting,
  setRandomUser,
  setExitReason,
});
