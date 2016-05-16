import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { appendMessageHeader, publish } from '/imports/startup/server/helpers';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import { logger } from '/imports/startup/server/logger';
import { redisConfig } from '/config';

Meteor.methods({
  // meetingId: the meetingId of the meeting the user is in
  // toSetUserId: the userId of the user joining
  // requesterUserId: the userId of the requester
  // requesterToken: the authToken of the requester
  listenOnlyRequestToggle(meetingId, userId, authToken, isJoining) {
    let message, userObject, username, voiceConf, meetingObject;
    meetingObject = Meetings.findOne({
      meetingId: meetingId,
    });
    if (meetingObject != null) {
      voiceConf = meetingObject.voiceConf;
    }

    userObject = Users.findOne({
      meetingId: meetingId,
      userId: userId,
    });
    if (userObject != null) {
      username = userObject.user.name;
    }

    if (isJoining) {
      if (isAllowedTo('joinListenOnly', meetingId, userId, authToken)) {
        message = {
          payload: {
            userid: userId,
            meeting_id: meetingId,
            voice_conf: voiceConf,
            name: username,
          },
        };
        message = appendMessageHeader('user_connected_to_global_audio', message);
        logger.info(`publishing a user listenOnly toggleRequest ${isJoining} request for ${userId}`);
        publish(redisConfig.channels.toBBBApps.meeting, message);
      }
    } else {
      if (isAllowedTo('leaveListenOnly', meetingId, userId, authToken)) {
        message = {
          payload: {
            userid: userId,
            meeting_id: meetingId,
            voice_conf: voiceConf,
            name: username,
          },
        };
        message = appendMessageHeader('user_disconnected_from_global_audio', message);
        logger.info(`publishing a user listenOnly toggleRequest ${isJoining} request for ${userId}`);
        publish(redisConfig.channels.toBBBApps.meeting, message);
      }
    }
  },

});
