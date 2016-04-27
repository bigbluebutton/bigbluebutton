import { publish } from '/server/redispubsub';
import { isAllowedTo } from '/server/user_permissions';
import { appendMessageHeader } from '/server/helpers';
import { updateVoiceUser } from '/server/collection_methods/users';

Meteor.methods({
  // meetingId: the meetingId of the meeting the user[s] is in
  // toMuteUserId: the userId of the user to be muted
  // requesterUserId: the userId of the requester
  // requesterToken: the authToken of the requester
  muteUser(meetingId, toMuteUserId, requesterUserId, requesterToken) {
    let action, message;
    action = function () {
      if (toMuteUserId === requesterUserId) {
        return 'muteSelf';
      } else {
        return 'muteOther';
      }
    };

    if (isAllowedTo(action(), meetingId, requesterUserId, requesterToken)) {
      message = {
        payload: {
          user_id: toMuteUserId,
          meeting_id: meetingId,
          mute: true,
          requester_id: requesterUserId,
        }
      };
      message = appendMessageHeader('mute_user_request_message', message);
      Meteor.log.info(`publishing a user mute request for ${toMuteUserId}`);
      publish(Meteor.config.redis.channels.toBBBApps.users, message);
      updateVoiceUser(meetingId, {
        web_userid: toMuteUserId,
        talking: false,
        muted: true,
      });
    }
  }
});
