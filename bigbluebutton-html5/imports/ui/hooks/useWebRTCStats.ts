import {
  useState,
  useEffect,
} from 'react';
import statsManager from '/imports/ui/core/singletons/statsManager';
import { Probe } from '../components/stats/types';

const useWebRTCStats = () => {
  const [lastProbe, setLastProbe] = useState<Probe>({ audio: {}, video: {}, screenshare: {} });

  useEffect(() => {
    statsManager.registerListener(setLastProbe);

    return () => {
      statsManager.unregisterListener(setLastProbe);
    };
  }, []);
  const gatheredStats = statsManager.getGatheredStats();

  return {
    lastProbe,
    audio: [...gatheredStats.audio],
    video: [...gatheredStats.video],
    screenshare: [...gatheredStats.screenshare],
  };
};

export default useWebRTCStats;
