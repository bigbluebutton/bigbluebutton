import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Notifications as NotificationsCollection } from '/imports/api/meetings';
import { notify } from '/imports/ui/services/notification';
import { withTracker } from 'meteor/react-meteor-data';
import WaitingUsersAlertService from '/imports/ui/components/waiting-users/alert/service';
import UserService from '/imports/ui/components/user-list/service';

export default injectIntl(withTracker(({ intl }) => {
  NotificationsCollection.find({}).observe({
    added: (obj) => {
      NotificationsCollection.remove(obj);

      if (obj.messageId === 'app.userList.guest.pendingGuestAlert') {
        return WaitingUsersAlertService.alert(obj, intl);
      }

      if (obj.messageId === 'app.notification.userJoinPushAlert') {
        return UserService.UserJoinedMeetingAlert(obj);
      }

      if (obj.messageId === 'app.notification.userLeavePushAlert') {
        return UserService.UserLeftMeetingAlert(obj);
      }
      if (obj.messageId === 'app.layoutUpdate.label') {
        const last = new Date(Session.get('lastLayoutUpdateNotification'));
        const now = new Date();
        if (now - last < 1000) {
          return {};
        }
        Session.set('lastLayoutUpdateNotification', now);
      }

      notify(
        <FormattedMessage
          id={obj.messageId}
          values={obj.messageValues}
          description={obj.messageDescription}
        />,
        obj.notificationType,
        obj.icon,
      );
    },
  });
  return {};
})(() => null));
