import React, { useEffect, useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import MeetingRemainingTime from '/imports/ui/components/common/remaining-time/meeting-duration/component';
import { useReactiveVar } from '@apollo/client';
import { layoutSelectInput, layoutDispatch } from '../layout/context';
import { ACTIONS } from '../layout/enums';

import NotificationsBar from './component';
import connectionStatus from '../../core/graphql/singletons/connectionStatus';
import useMeeting from '../../core/hooks/useMeeting';
import logger from '/imports/startup/client/logger';

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
  const intl = useIntl();

  const { hasNotification } = layoutSelectInput((i) => i.notificationsBar);
  const dispatch = layoutDispatch();

  const { data: meeting } = useMeeting((m) => ({
    isBreakout: m.isBreakout,
    componentsFlags: m.componentsFlags,
  }));

  const subscriptionFailed = useReactiveVar(connectionStatus.getSubscriptionFailedVar());
  const connected = useReactiveVar(connectionStatus.getConnectedStatusVar());
  const serverIsResponding = useReactiveVar(connectionStatus.getServerIsRespondingVar());
  const pingIsComing = useReactiveVar(connectionStatus.getPingIsComingVar());
  const lastRttRequestSuccess = useReactiveVar(connectionStatus.getLastRttRequestSuccessVar());
  const rttStatus = useReactiveVar(connectionStatus.getRttStatusVar());

  const errorMessage = useMemo(() => {
    const isCritical = rttStatus === STATUS_CRITICAL;

    if (!connected) {
      const code = isCritical ? 3002 : 3001;
      const msg = intl.formatMessage(
        isCritical ? intlMessages.connectionCode3002 : intlMessages.connectionCode3001,
      );

      logger.warn({
        logCode: 'connection_disconnected',
        extraInfo: {
          errorCode: code,
          isCritical,
          connected,
        },
      }, `NotificationsBar: ${msg} (connected=${connected}, isCritical=${isCritical})`);

      return msg;
    }

    if (connected && !serverIsResponding) {
      const code = isCritical ? 3004 : 3003;
      const msg = intl.formatMessage(
        isCritical ? intlMessages.connectionCode3004 : intlMessages.connectionCode3003,
      );

      logger.warn({
        logCode: 'connection_server_unresponsive',
        extraInfo: {
          errorCode: code,
          isCritical,
          serverIsResponding,
        },
      }, `NotificationsBar: ${msg} (serverIsResponding=${serverIsResponding}, isCritical=${isCritical})`);

      return msg;
    }

    if (connected && serverIsResponding && !pingIsComing && lastRttRequestSuccess) {
      const code = 3005;
      const msg = intl.formatMessage(intlMessages.connectionCode3005);

      logger.warn({
        logCode: 'connection_slow_data',
        extraInfo: {
          errorCode: code,
          pingIsComing,
          lastRttRequestSuccess,
        },
      }, `NotificationsBar: ${msg} (pingIsComing=${pingIsComing}, lastRttSuccess=${lastRttRequestSuccess})`);

      return msg;
    }

    if (connected && serverIsResponding && pingIsComing && subscriptionFailed) {
      const code = 3006;
      const msg = intl.formatMessage(intlMessages.connectionCode3006);

      logger.warn({
        logCode: 'connection_subscription_failed',
        extraInfo: {
          errorCode: code,
          subscriptionFailed,
        },
      }, `NotificationsBar: ${msg} (subscriptionFailed=${subscriptionFailed})`);

      return msg;
    }

    return null;
  }, [
    connected,
    serverIsResponding,
    pingIsComing,
    lastRttRequestSuccess,
    rttStatus,
    subscriptionFailed,
    intl,
  ]);

  const meetingMessage = useMemo(() => {
    if (!meeting) return null;

    if (meeting.isBreakout) {
      return <MeetingRemainingTime />;
    }

    if (meeting.componentsFlags?.showRemainingTime) {
      return <MeetingRemainingTime />;
    }

    return null;
  }, [meeting?.isBreakout, meeting?.componentsFlags?.showRemainingTime]);

  const message = errorMessage || meetingMessage;

  useEffect(() => {
    const wantsNotification = !!message;
    if (wantsNotification !== hasNotification) {
      dispatch({ type: ACTIONS.SET_HAS_NOTIFICATIONS_BAR, value: wantsNotification });
    }
  }, [message, hasNotification, dispatch]);

  if (!message) return null;

  return (
    <NotificationsBar color={COLOR_PRIMARY} showReloadButton={subscriptionFailed}>
      {message}
    </NotificationsBar>
  );
};

export default NotificationsBarContainer;
