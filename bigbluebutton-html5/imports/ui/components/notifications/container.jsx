import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Notifications as NotificationsCollection } from '/imports/api/meetings';
import { notify } from '/imports/ui/services/notification';
import { withTracker } from 'meteor/react-meteor-data';

export default withTracker(() => {
  NotificationsCollection.find({}).observe({
    added: (obj) => {
      notify(
        <FormattedMessage
          id={obj.messageId}
          values={obj.messageValues}
          description="Notification for when the recording starts"
        />,
        obj.notificationType,
        obj.icon,
      );
    },
  });
  return {};
})(() => null);
