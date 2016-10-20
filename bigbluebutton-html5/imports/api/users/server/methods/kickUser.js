import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { appendMessageHeader, publish } from '/imports/api/common/server/helpers';

Meteor.methods({
  //meetingId: the meeting where the user is
  //toKickUserId: the userid of the user to kick
  //requesterUserId: the userid of the user that wants to kick
  //authToken: the authToken of the user that wants to kick
  kickUser(credentials, toKickUserId) {
    const REDIS_CONFIG = Meteor.settings.redis;
    const { meetingId, requesterUserId, requesterToken } = credentials;
    let message;
    if (isAllowedTo('kickUser', credentials)) {
      message = {
        payload: {
          userid: toKickUserId,
          ejected_by: requesterUserId,
          meeting_id: meetingId,
        },
      };
      message = appendMessageHeader('eject_user_from_meeting_request_message', message);
      return publish(REDIS_CONFIG.channels.toBBBApps.users, message);
    }
  },
});
