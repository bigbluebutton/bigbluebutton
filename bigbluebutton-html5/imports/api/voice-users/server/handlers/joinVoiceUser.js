import { check } from 'meteor/check';

import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import addVoiceUser from '../modifiers/addVoiceUser';

export default function handleJoinVoiceUser({ body }, meetingId) {
  const voiceUser = body;
  voiceUser.joined = true;

  check(meetingId, String);
  check(voiceUser, {
    voiceConf: String,
    intId: String,
    voiceUserId: String,
    callerName: String,
    callerNum: String,
    muted: Boolean,
    talking: Boolean,
    callingWith: String,
    listenOnly: Boolean,
    joined: Boolean,
  });

  const {
    intId,
    callerName,
  } = voiceUser;

  if (intId.toString().startsWith('v_')) {
    /* voice-only user - called into the conference */

    const selector = {
      meetingId,
      userId: intId,
    };

    const USER_CONFIG = Meteor.settings.public.user;
    const ROLE_VIEWER = USER_CONFIG.role_viewer;

    const modifier = {
      $set: {
        meetingId,
        connectionStatus: 'online',
        roles: [ROLE_VIEWER.toLowerCase()],
        sortName: callerName.trim().toLowerCase(),
        color: '#ffffff', // TODO
        intId,
        extId: intId, // TODO
        name: callerName,
        role: ROLE_VIEWER.toLowerCase(),
        guest: false,
        authed: true,
        waitingForAcceptance: false,
        emoji: 'none',
        presenter: false,
        locked: false, // TODO
        avatar: '',
        clientType: 'dial-in__1',
      },
    };

    const cb = (err, numChanged) => {
      if (err) {
        return Logger.error(`Adding call-in user to VoiceUser collection: ${err}`);
      }

      const { insertedId } = numChanged;
      if (insertedId) {
        return Logger.info(`Added a call-in user id=${intId} meeting=${meetingId}`);
      }

      return Logger.info(`Upserted a call-in user id=${intId} meeting=${meetingId}`);
    };

    Users.upsert(selector, modifier, cb);
  } else {

    /* there is a corresponding web user in Users collection -- no need to add new one */
  }

  return addVoiceUser(meetingId, voiceUser);
}
