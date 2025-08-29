import React, { useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { UPDATE_CONNECTION_ALIVE_AT } from './mutations';
import { CONNECTION_STATUS_SUBSCRIPTION } from './queries';
import {
  handleAudioStatsEvent,
} from '/imports/ui/components/connection-status/service';
import connectionStatus from '../../core/graphql/singletons/connectionStatus';
import PropTypes from 'prop-types';

import getBaseUrl from '/imports/ui/core/utils/getBaseUrl';
import useCurrentUser from '../../core/hooks/useCurrentUser';
import getStatus from '../../core/utils/getStatus';
import logger from '/imports/startup/client/logger';

const ConnectionStatus = ({
  user,
}) => {
  const STATS_INTERVAL = window.meetingClientSettings.public.stats.interval;
  const STATS_TIMEOUT = window.meetingClientSettings.public.stats.timeout;
  const networkRttInMs = useRef(0); // Ref to store the last rtt
  const timeoutRef = useRef(null);

  const [updateConnectionAliveAtM] = useMutation(UPDATE_CONNECTION_ALIVE_AT);

  const { data: connectionStatusData } = useDeduplicatedSubscription(
    CONNECTION_STATUS_SUBSCRIPTION,
    { skip: !user.presenter },
  );

  useEffect(() => {
    if (connectionStatusData
      && 'user_connectionStatus' in connectionStatusData
      && connectionStatusData.user_connectionStatus.length > 0) {
      const connectionStatusCurrentData = connectionStatusData.user_connectionStatus[0];
      if ((connectionStatusCurrentData?.traceLog ?? '') !== '') {
        const traceLogApplications = connectionStatusCurrentData?.traceLog.split('@');
        const firstClientTraceLog = traceLogApplications[1].split('|');
        const firstClientTraceLogDate = new Date(firstClientTraceLog[1]);
        const now = new Date();
        logger.debug({
          logCode: 'stats_application_rtt',
          extraInfo: {
            applicationRttInMs: now - firstClientTraceLogDate,
            networkRttInMs: connectionStatusCurrentData?.networkRttInMs,
            traceLog: `${connectionStatusCurrentData?.traceLog}@client|${new Date().toISOString()}`,
          },
        }, `Metrics - Current application RTT is ${now - firstClientTraceLogDate}`);
      }
    }
  }, [connectionStatusData]);

  const setErrorOnRtt = (error) => {
    logger.error({
      logCode: 'rtt_fetch_error',
      extraInfo: {
        error,
      },
    }, 'Error fetching rtt');
    connectionStatus.setLastRttRequestSuccess(false);
    // gets the worst status
    connectionStatus.setConnectionStatus(2000, 'critical');
  };

  const handleUpdateConnectionAliveAt = () => {
    const startTime = performance.now();
    const fetchOptions = {
      signal: AbortSignal.timeout ? AbortSignal.timeout(STATS_TIMEOUT) : undefined,
    };

    fetch(
      `${getBaseUrl()}/rtt-check`,
      fetchOptions,
    )
      .then((res) => {
        if (res.ok && res.status === 200) {
          try {
            const traceLog = user.presenter ? `traceLog@client|${new Date().toISOString()}` : '';
            const rttLevels = window.meetingClientSettings.public.stats.rtt;
            const endTime = performance.now();
            const networkRtt = Math.round(endTime - startTime);
            networkRttInMs.current = networkRtt;

            updateConnectionAliveAtM({
              variables: {
                networkRttInMs: networkRtt,
                traceLog,
              },
            });
            const rttStatus = getStatus(rttLevels, networkRtt);
            connectionStatus.setConnectionStatus(networkRtt, rttStatus);
            connectionStatus.setLastRttRequestSuccess(true);

            if (Object.keys(rttLevels).includes(rttStatus)) {
              connectionStatus.addUserNetworkHistory(
                user,
                rttStatus,
                Date.now(),
              );
            }
          } catch (error) {
            logger.error({
              logCode: 'rtt_failed_to_register_user_history',
              extraInfo: {
                error,
                errorMessage: error.message,
                errorStack: error.stack,
                errorCause: error.cause,
              },
            }, 'Error registering user network history');
          }
        } else {
          const error = {
            status: res.status,
            statusText: res.statusText,
            url: res.url,
            stack: new Error().stack,
          };
          setErrorOnRtt(error);
        }
      })
      .catch((error) => {
        setErrorOnRtt(error);
      })
      .finally(() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          handleUpdateConnectionAliveAt();
        }, STATS_INTERVAL);
      });
  };

  useEffect(() => {
    // Delay first connectionAlive to avoid high RTT misestimation
    // due to initial subscription and mutation traffic at client render
    timeoutRef.current = setTimeout(() => {
      handleUpdateConnectionAliveAt();
    }, STATS_INTERVAL / 2);

    const STATS_ENABLED = window.meetingClientSettings.public.stats.enabled;

    if (STATS_ENABLED) {
      // This will generate metrics usage to determine alert statuses based
      // on WebRTC stats
      window.addEventListener('audiostats', handleAudioStatsEvent);
    }

    return () => {
      window.removeEventListener('audiostats', handleAudioStatsEvent);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return null;
};

ConnectionStatus.propTypes = {
  user: PropTypes.shape({
    userId: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    isModerator: PropTypes.bool,
    presenter: PropTypes.bool,
    color: PropTypes.string,
    currentlyInMeeting: PropTypes.bool,
  }).isRequired,
};

const ConnectionStatusContainer = () => {
  const {
    data,
    error,
  } = useCurrentUser((u) => ({
    userId: u.userId,
    avatar: u.avatar,
    isModerator: u.isModerator,
    presenter: u.presenter,
    color: u.color,
    currentlyInMeeting: u.currentlyInMeeting,
  }));

  if (!data) {
    return null;
  }

  if (error) {
    connectionStatus.setSubscriptionFailed(true);
    logger.error(
      {
        logCode: 'subscription_Failed',
        extraInfo: {
          error,
        },
      },
      'Subscription failed to load',
    );
    return null;
  }

  return <ConnectionStatus user={data} />;
};

export default ConnectionStatusContainer;
