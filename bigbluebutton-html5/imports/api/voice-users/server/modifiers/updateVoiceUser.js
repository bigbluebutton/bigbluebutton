import { Match, check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import VoiceUsers from '/imports/api/voice-users';
import flat from 'flat';
import { spokeTimeoutHandles, clearSpokeTimeout } from '/imports/api/common/server/helpers';

const TALKING_TIMEOUT = 6000;

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
    const user = VoiceUsers.findOne({ meetingId, intId }, {
      fields: {
        startTime: 1,
      },
    });

    if (user && !user.startTime) modifier.$set.startTime = Date.now();
    modifier.$set.spoke = true;
    modifier.$set.endTime = null;
    clearSpokeTimeout(meetingId, intId);
  }

  if (!voiceUser.talking) {
    const timeoutHandle = Meteor.setTimeout(() => {
      const user = VoiceUsers.findOne({ meetingId, intId }, {
        fields: {
          endTime: 1,
          talking: 1,
        },
      });

      if (user) {
        const { endTime, talking } = user;
        const spokeDelay = ((Date.now() - endTime) < TALKING_TIMEOUT);
        if (talking || spokeDelay) return;
        modifier.$set.spoke = false;
        modifier.$set.startTime = null;
        try {
          const numberAffected = VoiceUsers.update(selector, modifier);

          if (numberAffected) {
            Logger.debug('Update voiceUser', { voiceUser: intId, meetingId });
          }
        } catch (err) {
          Logger.error(`Update voiceUser=${intId}: ${err}`);
        }
      }
    }, TALKING_TIMEOUT);

    spokeTimeoutHandles[`${meetingId}-${intId}`] = timeoutHandle;
    modifier.$set.endTime = Date.now();
  }

  try {
    const numberAffected = VoiceUsers.update(selector, modifier);

    if (numberAffected) {
      Logger.debug('Update voiceUser', { voiceUser: intId, meetingId });
    }
  } catch (err) {
    Logger.error(`Update voiceUser=${intId}: ${err}`);
  }
}
