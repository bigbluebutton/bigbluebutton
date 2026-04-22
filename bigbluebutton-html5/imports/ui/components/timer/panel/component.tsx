import React, {
  useCallback,
  useMemo,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  useMutation,
} from '@apollo/client';
import Header from '/imports/ui/components/common/control-header/component';
import Styled from './styles';
import { layoutDispatch } from '../../layout/context';
import { ACTIONS, PANELS } from '../../layout/enums';
import {
  TIMER_RESET,
  TIMER_SET_SONG_TRACK,
  TIMER_SET_TIME,
  TIMER_START,
  TIMER_STOP,
  TIMER_SWITCH_MODE,
} from '../mutations';
import humanizeSeconds from '/imports/utils/humanizeSeconds';
import useTimer from '/imports/ui/core/hooks/useTimer';
import { TimerData } from '/imports/ui/core/graphql/queries/timer';
import logger from '/imports/startup/client/logger';
import connectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';

const MAX_HOURS = 23;
const MILLI_IN_HOUR = 3600000;
const MILLI_IN_MINUTE = 60000;
const MILLI_IN_SECOND = 1000;

const TRACKS = [
  'noTrack',
  'track1',
  'track2',
  'track3',
];

const intlMessages = defineMessages({
  hideTimerLabel: {
    id: 'app.timer.hideTimerLabel',
    description: 'Label for hiding timer button',
  },
  title: {
    id: 'app.timer.title',
    description: 'Title for timer',
  },
  stopwatch: {
    id: 'app.timer.button.stopwatch',
    description: 'Stopwatch switch button',
  },
  timer: {
    id: 'app.timer.button.timer',
    description: 'Timer switch button',
  },
  start: {
    id: 'app.timer.button.start',
    description: 'Timer start button',
  },
  stop: {
    id: 'app.timer.button.stop',
    description: 'Timer stop button',
  },
  reset: {
    id: 'app.timer.button.reset',
    description: 'Timer reset button',
  },
  hours: {
    id: 'app.timer.hours',
    description: 'Timer hours label',
  },
  minutes: {
    id: 'app.timer.minutes',
    description: 'Timer minutes label',
  },
  seconds: {
    id: 'app.timer.seconds',
    description: 'Timer seconds label',
  },
  songs: {
    id: 'app.timer.songs',
    description: 'Musics title label',
  },
  noTrack: {
    id: 'app.timer.noTrack',
    description: 'No music radio label',
  },
  track1: {
    id: 'app.timer.track1',
    description: 'Track 1 radio label',
  },
  track2: {
    id: 'app.timer.track2',
    description: 'Track 2 radio label',
  },
  track3: {
    id: 'app.timer.track3',
    description: 'Track 3 radio label',
  },
});

interface TimerPanelProps extends Omit<TimerData, 'active' | 'elapsed' | 'startedAt' | 'accumulated'> {
  timePassed: number;
}

const TimerPanel: React.FC<TimerPanelProps> = ({
  stopwatch,
  songTrack,
  time,
  running,
  timePassed,
}) => {
  const [timerReset] = useMutation(TIMER_RESET);
  const [timerStart] = useMutation(TIMER_START);
  const [timerStop] = useMutation(TIMER_STOP);
  const [timerSwitchMode] = useMutation(TIMER_SWITCH_MODE);
  const [timerSetSongTrack] = useMutation(TIMER_SET_SONG_TRACK);
  const [timerSetTime] = useMutation(TIMER_SET_TIME);

  const intl = useIntl();
  const layoutContextDispatch = layoutDispatch();

  const headerMessage = useMemo(() => {
    return stopwatch ? intlMessages.stopwatch : intlMessages.timer;
  }, [stopwatch]);

  const switchTimer = (stopwatch: boolean) => {
    timerSwitchMode({ variables: { stopwatch } });
  };

  const setTrack = (track: string) => {
    timerSetSongTrack({ variables: { track } });
  };

  const setTime = (time: number) => {
    timerSetTime({ variables: { time } });
    timerStop();
    timerReset();
  };

  const setHours = useCallback((hours: number, time: number) => {
    if (!Number.isNaN(hours) && hours >= 0 && hours <= MAX_HOURS) {
      const currentHours = Math.floor(time / MILLI_IN_HOUR);

      const diff = (hours - currentHours) * MILLI_IN_HOUR;
      setTime(time + diff);
    } else {
      logger.warn('Invalid time');
    }
  }, []);

  const setMinutes = useCallback((minutes: number, time: number) => {
    if (!Number.isNaN(minutes) && minutes >= 0 && minutes <= 59) {
      const currentHours = Math.floor(time / MILLI_IN_HOUR);
      const mHours = currentHours * MILLI_IN_HOUR;

      const currentMinutes = Math.floor((time - mHours) / MILLI_IN_MINUTE);

      const diff = (minutes - currentMinutes) * MILLI_IN_MINUTE;
      setTime(time + diff);
    } else {
      logger.warn('Invalid time');
    }
  }, []);

  const setSeconds = useCallback((seconds: number, time: number) => {
    if (!Number.isNaN(seconds) && seconds >= 0 && seconds <= 59) {
      const currentHours = Math.floor(time / MILLI_IN_HOUR);
      const mHours = currentHours * MILLI_IN_HOUR;

      const currentMinutes = Math.floor((time - mHours) / MILLI_IN_MINUTE);
      const mMinutes = currentMinutes * MILLI_IN_MINUTE;

      const currentSeconds = Math.floor((time - mHours - mMinutes) / MILLI_IN_SECOND);

      const diff = (seconds - currentSeconds) * MILLI_IN_SECOND;
      setTime(time + diff);
    } else {
      logger.warn('Invalid time');
    }
  }, []);

  const closePanel = useCallback(() => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: false,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.NONE,
    });
  }, []);

  const timerControls = useMemo(() => {
    const timeFormatedString = humanizeSeconds(Math.floor(time / 1000));
    const timeSplit = timeFormatedString.split(':');
    const hours = timeSplit.length > 2 ? parseInt(timeSplit[0], 10) : 0;
    const minutes = timeSplit.length > 2 ? parseInt(timeSplit[1], 10) : parseInt(timeSplit[0], 10);
    const seconds = timeSplit.length > 2 ? parseInt(timeSplit[2], 10) : parseInt(timeSplit[1], 10);

    const label = running ? intlMessages.stop : intlMessages.start;
    const color = running ? 'danger' : 'primary';

    const TIMER_CONFIG = window.meetingClientSettings.public.timer;

    return (
      <div>
        {
          !stopwatch ? (
            <Styled.StopwatchTime>
              <Styled.StopwatchTimeInput>
                <Styled.TimerInput
                  type="number"
                  disabled={stopwatch}
                  defaultValue={hours}
                  maxLength={2}
                  max={MAX_HOURS}
                  min="0"
                  onChange={(event) => {
                    setHours(parseInt(event.target.value || '00', 10), time);
                  }}
                  data-test="hoursInput"
                />
                <Styled.StopwatchTimeInputLabel>
                  {intl.formatMessage(intlMessages.hours)}
                </Styled.StopwatchTimeInputLabel>
              </Styled.StopwatchTimeInput>
              <Styled.StopwatchTimeColon>:</Styled.StopwatchTimeColon>
              <Styled.StopwatchTimeInput>
                <Styled.TimerInput
                  type="number"
                  disabled={stopwatch}
                  defaultValue={minutes}
                  maxLength={2}
                  max="59"
                  min="0"
                  onChange={(event) => {
                    setMinutes(parseInt(event.target.value || '00', 10), time);
                  }}
                  data-test="minutesInput"
                />
                <Styled.StopwatchTimeInputLabel>
                  {intl.formatMessage(intlMessages.minutes)}
                </Styled.StopwatchTimeInputLabel>
              </Styled.StopwatchTimeInput>
              <Styled.StopwatchTimeColon>:</Styled.StopwatchTimeColon>
              <Styled.StopwatchTimeInput>
                <Styled.TimerInput
                  type="number"
                  disabled={stopwatch}
                  defaultValue={seconds}
                  maxLength={2}
                  max="59"
                  min="0"
                  onChange={(event) => {
                    setSeconds(parseInt(event.target.value || '00', 10), time);
                  }}
                  data-test="secondsInput"
                />
                <Styled.StopwatchTimeInputLabel>
                  {intl.formatMessage(intlMessages.seconds)}
                </Styled.StopwatchTimeInputLabel>
              </Styled.StopwatchTimeInput>
            </Styled.StopwatchTime>
          ) : null
        }
        {TIMER_CONFIG.music.enabled && !stopwatch
          ? (
            <Styled.TimerSongsWrapper>
              <Styled.TimerSongsTitle
                stopwatch={stopwatch}
              >
                {intl.formatMessage(intlMessages.songs)}
              </Styled.TimerSongsTitle>
              <Styled.TimerTracks>
                {TRACKS.map((track) => (
                  <Styled.TimerTrackItem
                    key={track}
                  >
                    <label htmlFor={track}>
                      <input
                        type="radio"
                        name="track"
                        id={track}
                        value={track}
                        checked={songTrack === track}
                        onChange={(event) => {
                          setTrack(event.target.value);
                        }}
                        disabled={stopwatch}
                      />
                      {intl.formatMessage(intlMessages[track as keyof typeof intlMessages])}
                    </label>
                  </Styled.TimerTrackItem>
                ))}
              </Styled.TimerTracks>
            </Styled.TimerSongsWrapper>
          ) : null}
        <Styled.TimerControls>
          <Styled.TimerControlButton
            color={color}
            label={intl.formatMessage(label)}
            onClick={() => {
              if (running) {
                timerStop();
              } else {
                timerStart();
              }
            }}
            data-test="startStopTimer"
          />
          <Styled.TimerControlButton
            color="secondary"
            label={intl.formatMessage(intlMessages.reset)}
            onClick={() => {
              timerStop();
              timerReset();
            }}
            data-test="resetTimerStopWatch"
          />
        </Styled.TimerControls>
      </div>
    );
  }, [songTrack, stopwatch, time, running]);

  return (
    <Styled.TimerSidebarContent
      data-test={`${stopwatch ? 'stopwatch' : 'timer'}Container`}
    >
      {/* @ts-ignore - JS code */}
      <Header
        leftButtonProps={{
          onClick: closePanel,
          'aria-label': intl.formatMessage(intlMessages.hideTimerLabel),
          label: intl.formatMessage(headerMessage),
        }}
        data-test="timerHeader"
      />
      <Styled.TimerContent>
        <Styled.TimerCurrent
          aria-hidden
          data-test="timerCurrent"
        >
          {humanizeSeconds(Math.floor(timePassed / 1000))}
        </Styled.TimerCurrent>
        <Styled.TimerType>
          <Styled.TimerSwitchButton
            label={intl.formatMessage(intlMessages.stopwatch)}
            onClick={() => {
              timerStop();
              switchTimer(true);
            }}
            disabled={stopwatch}
            color={stopwatch ? 'primary' : 'secondary'}
            data-test="stopwatchButton"
          />
          <Styled.TimerSwitchButton
            label={intl.formatMessage(intlMessages.timer)}
            onClick={() => {
              timerStop();
              switchTimer(false);
            }}
            disabled={!stopwatch}
            color={!stopwatch ? 'primary' : 'secondary'}
            data-test="timerButton"
          />
        </Styled.TimerType>
        {timerControls}
      </Styled.TimerContent>
    </Styled.TimerSidebarContent>
  );
};

const TimerPanelContaier: React.FC = () => {
  const {
    data: timerData,
    loading: timerLoading,
    error: timerError,
  } = useTimer();

  if (timerLoading || !timerData) return null;
  if (timerError) {
    connectionStatus.setSubscriptionFailed(true);
    logger.error(
      {
        logCode: 'subscription_Failed',
        extraInfo: {
          error: timerError,
        },
      },
      'Subscription failed to load',
    );
    return null;
  }

  const {
    stopwatch,
    songTrack,
    running,
    time,
    timePassed = 0,
  } = timerData;

  return (
    <TimerPanel
      stopwatch={stopwatch}
      songTrack={songTrack}
      running={running}
      timePassed={timePassed}
      time={time}
    />
  );
};

export default TimerPanelContaier;
