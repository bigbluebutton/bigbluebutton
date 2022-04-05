import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Notifications as NotificationsCollection } from '/imports/api/meetings';
import { notify } from '/imports/ui/services/notification';
import { withTracker } from 'meteor/react-meteor-data';
import WaitingUsersAlertService from '/imports/ui/components/waiting-users/alert/service';

export default withTracker(() => {
  NotificationsCollection.find({}).observe({
    added: (obj) => {
      if (obj.messageId === 'app.userList.guest.pendingGuestAlert') {
        return WaitingUsersAlertService.alert(obj);
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
})(() => null);
