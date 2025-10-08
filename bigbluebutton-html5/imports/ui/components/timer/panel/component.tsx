import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  useMutation,
} from '@apollo/client';
import Styled from './styles';
import { layoutDispatch } from '../../layout/context';
import { ACTIONS, PANELS } from '../../layout/enums';
import {
  TIMER_ACTIVATE,
  TIMER_DEACTIVATE,
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
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import Auth from '/imports/ui/services/auth';

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
    id: 'app.sidebarContent.minimizePanelLabel',
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
  deactivate: {
    id: 'app.timer.button.deactivate',
    description: 'Timer deactivate button',
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

interface TimerPanelProps extends Omit<TimerData, 'active' | 'elapsed' | 'startedAt' | 'startedOn'| 'accumulated'> {
  timePassed: number;
  isPaused: boolean;
}

const TimerPanel: React.FC<TimerPanelProps> = ({
  stopwatch,
  songTrack,
  time,
  running,
  timePassed,
  isPaused,
}) => {
  const [timerReset] = useMutation(TIMER_RESET);
  const [timerStart] = useMutation(TIMER_START);
  const [timerStop] = useMutation(TIMER_STOP);
  const [timerSwitchMode] = useMutation(TIMER_SWITCH_MODE);
  const [timerSetSongTrack] = useMutation(TIMER_SET_SONG_TRACK);
  const [timerSetTime] = useMutation(TIMER_SET_TIME);
  const [timerDeactivate] = useMutation(TIMER_DEACTIVATE);

  const intl = useIntl();
  const layoutContextDispatch = layoutDispatch();

  const [focusedUnit, setFocusedUnit] = useState<'hours' | 'minutes' | 'seconds'>('seconds');
  const [lastSelectedTrack, setLastSelectedTrack] = useState<string | null>(null);
  const hoursInputRef = React.useRef<HTMLInputElement>(null);
  const minutesInputRef = React.useRef<HTMLInputElement>(null);
  const secondsInputRef = React.useRef<HTMLInputElement>(null);
  const timeInSeconds = Math.max(0, Math.floor(timePassed / 1000));
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;

  useEffect(() => {
    if (songTrack && songTrack !== 'noTrack') {
      setLastSelectedTrack(songTrack);
    }
  }, [songTrack]);

  const switchTimer = (stopwatch: boolean) => {
    timerSwitchMode({ variables: { stopwatch } });
  };

  const setTrack = (track: string) => {
    timerSetSongTrack({ variables: { track } });
  };

  const handleMusicSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isEnabled = event.target.checked;
    if (isEnabled) {
      setTrack(lastSelectedTrack || 'track1');
    } else {
      setTrack('noTrack');
    }
  };

  const syncTimeWithBackend = useCallback((h: number, m: number, s: number) => {
    let valid_seconds = s;
    if (!stopwatch && h === 0 && m === 0 && s === 0) {
      valid_seconds = 1;
    }

    const newTimeInMillis = (h * MILLI_IN_HOUR)
      + (m * MILLI_IN_MINUTE)
      + (valid_seconds * MILLI_IN_SECOND);

    if (newTimeInMillis !== time) {
      timerSetTime({ variables: { time: newTimeInMillis } });
      if (isPaused) {
        // The timer needs to be reset here because the time
        // already passed has to be zero
        timerReset();
      }
    }
  }, [time, timerSetTime, stopwatch, isPaused]);

  const handleHoursChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value || '0', 10);
    if (Number.isNaN(value)) return;
    const newHours = Math.max(0, Math.min(value, MAX_HOURS));
    syncTimeWithBackend(newHours, minutes, seconds);
  };

  const handleMinutesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value || '0', 10);
    if (Number.isNaN(value)) return;
    let newMinutes = value;
    let carryOver = 0;
    if (value >= 60) {
      carryOver = Math.floor(value / 60);
      newMinutes = value % 60;
      const newHours = Math.min(hours + carryOver, MAX_HOURS);
      syncTimeWithBackend(newHours, newMinutes, seconds);
      hoursInputRef.current?.focus();
      hoursInputRef.current?.select();
    } else {
      newMinutes = Math.max(0, Math.min(value, 59));
      syncTimeWithBackend(hours, newMinutes, seconds);
    }
  };

  const handleSecondsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value || '0', 10);
    if (Number.isNaN(value)) return;
    let newSeconds = value;
    let carryOver = 0;
    if (value >= 60) {
      carryOver = Math.floor(value / 60);
      newSeconds = value % 60;
      const newMinutes = Math.min(minutes + carryOver, 59);
      let additionalHours = 0;
      if (newMinutes === 59 && carryOver > 0) {
        additionalHours = Math.floor((minutes + carryOver) / 60);
      }
      const newHours = Math.min(hours + additionalHours, MAX_HOURS);
      syncTimeWithBackend(newHours, newMinutes, newSeconds);
      minutesInputRef.current?.focus();
      minutesInputRef.current?.select();
    } else {
      newSeconds = Math.max(0, Math.min(value, 59));
      syncTimeWithBackend(hours, minutes, newSeconds);
    }
  };

  const changeTime = useCallback((amountInSeconds: number) => {
    if (running) return;

    const currentTimeInSeconds = (hours * 3600) + (minutes * 60) + seconds;
    let newTotalSeconds = currentTimeInSeconds + amountInSeconds;

    const maxSeconds = (MAX_HOURS * 3600) + (59 * 60) + 59;
    newTotalSeconds = Math.max(0, Math.min(newTotalSeconds, maxSeconds));

    const h = Math.floor(newTotalSeconds / 3600);
    const m = Math.floor((newTotalSeconds % 3600) / 60);
    const s = newTotalSeconds % 60;

    syncTimeWithBackend(h, m, s);
  }, [running, hours, minutes, seconds]);

  // Removed external +/- panel buttons; inline arrows handle adjustments per unit.

  // Increment / decrement helpers for individual units (used by inline arrows)
  const incUnit = useCallback((unit: 'hours' | 'minutes' | 'seconds') => {
    if (unit === 'hours') changeTime(3600);
    if (unit === 'minutes') changeTime(60);
    if (unit === 'seconds') changeTime(1);
    setFocusedUnit(unit);
  }, [changeTime]);

  const decUnit = useCallback((unit: 'hours' | 'minutes' | 'seconds') => {
    if (unit === 'hours') changeTime(-3600);
    if (unit === 'minutes') changeTime(-60);
    if (unit === 'seconds') changeTime(-1);
    setFocusedUnit(unit);
  }, [changeTime]);

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

  const handleDeactivate = useCallback(() => {
    timerDeactivate();
    closePanel();
  }, [timerDeactivate, closePanel]);

  const handleReset = useCallback(() => {
    timerStop();
    timerReset();
  }, [timerStop, timerReset]);

  const timerMusicOptions = useMemo(() => {
    const TIMER_CONFIG = window.meetingClientSettings.public.timer;
    if (!TIMER_CONFIG.music.enabled) return null;

    return (
      <Styled.TimerSongsWrapper>
        <Styled.MusicSwitchLabel
          control={(
            <Styled.MaterialSwitch
              checked={(songTrack !== 'noTrack') && !stopwatch}
              onChange={handleMusicSwitchChange}
              disabled={running || stopwatch}
            />
          )}
          label={intl.formatMessage(intlMessages.songs)}
        />
        {(songTrack !== 'noTrack' && !stopwatch) && (
          <Styled.TimerTracks>
            {TRACKS.map((track) => {
              if (track === 'noTrack') return null;
              return (
                <Styled.TimerTrackItem key={track}>
                  <label htmlFor={track}>
                    <input
                      type="radio"
                      name="track"
                      id={track}
                      value={track}
                      checked={songTrack === track}
                      onChange={(event) => setTrack(event.target.value)}
                      disabled={running || stopwatch}
                    />
                    {intl.formatMessage(intlMessages[track as keyof typeof intlMessages])}
                  </label>
                </Styled.TimerTrackItem>
              );
            })}
          </Styled.TimerTracks>
        )}
      </Styled.TimerSongsWrapper>
    );
  }, [songTrack, stopwatch, running]);

  let controlButtons;
  if (running) {
    controlButtons = (
      <Styled.ButtonRow>
        <Styled.ResetButton
          color="secondary"
          label={intl.formatMessage(intlMessages.reset)}
          onClick={handleReset}
          data-test="resetTimerStopWatch"
        />
        <Styled.ControlButton
          color="danger"
          label={intl.formatMessage(intlMessages.stop)}
          onClick={timerStop}
          data-test="startStopTimer"
        />
      </Styled.ButtonRow>
    );
  } else if (isPaused) {
    controlButtons = (
      <Styled.ButtonRow>
        <Styled.ResetButton
          color="secondary"
          label={intl.formatMessage(intlMessages.reset)}
          onClick={handleReset}
          data-test="resetTimerStopWatch"
        />
        <Styled.ControlButton
          color="primary"
          label={intl.formatMessage(intlMessages.start)}
          onClick={timerStart}
          data-test="startStopTimer"
        />
      </Styled.ButtonRow>
    );
  } else {
    controlButtons = (
      <Styled.ButtonRow>
        <Styled.ControlButton
          color="primary"
          label={intl.formatMessage(intlMessages.start)}
          onClick={() => {
            if (!stopwatch) {
              const newStartTime = (hours * MILLI_IN_HOUR)
                + (minutes * MILLI_IN_MINUTE)
                + (seconds * MILLI_IN_SECOND);

              if (newStartTime !== time) {
                timerSetTime({ variables: { time: newStartTime } });
              }
            }
            timerStart();
          }}
          data-test="startStopTimer"
        />
      </Styled.ButtonRow>
    );
  }

  return (
    <>
      <Styled.HeaderContainer
        title={intl.formatMessage(intlMessages.title)}
        rightButtonProps={{
          'aria-label': intl.formatMessage(intlMessages.hideTimerLabel, { 0: intl.formatMessage(intlMessages.timer) }),
          'data-test': 'closeTimer',
          icon: 'minus',
          label: intl.formatMessage(intlMessages.hideTimerLabel, { 0: intl.formatMessage(intlMessages.timer) }),
          onClick: closePanel,
        }}
        data-test="timerHeader"
      />
      <Styled.Separator />
      <Styled.TimerScrollableContent id="timer-scroll-box">
        <Styled.TimerContent>
          <Styled.TimerType>
            <Styled.TimerSwitchButton
              label={intl.formatMessage(intlMessages.timer)}
              onClick={() => {
                timerStop();
                switchTimer(false);
              }}
              disabled={!stopwatch || running}
              color={!stopwatch ? 'primary' : 'secondary'}
              data-test="timerButton"
            />
            <Styled.TimerSwitchButton
              label={intl.formatMessage(intlMessages.stopwatch)}
              onClick={() => {
                timerStop();
                timerReset();
                switchTimer(true);
              }}
              disabled={stopwatch || running}
              color={stopwatch ? 'primary' : 'secondary'}
              data-test="stopwatchButton"
            />
          </Styled.TimerType>

          {stopwatch ? (
            <Styled.TimerCurrent
              aria-hidden
              data-test="timerCurrent"
            >
              {humanizeSeconds(Math.floor(timePassed / 1000))}
            </Styled.TimerCurrent>
          ) : (
            <Styled.TimeInputWrapper>
              <Styled.TimeInputGroup>
                <>
                  <Styled.TimeUnitContainer>
                    <Styled.TimerInput
                      type="number"
                      readOnly={running}
                      disabled={running}
                      value={String(hours).padStart(2, '0')}
                      max={MAX_HOURS}
                      min="0"
                      step="1"
                      onChange={handleHoursChange}
                      onFocus={() => setFocusedUnit('hours')}
                      ref={hoursInputRef}
                      data-test="hoursInput"
                      isSelected={!running && focusedUnit === 'hours'}
                    />
                    <Styled.InputArrows disabled={running} aria-hidden={running}>
                      <Styled.InputArrowButton
                        type="button"
                        aria-label={`${intl.formatMessage(intlMessages.hours)} +1`}
                        disabled={running}
                        onClick={() => incUnit('hours')}
                      >
                        ▲
                      </Styled.InputArrowButton>
                      <Styled.InputArrowButton
                        type="button"
                        aria-label={`${intl.formatMessage(intlMessages.hours)} -1`}
                        disabled={running}
                        onClick={() => decUnit('hours')}
                      >
                        ▼
                      </Styled.InputArrowButton>
                    </Styled.InputArrows>
                  </Styled.TimeUnitContainer>
                  <Styled.TimeInputColon>:</Styled.TimeInputColon>
                  <Styled.TimeUnitContainer>
                    <Styled.TimerInput
                      type="number"
                      readOnly={running}
                      disabled={running}
                      value={String(minutes).padStart(2, '0')}
                      max="59"
                      min="0"
                      step="1"
                      onChange={handleMinutesChange}
                      onFocus={() => setFocusedUnit('minutes')}
                      ref={minutesInputRef}
                      data-test="minutesInput"
                      isSelected={!running && focusedUnit === 'minutes'}
                    />
                    <Styled.InputArrows disabled={running} aria-hidden={running}>
                      <Styled.InputArrowButton
                        type="button"
                        aria-label={`${intl.formatMessage(intlMessages.minutes)} +1`}
                        disabled={running}
                        onClick={() => incUnit('minutes')}
                      >
                        ▲
                      </Styled.InputArrowButton>
                      <Styled.InputArrowButton
                        type="button"
                        aria-label={`${intl.formatMessage(intlMessages.minutes)} -1`}
                        disabled={running}
                        onClick={() => decUnit('minutes')}
                      >
                        ▼
                      </Styled.InputArrowButton>
                    </Styled.InputArrows>
                  </Styled.TimeUnitContainer>
                  <Styled.TimeInputColon>:</Styled.TimeInputColon>
                  <Styled.TimeUnitContainer>
                    <Styled.TimerInput
                      type="number"
                      readOnly={running}
                      disabled={running}
                      value={String(seconds).padStart(2, '0')}
                      max="59"
                      min="0"
                      step="1"
                      onChange={handleSecondsChange}
                      onFocus={() => setFocusedUnit('seconds')}
                      ref={secondsInputRef}
                      data-test="secondsInput"
                      isSelected={!running && focusedUnit === 'seconds'}
                    />
                    <Styled.InputArrows disabled={running} aria-hidden={running}>
                      <Styled.InputArrowButton
                        type="button"
                        aria-label={`${intl.formatMessage(intlMessages.seconds)} +1`}
                        disabled={running}
                        onClick={() => incUnit('seconds')}
                      >
                        ▲
                      </Styled.InputArrowButton>
                      <Styled.InputArrowButton
                        type="button"
                        aria-label={`${intl.formatMessage(intlMessages.seconds)} -1`}
                        disabled={running}
                        onClick={() => decUnit('seconds')}
                      >
                        ▼
                      </Styled.InputArrowButton>
                    </Styled.InputArrows>
                  </Styled.TimeUnitContainer>
                </>
              </Styled.TimeInputGroup>
              {/* External +/- buttons removed; using inline arrows inside each input */}
            </Styled.TimeInputWrapper>
          )}

          {timerMusicOptions}

          <Styled.FooterSeparator />
          <Styled.ControlsContainer>
            {controlButtons}
            <Styled.DeactivateButton
              color="default"
              label={intl.formatMessage(intlMessages.deactivate)}
              onClick={handleDeactivate}
              data-test="deactivateTimer"
            />
          </Styled.ControlsContainer>
        </Styled.TimerContent>
      </Styled.TimerScrollableContent>
    </>
  );
};

const TimerPanelContaier: React.FC = () => {
  const [timerActivate] = useMutation(TIMER_ACTIVATE);
  const { data: timerData } = useTimer();
  const { data: currentUser } = useCurrentUser();

  const amIModerator = !!currentUser?.isModerator;

  const activateTimer = useCallback(() => {
    if ((timerData?.active) || !amIModerator) return;

    const TIMER_CONFIG = window.meetingClientSettings.public.timer;
    const meetingId = Auth.meetingID;
    if (!meetingId) {
      logger.warn({ logCode: 'timer_activate_no_meetingid' }, 'Timer activation skipped: no meetingId');
      return;
    }

    timerActivate({
      variables: {
        stopwatch: false,
        running: false,
        time: TIMER_CONFIG.time * MILLI_IN_MINUTE,
        meetingId,
      },
    }).catch((error) => {
      if (!error.message?.includes('already active')) {
        logger.error(
          { logCode: 'timer_activate_failed', extraInfo: { errorMessage: error?.message } },
          `Timer activation failed: ${error?.message}`,
        );
      }
    });
  }, [timerActivate, timerData, amIModerator]);

  useEffect(() => {
    if (timerData?.active === false && amIModerator) {
      activateTimer();
    }
  }, [timerData?.active, amIModerator, activateTimer]);

  const currentTimer = timerData;

  if (currentTimer?.active) {
    const {
      stopwatch,
      songTrack,
      running,
      time,
      timePassed = 0,
      startedAt,
    } = currentTimer;

    return (
      <TimerPanel
        stopwatch={stopwatch}
        songTrack={songTrack}
        running={running}
        timePassed={timePassed}
        time={time}
        isPaused={!running && startedAt !== null}
      />
    );
  }
  return null;
};

export default TimerPanelContaier;
