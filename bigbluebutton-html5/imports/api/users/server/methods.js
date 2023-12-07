import { Meteor } from 'meteor/meteor';
import validateAuthToken from './methods/validateAuthToken';
import setSpeechLocale from './methods/setSpeechLocale';
import setUserEffectiveConnectionType from './methods/setUserEffectiveConnectionType';
import userActivitySign from './methods/userActivitySign';
import userLeftMeeting from './methods/userLeftMeeting';
import setRandomUser from './methods/setRandomUser';
import setExitReason from './methods/setExitReason';

Meteor.methods({
  setSpeechLocale,
  validateAuthToken,
  setUserEffectiveConnectionType,
  userActivitySign,
  userLeftMeeting,
  setRandomUser,
  setExitReason,
});
