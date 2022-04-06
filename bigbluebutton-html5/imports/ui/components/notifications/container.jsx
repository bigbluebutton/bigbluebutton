import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { layoutSelectInput } from '/imports/ui/components/layout/context';
import { Notifications as NotificationsCollection } from '/imports/api/meetings';
import { notify } from '/imports/ui/services/notification';
import { PANELS } from '/imports/ui/components/layout/enums';
import { withTracker } from 'meteor/react-meteor-data';
import WaitingUsersAlertService from '/imports/ui/components/waiting-users/alert/service';
import UserService from '/imports/ui/components/user-list/service';

export default injectIntl(withTracker(({ intl }) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const waitingUsersPanelIsOpen = sidebarContentPanel === PANELS.WAITING_USERS;

  NotificationsCollection.find({}).observe({
    added: (obj) => {
      if (obj.messageId === 'app.userList.guest.pendingGuestAlert') {
        return WaitingUsersAlertService.alert(obj, waitingUsersPanelIsOpen, intl);
      }

      if (obj.messageId === 'app.notification.userJoinPushAlert') {
        return UserService.UserJoinedMeetingAlert(obj);
      }

      if (obj.messageId === 'app.notification.userLeavePushAlert') {
        return UserService.UserLeftMeetingAlert(obj);
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
}))(() => null);
