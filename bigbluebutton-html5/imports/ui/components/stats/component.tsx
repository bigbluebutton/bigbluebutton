import { useEffect, useRef, memo } from 'react';
import { deepClone } from 'fast-json-patch';
import Auth from '/imports/ui/services/auth';
import statsManager from '/imports/ui/core/singletons/statsManager';
import connectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';
import getStatus from '/imports/ui/core/utils/getStatus';
import useWebRTCStats from '/imports/ui/hooks/useWebRTCStats';
import { calculateMetricsForNetworkData, LOG_MEDIA_STATS } from './service';
import { Probe } from './types';
import logger from '/imports/startup/client/logger';

const WebRTCStatsObserver = () => {
  const prevLastProbe = useRef<Probe>({ audio: {}, video: {}, screenshare: {} });

  const {
    lastProbe,
    audio,
    video,
    screenshare,
  } = useWebRTCStats();

  useEffect(() => {
    statsManager.initializeMonitoring({});
  }, []);

  useEffect(() => {
    const { metrics, ...networkData } = calculateMetricsForNetworkData({
      previousLastProbe: deepClone(prevLastProbe.current),
      lastProbe,
      allProbes: { audio, video, screenshare },
    });

    const shouldLogMediaStats = LOG_MEDIA_STATS()
      && (
        Object.keys(audio).length > 0
        || Object.keys(video).length > 0
        || Object.keys(screenshare).length > 0
      );

    if (shouldLogMediaStats) {
      logger.info({
        logCode: 'media_stats',
        extraInfo: {
          audio: lastProbe.audio,
          video: lastProbe.video,
          screenshare: lastProbe.screenshare,
        },
      }, 'Media stats');
    }

    const user = {
      time: new Date(),
      username: Auth.fullname,
      meeting_name: Auth.confname,
      meeting_id: Auth.meetingID,
      connection_id: Auth.sessionToken,
      user_id: Auth.userID,
      extern_user_id: Auth.externUserID,
    };
    connectionStatus.setNetworkData({ ...networkData, user });
    connectionStatus.setPacketLossFraction(metrics.loss);
    connectionStatus.setPacketLossStatus(
      getStatus(window.meetingClientSettings.public.stats.loss, metrics.loss) as string,
    );

    prevLastProbe.current = lastProbe;
  }, [lastProbe]);

  return null;
};

export default memo(WebRTCStatsObserver);
