import { publish } from '/imports/api/common/server/helpers';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { appendMessageHeader } from '/imports/api/common/server/helpers';

Meteor.methods({
  //meetingId: the meeting where the user is
  //newPresenterId: the userid of the new presenter
  //requesterSetPresenter: the userid of the user that wants to change the presenter
  //newPresenterName: user name of the new presenter
  //authToken: the authToken of the user that wants to kick
  setUserPresenter(
    credentials,
    newPresenterId,
    newPresenterName) {
    const REDIS_CONFIG = Meteor.settings.redis;
    const { meetingId, requesterSetPresenter, requesterToken } = credentials;
    let message;
    if (isAllowedTo('setPresenter', credentials)) {
      message = {
        payload: {
          new_presenter_id: newPresenterId,
          new_presenter_name: newPresenterName,
          meeting_id: meetingId,
          assigned_by: requesterSetPresenter,
        },
      };

      message = appendMessageHeader('assign_presenter_request_message', message);
      return publish(REDIS_CONFIG.channels.toBBBApps.users, message);
    }
  },
});
