import React, { useEffect, useMemo, useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import MeetingRemainingTime from '/imports/ui/components/common/remaining-time/meeting-duration/component';
import { useReactiveVar } from '@apollo/client';
import { toast } from 'react-toastify';
import { layoutSelectInput, layoutDispatch } from '../layout/context';
import { ACTIONS } from '../layout/enums';

import NotificationsBar from './component';
import connectionStatus from '../../core/graphql/singletons/connectionStatus';
import useMeeting from '../../core/hooks/useMeeting';
import logger from '/imports/startup/client/logger';
import ToastComponent from '/imports/ui/components/common/toast/component';
import ToastStyled from '/imports/ui/services/notification/styles';

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
  reloadPage: {
    id: 'app.errorBoundary.reloadPage',
    defaultMessage: 'Reload Page',
  },
});

const STATUS_CRITICAL = 'critical';
const COLOR_PRIMARY = 'primary';
const CONNECTION_ERROR_TOAST_ID = 'connection-error-notification';

const NotificationsBarContainer = () => {
  const intl = useIntl();

  const { hasNotification } = layoutSelectInput((i) => i.notificationsBar);
  const dispatch = layoutDispatch();

  const showConnectionErrors = window.meetingClientSettings
    .public.app.showConnectionErrors || [];
  const checkIfAllowed = (status) => showConnectionErrors.includes(status)
  // Allow all connection errors in development mode
  || process.env.NODE_ENV === 'development';

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

      const canShowTheMessage = checkIfAllowed(code);

      logger.warn({
        logCode: 'connection_disconnected',
        extraInfo: {
          errorCode: code,
          isCritical,
          connected,
          messageShownForUser: canShowTheMessage,
        },
      }, `NotificationsBar: ${msg} (connected=${connected}, isCritical=${isCritical})`);
      if (!canShowTheMessage) return null;
      return msg;
    }

    if (connected && !serverIsResponding) {
      const code = isCritical ? 3004 : 3003;
      const msg = intl.formatMessage(
        isCritical ? intlMessages.connectionCode3004 : intlMessages.connectionCode3003,
      );
      const canShowTheMessage = checkIfAllowed(code);
      logger.warn({
        logCode: 'connection_server_unresponsive',
        extraInfo: {
          errorCode: code,
          isCritical,
          serverIsResponding,
          errorShownForUser: canShowTheMessage,
        },
      }, `NotificationsBar: ${msg} (serverIsResponding=${serverIsResponding}, isCritical=${isCritical})`);
      if (!canShowTheMessage) return null;
      return msg;
    }

    if (connected && serverIsResponding && !pingIsComing && lastRttRequestSuccess) {
      const code = 3005;
      const msg = intl.formatMessage(intlMessages.connectionCode3005);
      const canShowTheMessage = checkIfAllowed(code);
      logger.warn({
        logCode: 'connection_slow_data',
        extraInfo: {
          errorCode: code,
          pingIsComing,
          lastRttRequestSuccess,
          errorShownForUser: canShowTheMessage,
        },
      }, `NotificationsBar: ${msg} (pingIsComing=${pingIsComing}, lastRttSuccess=${lastRttRequestSuccess})`);
      if (!canShowTheMessage) return null;
      return msg;
    }

    if (connected && serverIsResponding && pingIsComing && subscriptionFailed) {
      const code = 3006;
      const msg = intl.formatMessage(intlMessages.connectionCode3006);
      const canShowTheMessage = checkIfAllowed(code);
      logger.warn({
        logCode: 'connection_subscription_failed',
        extraInfo: {
          errorCode: code,
          subscriptionFailed,
          errorShownForUser: canShowTheMessage,
        },
      }, `NotificationsBar: ${msg} (subscriptionFailed=${subscriptionFailed})`);
      if (!canShowTheMessage) return null;
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

    if (meeting?.componentsFlags?.showRemainingTime) {
      return <MeetingRemainingTime />;
    }

    return null;
  }, [meeting?.isBreakout, meeting?.componentsFlags?.showRemainingTime]);

  const connectionToastRef = useRef(null);

  useEffect(() => {
    if (errorMessage) {
      const reloadContent = subscriptionFailed ? (
        <ToastStyled.HelpLinkButton
          label={intl.formatMessage(intlMessages.reloadPage)}
          color="default"
          size="sm"
          onClick={() => { window.location.reload(); }}
          data-test="notificationBannerReloadButton"
        />
      ) : null;

      const toastContent = (
        <ToastStyled.ToastWrapper role="alert">
          <ToastComponent
            type="warning"
            icon="warning"
            message={errorMessage}
            content={reloadContent}
            showSeparator={!!reloadContent}
          />
        </ToastStyled.ToastWrapper>
      );

      if (connectionToastRef.current && toast.isActive(connectionToastRef.current)) {
        toast.update(connectionToastRef.current, { render: toastContent });
      } else {
        connectionToastRef.current = toast(toastContent, {
          toastId: CONNECTION_ERROR_TOAST_ID,
          autoClose: false,
        });
      }
    } else if (connectionToastRef.current) {
      toast.dismiss(connectionToastRef.current);
      connectionToastRef.current = null;
    }
  }, [errorMessage, subscriptionFailed, intl]);

  useEffect(() => () => {
    if (connectionToastRef.current) {
      toast.dismiss(connectionToastRef.current);
    }
  }, []);

  useEffect(() => {
    const wantsNotification = !!meetingMessage;
    if (wantsNotification !== hasNotification) {
      dispatch({ type: ACTIONS.SET_HAS_NOTIFICATIONS_BAR, value: wantsNotification });
    }
  }, [meetingMessage, hasNotification, dispatch]);

  if (!meetingMessage || !hasNotification) return null;

  return (
    <NotificationsBar color={COLOR_PRIMARY}>
      {meetingMessage}
    </NotificationsBar>
  );
};

export default NotificationsBarContainer;
