import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { isEmpty } from 'radash';
import MeetingRemainingTime from '/imports/ui/components/common/remaining-time/meeting-duration/component';
import { useReactiveVar } from '@apollo/client';
import { layoutSelectInput, layoutDispatch } from '../layout/context';
import { ACTIONS } from '../layout/enums';

import NotificationsBar from './component';
import connectionStatus from '../../core/graphql/singletons/connectionStatus';
import useMeeting from '../../core/hooks/useMeeting';

const intlMessages = defineMessages({
  connectionCode3001: {
    id: 'app.notificationBar.connectionCode3001',
    description: 'Closed connection alert',
  },
  connectionCode3002: {
    id: 'app.notificationBar.connectionCode3002',
    description: 'Impossible connection alert',
  },
  connectionCode3003: {
    id: 'app.notificationBar.connectionCode3003',
    description: 'Unresponsive server alert',
  },
  connectionCode3004: {
    id: 'app.notificationBar.connectionCode3004',
    description: 'Unstable connection alert',
  },
  connectionCode3005: {
    id: 'app.notificationBar.connectionCode3005',
    description: 'Slow data alert',
  },
  connectionCode3006: {
    id: 'app.notificationBar.issueLoadingDataCode3006',
    description: 'Subscription failed alert',
  },
});

const STATUS_CRITICAL = 'critical';
const COLOR_PRIMARY = 'primary';

const NotificationsBarContainer = () => {
  const data = {};
  data.alert = true;
  data.color = COLOR_PRIMARY;
  const intl = useIntl();
  const subscriptionFailed = useReactiveVar(connectionStatus.getSubscriptionFailedVar());
  const connected = useReactiveVar(connectionStatus.getConnectedStatusVar());
  const serverIsResponding = useReactiveVar(connectionStatus.getServerIsRespondingVar());
  const pingIsComing = useReactiveVar(connectionStatus.getPingIsComingVar());
  const lastRttRequestSuccess = useReactiveVar(connectionStatus.getLastRttRequestSuccessVar());
  const rttStatus = useReactiveVar(connectionStatus.getRttStatusVar());
  const isCritical = rttStatus === STATUS_CRITICAL;
  // if connection failed x attempts a error will be thrown
  if (!connected) {
    data.message = isCritical
      ? intl.formatMessage(intlMessages.connectionCode3002)
      : intl.formatMessage(intlMessages.connectionCode3001);
  } else if (connected && !serverIsResponding) {
    data.message = isCritical
      ? intl.formatMessage(intlMessages.connectionCode3004)
      : intl.formatMessage(intlMessages.connectionCode3003);
  } else if (connected && serverIsResponding && !pingIsComing && lastRttRequestSuccess) {
    data.message = intl.formatMessage(intlMessages.connectionCode3005);
  } else if (connected && serverIsResponding && pingIsComing && subscriptionFailed) {
    data.message = intl.formatMessage(intlMessages.connectionCode3006);
  }

  const { data: meeting } = useMeeting((m) => ({
    isBreakout: m.isBreakout,
    componentsFlags: m.componentsFlags,
  }));

  if (meeting?.isBreakout) {
    data.message = (
      <MeetingRemainingTime />
    );
  }

  if (meeting) {
    const { isBreakout, componentsFlags } = meeting;

    if (componentsFlags?.showRemainingTime && !isBreakout) {
      data.message = (
        <MeetingRemainingTime />
      );
    }
  }

  const notificationsBar = layoutSelectInput((i) => i.notificationsBar);
  const layoutContextDispatch = layoutDispatch();

  const { hasNotification } = notificationsBar;

  useEffect(() => {
    const localHasNotification = !!data.message;

    if (localHasNotification !== hasNotification) {
      layoutContextDispatch({
        type: ACTIONS.SET_HAS_NOTIFICATIONS_BAR,
        value: localHasNotification,
      });
    }
  }, [data.message, hasNotification]);

  if (isEmpty(data.message)) {
    return null;
  }

  return (
    <NotificationsBar color={data.color} showReloadButton={subscriptionFailed}>
      {data.message}
    </NotificationsBar>
  );
};

export default NotificationsBarContainer;
