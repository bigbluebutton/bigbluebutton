import { publish } from '/server/redispubsub';
import { isAllowedTo } from '/server/user_permissions';
import { appendMessageHeader } from '/server/helpers';

Meteor.methods({
  //meetingId: the meeting where the user is
  //newPresenterId: the userid of the new presenter
  //requesterSetPresenter: the userid of the user that wants to change the presenter
  //newPresenterName: user name of the new presenter
  //authToken: the authToken of the user that wants to kick
  setUserPresenter(
    meetingId,
    newPresenterId,
    requesterSetPresenter,
    newPresenterName,
    authToken) {
    let message;
    if (isAllowedTo('setPresenter', meetingId, requesterSetPresenter, authToken)) {
      message = {
        payload: {
          new_presenter_id: newPresenterId,
          new_presenter_name: newPresenterName,
          meeting_id: meetingId,
          assigned_by: requesterSetPresenter,
        }
      };
    }
    message = appendMessageHeader('assign_presenter_request_message', message);
    return publish(Meteor.config.redis.channels.toBBBApps.users, message);
  }
});
