Meteor.methods({
  //meetingId: the meeting where the user is
  //toKickUserId: the userid of the user to kick
  //requesterUserId: the userid of the user that wants to kick
  //authToken: the authToken of the user that wants to kick
  kickUser(meetingId, toKickUserId, requesterUserId, authToken) {
    let message;
    if (isAllowedTo('kickUser', meetingId, requesterUserId, authToken)) {
      message = {
        payload: {
          userid: toKickUserId,
          ejected_by: requesterUserId,
          meeting_id: meetingId,
        },
        header: {
          name: 'eject_user_from_meeting_request_message',
        },
      };
      return publish(Meteor.config.redis.channels.toBBBApps.users, message);
    }
  },
});