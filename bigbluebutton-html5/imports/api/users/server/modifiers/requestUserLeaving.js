import { publish } from '/imports/api/common/server/helpers';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import { logger } from '/imports/startup/server/logger';

// Corresponds to a valid action on the HTML clientside
// After authorization, publish a user_leaving_request in redis
// params: meetingid, userid as defined in BBB-App
export function requestUserLeaving(meetingId, userId) {
  const REDIS_CONFIG = Meteor.settings.redis;
  let voiceConf;
  const userObject = Users.findOne({
    meetingId: meetingId,
    userId: userId,
  });
  const meetingObject = Meetings.findOne({
    meetingId: meetingId,
  });

  if (meetingObject != null) {
    voiceConf = meetingObject.voiceConf;
  }

  if ((userObject != null) && (voiceConf != null) && (userId != null) && (meetingId != null)) {
    let lOnly = false;
    if (userObject.hasOwnProperty('user') && userObject.user.hasOwnProperty('listenOnly')) {
      lOnly = userObject.user.listenOnly;
    }

    // end listenOnly audio for the departing user
    if (lOnly) {
      const listenOnlyMessage = {
        payload: {
          userid: userId,
          meeting_id: meetingId,
          voice_conf: voiceConf,
          name: userObject.user.name,
        },
        header: {
          timestamp: new Date().getTime(),
          name: 'user_disconnected_from_global_audio',
        },
      };
      publish(REDIS_CONFIG.channels.toBBBApps.meeting, listenOnlyMessage);
    }

    // remove user from meeting
    const message = {
      payload: {
        meeting_id: meetingId,
        userid: userId,
      },
      header: {
        timestamp: new Date().getTime(),
        name: 'user_leaving_request',
      },
    };
    logger.info(`sending a user_leaving_request for ${meetingId}:${userId}`);
    return publish(REDIS_CONFIG.channels.toBBBApps.users, message);
  } else {
    return logger.info('did not have enough information to send a user_leaving_request');
  }
};
