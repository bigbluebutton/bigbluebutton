import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { useMutation } from '@apollo/client';
import Timer from './component';
import Service from './service';
import { layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';
import Logger from '/imports/startup/client/logger';
import {
  TIMER_RESET,
  TIMER_START,
  TIMER_STOP,
  TIMER_SWITCH_MODE,
  TIMER_SET_SONG_TRACK,
  TIMER_SET_TIME,
} from './mutations';

const MAX_HOURS = 23;
const MILLI_IN_HOUR = 3600000;
const MILLI_IN_MINUTE = 60000;
const MILLI_IN_SECOND = 1000;

const TimerContainer = ({ children, ...props }) => {
  const layoutContextDispatch = layoutDispatch();
  const cameraDock = layoutSelectInput((i) => i.cameraDock);
  const { isResizing } = cameraDock;

  const [timerReset] = useMutation(TIMER_RESET);
  const [timerStart] = useMutation(TIMER_START);
  const [timerStop] = useMutation(TIMER_STOP);
  const [timerSwitchMode] = useMutation(TIMER_SWITCH_MODE);
  const [timerSetSongTrack] = useMutation(TIMER_SET_SONG_TRACK);
  const [timerSetTime] = useMutation(TIMER_SET_TIME);

  const startTimer = () => {
    timerStart();
  };

  const stopTimer = () => {
    timerStop();
  };

  const switchTimer = (stopwatch) => {
    timerSwitchMode({ variables: { stopwatch } });
  };

  const setTrack = (track) => {
    timerSetSongTrack({ variables: { track } });
  };

  const setTime = (time) => {
    timerSetTime({ variables: { time } });
    timerStop();
    timerReset();
  };

  const setHours = (hours, time) => {
    if (!Number.isNaN(hours) && hours >= 0 && hours <= MAX_HOURS) {
      const currentHours = Math.floor(time / MILLI_IN_HOUR);

      const diff = (hours - currentHours) * MILLI_IN_HOUR;
      setTime(time + diff);
    } else {
      Logger.warn('Invalid time');
    }
  };

  const setMinutes = (minutes, time) => {
    if (!Number.isNaN(minutes) && minutes >= 0 && minutes <= 59) {
      const currentHours = Math.floor(time / MILLI_IN_HOUR);
      const mHours = currentHours * MILLI_IN_HOUR;

      const currentMinutes = Math.floor((time - mHours) / MILLI_IN_MINUTE);

      const diff = (minutes - currentMinutes) * MILLI_IN_MINUTE;
      setTime(time + diff);
    } else {
      Logger.warn('Invalid time');
    }
  };

  const setSeconds = (seconds, time) => {
    if (!Number.isNaN(seconds) && seconds >= 0 && seconds <= 59) {
      const currentHours = Math.floor(time / MILLI_IN_HOUR);
      const mHours = currentHours * MILLI_IN_HOUR;

      const currentMinutes = Math.floor((time - mHours) / MILLI_IN_MINUTE);
      const mMinutes = currentMinutes * MILLI_IN_MINUTE;

      const currentSeconds = Math.floor((time - mHours - mMinutes) / MILLI_IN_SECOND);

      const diff = (seconds - currentSeconds) * MILLI_IN_SECOND;
      setTime(time + diff);
    } else {
      Logger.warn('Invalid time');
    }
  };

  return (
    <Timer {...{
      layoutContextDispatch,
      isResizing,
      timerReset,
      startTimer,
      stopTimer,
      switchTimer,
      setTrack,
      setHours,
      setMinutes,
      setSeconds,
      ...props,
    }}
    >
      {children}
    </Timer>
  );
};

export default withTracker(() => {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  return {
    isRTL,
    isActive: Service.isActive(),
    timeOffset: Service.getTimeOffset(),
    timer: Service.getTimer(),
    currentTrack: Service.getCurrentTrack(),
  };
})(TimerContainer);
