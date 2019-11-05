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

  const modifier = {
    $set: Object.assign(
      flat(voiceUser),
    ),
  };

  if (voiceUser.talking) {
    modifier.$set.spoke = true;
    modifier.$set.startTime = new Date().getTime();
    modifier.$set.endTime = null;
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

      if (user) {
        const { endTime } = user;
        const stillTalking = ((new Date().getTime() - endTime) < TALKING_TIMEOUT);
        if (!endTime || stillTalking) return;
        modifier.$set.spoke = false;
        VoiceUsers.update(selector, modifier, cb);
      }
    }, TALKING_TIMEOUT);

    modifier.$set.endTime = new Date().getTime();
  }

  return VoiceUsers.update(selector, modifier, cb);
}
