import { Match, check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import VoiceUsers from '/imports/api/voice-users';
import flat from 'flat';

const TALKING_TIMEOUT = 3000;

export default function updateVoiceUser(meetingId, voiceUser) {
  check(meetingId, String);
  check(voiceUser, {
    intId: String,
    voiceUserId: String,
    talking: Match.Maybe(Boolean),
    muted: Match.Maybe(Boolean),
    voiceConf: String,
    joined: Match.Maybe(Boolean),
  });

  const { intId } = voiceUser;

  const selector = {
    meetingId,
    intId,
  };

  let modifier = {
    $set: Object.assign(
      { meetingId },
      flat(voiceUser),
    ),
  };

  if (voiceUser.talking) {
    modifier = {
      $set: Object.assign(
        { meetingId, spoke: true, endTime: null },
        flat(voiceUser),
      ),
    };
  }

  const cb = (err) => {
    if (err) {
      return Logger.error(`Update voiceUser=${intId}: ${err}`);
    }

    return Logger.debug(`Update voiceUser=${intId} meeting=${meetingId}`);
  };

  if (!voiceUser.talking) {
    Meteor.setTimeout(() => {
      const user = VoiceUsers.findOne({ meetingId, intId }, {
        fields: {
          endTime: 1,
        },
      });
      const mod = {
        $set: Object.assign(
          { meetingId, spoke: false },
          flat(voiceUser),
        ),
      };

      if (user) {
        const { endTime } = user;
        const stillTalking = ((new Date().getTime() - endTime) < TALKING_TIMEOUT);
        if (!endTime || stillTalking) return;
        VoiceUsers.update(selector, mod, cb);
      }
    }, TALKING_TIMEOUT);

    modifier = {
      $set: Object.assign(
        { meetingId, endTime: new Date().getTime() },
        flat(voiceUser),
      ),
    };
  }

  return VoiceUsers.update(selector, modifier, cb);
}
