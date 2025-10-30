import React, { useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import PropTypes from 'prop-types';
import { UPDATE_CONNECTION_ALIVE_AT } from './mutations';
import { CONNECTION_STATUS_SUBSCRIPTION } from './queries';
import {
  handleAudioStatsEvent,
} from '/imports/ui/components/connection-status/service';
import connectionStatus from '../../core/graphql/singletons/connectionStatus';

import getBaseUrl from '/imports/ui/core/utils/getBaseUrl';
import useCurrentUser from '../../core/hooks/useCurrentUser';
import getStatus from '../../core/utils/getStatus';
import logger from '/imports/startup/client/logger';
import useTimeSync, { setTimeSync } from '/imports/ui/core/local-states/useTimeSync';
import useMeeting from '../../core/hooks/useMeeting';

const createRttWorker = () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

const ConnectionStatus = ({
  user,
  meeting,
}) => {
  const STATS_INTERVAL = window.meetingClientSettings.public.stats.interval;
  const STATS_TIMEOUT = window.meetingClientSettings.public.stats.timeout;
  const networkRttInMs = useRef(0); // Ref to store the last network rtt
  const applicationRttInMs = useRef(0); // Ref to store the last application rtt
  const [timeSync] = useTimeSync();
  const timeSyncRef = useRef(timeSync);

  const [updateConnectionAliveAtM] = useMutation(UPDATE_CONNECTION_ALIVE_AT);

  const { data: connectionStatusData } = useDeduplicatedSubscription(
    CONNECTION_STATUS_SUBSCRIPTION,
    {
      variables: { clientSessionUUID: sessionStorage.getItem('clientSessionUUID') || '0' },
      skip: !user.presenter,
    },
  );

  // Log application rtt
  useEffect(() => {
    if (connectionStatusData
      && 'user_connectionStatus' in connectionStatusData
      && connectionStatusData.user_connectionStatus.length > 0) {
      const connectionStatusCurrentData = connectionStatusData.user_connectionStatus[0];
      if ((connectionStatusCurrentData?.traceLog ?? '') !== '') {
        const traceLogApplications = connectionStatusCurrentData?.traceLog.split('@');
        const firstClientTraceLog = traceLogApplications[1].split('|');
        const firstClientTraceLogDate = new Date(firstClientTraceLog[1]);
        const nowSyncedWithServer = new Date(Date.now() + timeSync);
        applicationRttInMs.current = Math.round(nowSyncedWithServer - firstClientTraceLogDate);

        logger.debug({
          logCode: 'stats_application_rtt',
          extraInfo: {
            applicationRttInMs: applicationRttInMs.current,
            networkRttInMs: connectionStatusCurrentData?.networkRttInMs,
            traceLog: `${connectionStatusCurrentData?.traceLog}@client|${nowSyncedWithServer.toISOString()}`,
          },
        }, `Metrics - Current application RTT is ${applicationRttInMs.current}`);
        if (applicationRttInMs.current > 2000) {
          logger.error({
            logCode: 'stats_application_rtt',
            extraInfo: {
              applicationRttInMs: applicationRttInMs.current,
              networkRttInMs: connectionStatusCurrentData?.networkRttInMs,
              traceLog: `${connectionStatusCurrentData?.traceLog}@client|${nowSyncedWithServer.toISOString()}`,
            },
          }, `Application RTT is very high: ${applicationRttInMs.current}`);
        }
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

  const handleUpdateConnectionAliveAt = (networkRtt, serverEpochMsec, serverRequestId) => {
    try {
      // calculate time sync only once
      if (timeSyncRef.current === 0) {
        const clientNowEpoch = Date.now();
        const oneWay = networkRtt / 2; // aproximation NTP
        // Not allow negative skew
        const skew = Math.max(0, ((serverEpochMsec * 1000) + oneWay) - clientNowEpoch);
        logger.debug(`Latency between server and client: ${skew}`);
        setTimeSync(skew);
        timeSyncRef.current = skew;
      }

      networkRttInMs.current = networkRtt;
      const nowSyncedWithServer = new Date(Date.now() + timeSyncRef.current);
      const traceLog = user.presenter ? `traceLog@client|${nowSyncedWithServer.toISOString()}` : '';
      const rttLevels = window.meetingClientSettings.public.stats.rtt;
      updateConnectionAliveAtM({
        variables: {
          serverRequestId,
          clientSessionUUID: sessionStorage.getItem('clientSessionUUID') || '0',
          networkRttInMs: networkRtt,
          applicationRttInMs: applicationRttInMs.current,
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
  };

  useEffect(() => {
    // Delay first connectionAlive to avoid high RTT misestimation
    // due to initial subscription and mutation traffic at client render

    const STATS_ENABLED = window.meetingClientSettings.public.stats.enabled;

    if (STATS_ENABLED) {
      // This will generate metrics usage to determine alert statuses based
      // on WebRTC stats
      window.addEventListener('audiostats', handleAudioStatsEvent);
    }

    return () => {
      window.removeEventListener('audiostats', handleAudioStatsEvent);
    };
  }, []);

  useEffect(() => {
    let rttWorker;
    try {
      rttWorker = createRttWorker();
    } catch (error) {
      logger.error({
        logCode: 'rtt_worker_creation_failed',
        extraInfo: {
          error,
          errorMessage: error.message,
          errorStack: error.stack,
          errorCause: error.cause,
        },
      }, 'Error creating RTT worker');
      return;
    }
    rttWorker.onmessage = (ev) => {
      const { type } = ev.data || {};
      switch (type) {
        case 'rtt':
          // eslint-disable-next-line no-case-declarations
          const { rtt, serverEpochMsec, serverRequestId } = ev.data || {};
          handleUpdateConnectionAliveAt(rtt, serverEpochMsec, serverRequestId);
          break;
        case 'error':
          // eslint-disable-next-line no-case-declarations
          const { error } = ev.data || {};
          setErrorOnRtt(error);
          break;
        default:
          break;
      }
    };

    rttWorker.postMessage({
      type: 'init',
      payload: {
        baseUrl: getBaseUrl(),
        interval: STATS_INTERVAL,
        fetchTimeout: STATS_TIMEOUT,
        userId: user.userId,
        meetingId: meeting.meetingId,
        clientSessionUUID: sessionStorage.getItem('clientSessionUUID') || '0',
      },
    });

    return () => {
      rttWorker.postMessage({ type: 'stop' });
      rttWorker.terminate();
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
    data: user,
    error: userError,
  } = useCurrentUser((u) => ({
    userId: u.userId,
    avatar: u.avatar,
    isModerator: u.isModerator,
    presenter: u.presenter,
    color: u.color,
    currentlyInMeeting: u.currentlyInMeeting,
  }));

  const {
    data: meeting,
    error: meetingError,
  } = useMeeting((m) => ({
    meetingId: m.meetingId,
  }));

  if (!user || !meeting) {
    return null;
  }

  if (userError || meetingError) {
    connectionStatus.setSubscriptionFailed(true);
    logger.error(
      {
        logCode: 'subscription_Failed',
        extraInfo: {
          error: userError,
        },
      },
      'Subscription failed to load',
    );
    return null;
  }

  return <ConnectionStatus user={user} meeting={meeting} />;
};

export default ConnectionStatusContainer;
