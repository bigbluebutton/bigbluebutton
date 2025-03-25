import { Dispatch, SetStateAction } from 'react';
import logger from '/imports/startup/client/logger';
import AudioManager from '/imports/ui/services/audio-manager';
import ScreenshareService from '/imports/ui/components/screenshare/service';
import VideoService from '/imports/ui/components/video-provider/service';
import { Probe, Probes } from '../../components/stats/types';
import meetingClientSettingsInitialValues from '../initial-values/meetingClientSettings';

type Options = {
  interval?: number;
  probes?: number;
}

export interface StatInfo {
  probes: object[];
}

export interface Bridge {
  getStats(): unknown;
}

export interface BridgesMap {
  audio: Bridge;
  video: Bridge;
  screenshare: Bridge;
}

export type StatsType = keyof Probes;
export type BridgesType = keyof BridgesMap;

const DEFAULT_PROBES_NUMBER = meetingClientSettingsInitialValues.public.stats.probes;
const DEFAULT_INTERVAL = meetingClientSettingsInitialValues.public.stats.interval;

class StatsManager {
  private intervalId: NodeJS.Timeout | null;

  private listeners: Set<Dispatch<SetStateAction<Probe>>>;

  private gatheredStats: Probes;

  private statsSources: BridgesMap;

  constructor() {
    this.statsSources = {
      audio: AudioManager,
      video: VideoService,
      screenshare: ScreenshareService,
    };
    this.intervalId = null;
    this.listeners = new Set<Dispatch<SetStateAction<Probe>>>();
    this.gatheredStats = {
      audio: [],
      video: [],
      screenshare: [],
    };
  }

  registerListener(callback: Dispatch<SetStateAction<Probe>>) {
    this.listeners.add(callback);
  }

  unregisterListener(callback: Dispatch<SetStateAction<Probe>>) {
    this.listeners.delete(callback);
  }

  getGatheredStats() {
    return this.gatheredStats;
  }

  startMonitoring(
    interval: number,
    probes: number,
  ) {
    if (interval <= 0) return;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    const probesInterval = interval / probes;
    const intervalId = setInterval(async () => {
      const l_gatheredStats = { audio: {}, video: {}, screenshare: {} };
      await Promise.all(
        Object.keys(this.statsSources).map(async (type) => {
          const bridgesKey = type as keyof BridgesMap;
          const freshStats = await this.statsSources[bridgesKey].getStats();
          const hasStats = freshStats && Object.keys(freshStats).length !== 0;
          if (!hasStats) {
            if (this.gatheredStats[bridgesKey].length !== 0) {
              this.gatheredStats[bridgesKey] = [];
            }
            return;
          }
          this.gatheredStats[bridgesKey].push(freshStats as Record<string, unknown>);
          while (this.gatheredStats[bridgesKey].length > probes) {
            this.gatheredStats[bridgesKey].shift();
          }

          l_gatheredStats[bridgesKey] = freshStats;
        }),
      );

      this.listeners.forEach((listener) => listener(l_gatheredStats));
    }, probesInterval);

    this.intervalId = intervalId;
  }

  static getValidValue(setting: number, input: number, defaultValue: number, logCode: string, logMessage: string) {
    let value = setting;
    if (input && input > 0) value = input;
    if (!value || value === 0) {
      logger.warn({ logCode }, `${logMessage} Using default value of ${defaultValue}`);
      value = defaultValue;
    }
    return value;
  }

  initializeMonitoring(options: Options) {
    const { interval = 0, probes = 0 } = options;

    const l_probes = StatsManager.getValidValue(
      window.meetingClientSettings.public.stats.probes,
      probes,
      DEFAULT_PROBES_NUMBER,
      'invalid_probes_number',
      'Invalid probes number.',
    );

    const l_interval = StatsManager.getValidValue(
      window.meetingClientSettings.public.stats.interval,
      interval,
      DEFAULT_INTERVAL,
      'invalid_interval_value',
      'Invalid interval value.',
    );

    this.startMonitoring(l_interval, l_probes);
  }
}

const statsManager = new StatsManager();

export default statsManager;
