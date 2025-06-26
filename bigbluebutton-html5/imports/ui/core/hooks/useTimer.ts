import { useEffect, useState } from 'react';
import createUseSubscription from './createUseSubscription';
import { GET_TIMER, TimerData } from '../graphql/queries/timer';
import TimerSingleton from '/imports/ui/core/singletons/timer';

const useTimerSubscription = createUseSubscription<TimerData>(GET_TIMER, {}, true);

export const useTimer = (isIndicator = false) => {
  const response = useTimerSubscription();
  const [timePassed, setTimePassed] = useState<number>(0);

  useEffect(() => {
    if (!isIndicator) return;
    if (response.loading || !response.data || !response.data[0] || response.data.length === 0) return;
    const timer = response.data[0];
    TimerSingleton.updateTimerInfo(timer);
  }, [isIndicator, response.loading, response.data]);

  useEffect(() => {
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
    startedOn = 0,
    startedAt = 0,
    elapsed = false,
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
      startedOn,
      startedAt,
      elapsed,
      timePassed,
    },
  };
};

export default useTimer;
