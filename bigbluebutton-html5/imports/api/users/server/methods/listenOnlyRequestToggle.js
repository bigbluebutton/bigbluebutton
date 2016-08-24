import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { appendMessageHeader, publish } from '/imports/api/common/server/helpers';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import { logger } from '/imports/startup/server/logger';

Meteor.methods({
  // meetingId: the meetingId of the meeting the user is in
  // toSetUserId: the userId of the user joining
  // requesterUserId: the userId of the requester
  // requesterToken: the authToken of the requester
  listenOnlyRequestToggle(credentials, isJoining) {
    const REDIS_CONFIG = Meteor.settings.redis;
    let username;
    let voiceConf;
    const { meetingId, requesterUserId, requesterToken } = credentials;
    const meetingObject = Meetings.findOne({
      meetingId: meetingId,
    });
    const userObject = Users.findOne({
      meetingId: meetingId,
      userId: requesterUserId,
    });

    if (meetingObject != null) {
      voiceConf = meetingObject.voiceConf;
    }

    if (userObject != null) {
      username = userObject.user.name;
    }

    if (isJoining) {
      if (isAllowedTo('joinListenOnly', credentials)) {
        let message = {
          payload: {
            userid: requesterUserId,
            meeting_id: meetingId,
            voice_conf: voiceConf,
            name: username,
          },
        };
        message = appendMessageHeader('user_connected_to_global_audio', message);
        logger.info(
          `publishing a user listenOnly toggleRequest ${isJoining} ` +
          `request for ${requesterUserId}`
        );
        publish(REDIS_CONFIG.channels.toBBBApps.meeting, message);
      }
    } else {
      if (isAllowedTo('leaveListenOnly', credentials)) {
        let message = {
          payload: {
            userid: requesterUserId,
            meeting_id: meetingId,
            voice_conf: voiceConf,
            name: username,
          },
        };
        message = appendMessageHeader('user_disconnected_from_global_audio', message);
        logger.info(
          `publishing a user listenOnly toggleRequest ${isJoining} ` +
          `request for ${requesterUserId}`
        );
        publish(REDIS_CONFIG.channels.toBBBApps.meeting, message);
      }
    }
  },

});
