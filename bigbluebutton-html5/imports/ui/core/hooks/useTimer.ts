import { useEffect, useState } from 'react';
import createUseSubscription from './createUseSubscription';
import { GET_TIMER, TimerData } from '../graphql/queries/timer';
import TimerSingleton from '/imports/ui/core/singletons/timer';
import useTimeSync from '/imports/ui/core/local-states/useTimeSync';

const useTimerSubscription = createUseSubscription<TimerData>(GET_TIMER, {}, true);

export const useTimer = ({
  isIndicator = false,
  enableNotifications = true,
}: {
  isIndicator?: boolean;
  enableNotifications?: boolean;
} = {}) => {
  const response = useTimerSubscription();
  const [timeSync] = useTimeSync();
  const [timePassed, setTimePassed] = useState<number>(0);

  useEffect(() => {
    if (!isIndicator) return;
    TimerSingleton.setTimeOffset(timeSync);
  }, [isIndicator, timeSync]);

  useEffect(() => {
    if (!isIndicator) return;
    if (response.loading || !response.data || !response.data[0] || response.data.length === 0) return;
    const timer = response.data[0];
    if (timer.active === false) return;
    TimerSingleton.updateTimerInfo(timer);
  }, [isIndicator, response.loading, response.data]);

  useEffect(() => {
    if (!enableNotifications) return () => {};
    return TimerSingleton.subscribe((timePassed) => {
      setTimePassed(timePassed);
    });
  }, []);

  if (!response.data?.[0]) return { data: undefined };
  const {
    accumulated = 0,
    active = false,
    songTrack = '',
    time = 0,
    stopwatch = false,
    running = false,
    startedAt = 0,
    elapsed,
  } = response.data?.[0] || {};

  return {
    error: response?.errors ? response.errors[0] : undefined,
    loading: response.loading,
    data: {
      accumulated,
      active,
      songTrack,
      time,
      stopwatch,
      running,
      startedAt,
      elapsed,
      timePassed,
    },
  };
};

export default useTimer;
