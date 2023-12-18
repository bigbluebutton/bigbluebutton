import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import VoiceUsers from '/imports/api/voice-users/';
import addUserPsersistentData from '/imports/api/users-persistent-data/server/modifiers/addUserPersistentData';
import flat from 'flat';
import { lowercaseTrim } from '/imports/utils/string-utils';

import addVoiceUser from '/imports/api/voice-users/server/modifiers/addVoiceUser';

export default async function addUser(meetingId, userData) {
  const user = userData;

  check(meetingId, String);

  check(user, {
    intId: String,
    extId: String,
    name: String,
    role: String,
    guest: Boolean,
    authed: Boolean,
    waitingForAcceptance: Match.Maybe(Boolean),
    guestStatus: String,
    emoji: String,
    reactionEmoji: String,
    raiseHand: Boolean,
    away: Boolean,
    presenter: Boolean,
    locked: Boolean,
    avatar: String,
    color: String,
    pin: Boolean,
    clientType: String,
  });

  const userId = user.intId;

  const selector = {
    meetingId,
    userId,
  };
  const Meeting = await Meetings.findOneAsync({ meetingId });

  const userInfos = {
    meetingId,
    sortName: lowercaseTrim(user.name),
    speechLocale: '',
    mobile: false,
    breakoutProps: {
      isBreakoutUser: Meeting.meetingProp.isBreakout,
      parentId: Meeting.breakoutProps.parentId,
    },
    effectiveConnectionType: null,
    inactivityCheck: false,
    responseDelay: 0,
    loggedOut: false,
    left: false,
    ...flat(user),
  };

  const modifier = {
    $set: userInfos,
  };
  await addUserPsersistentData(userInfos);
  // Only add an empty VoiceUser if there isn't one already and if the user coming in isn't a
  // dial-in user. We want to avoid overwriting good data
  const voiceUser = await VoiceUsers.findOneAsync({ meetingId, intId: userId });
  if (user.clientType !== 'dial-in-user' && !voiceUser) {
    await addVoiceUser(meetingId, {
      voiceUserId: '',
      intId: userId,
      callerName: user.name,
      callerNum: '',
      color: user.color,
      muted: false,
      talking: false,
      callingWith: '',
      listenOnly: false,
      voiceConf: '',
      joined: false,
    });
  }

  /**
   * Add a verification to check if the user was set as presenter.
   * In some cases the user information is set after the presenter is set
   * causing the first moderator to join a meeting be marked as presenter: false
   */
  const partialUser = await Users.findOneAsync(selector);

  if (partialUser?.presenter) {
    modifier.$set.presenter = true;
  }

  try {
    const { insertedId } = await Users.upsertAsync(selector, modifier);

    if (insertedId) {
      Logger.info(`Added user id=${userId} meeting=${meetingId}`);
    } else {
      Logger.info(`Upserted user id=${userId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Adding user to collection: ${err}`);
  }
}
