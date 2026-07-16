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
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import PanelHeader from '/imports/ui/components/common/panel-header/component';
import {
  formatPresetLabel,
  getNextPresetIndex,
  getPrevPresetIndex,
  getVisiblePresets,
  incrementTimeUnit,
  decrementTimeUnit,
  convertSecondsToTime,
  addTimeWithBounds,
} from '../service';

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
  presetHours: {
    id: 'app.timer.preset.hours',
    description: 'Preset label for hours with abbreviation (e.g., 1h)',
  },
  presetMinutes: {
    id: 'app.timer.preset.minutes',
    description: 'Preset label for minutes with abbreviation (e.g., 5min)',
  },
  setTimerTo: {
    id: 'app.timer.aria.setTo',
    description: 'Aria label for preset buttons: Set timer to {label}',
  },
  prevPreset: {
    id: 'app.timer.aria.prevPreset',
    description: 'Aria label: Previous preset',
  },
  nextPreset: {
    id: 'app.timer.aria.nextPreset',
    description: 'Aria label: Next preset',
  },
  decrementHours: {
    id: 'app.timer.aria.decrementHours',
    description: 'Aria label: Decrease hours by {amount}',
  },
  incrementHours: {
    id: 'app.timer.aria.incrementHours',
    description: 'Aria label: Increase hours by {amount}',
  },
  decrementMinutes: {
    id: 'app.timer.aria.decrementMinutes',
    description: 'Aria label: Decrease minutes by {amount}',
  },
  incrementMinutes: {
    id: 'app.timer.aria.incrementMinutes',
    description: 'Aria label: Increase minutes by {amount}',
  },
  decrementSeconds: {
    id: 'app.timer.aria.decrementSeconds',
    description: 'Aria label: Decrease seconds by {amount}',
  },
  incrementSeconds: {
    id: 'app.timer.aria.incrementSeconds',
    description: 'Aria label: Increase seconds by {amount}',
  },
  addTime: {
    id: 'app.timer.aria.addTime',
    description: 'Aria label: Add {time} to timer',
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

  // timer settings from config
  const TIMER_CONFIG = window.meetingClientSettings.public.timer;
  const MAX_HOURS = TIMER_CONFIG.maxHours;
  const PRESET_SECONDS = TIMER_CONFIG.presets;

  // Ensure QUICK_ADD_BUTTONS is always a valid array of numbers
  const QUICK_ADD_BUTTONS: number[] = Array.isArray(TIMER_CONFIG.quickAddButtons)
    ? TIMER_CONFIG.quickAddButtons.filter((item): item is number => typeof item === 'number' && item > 0)
    : [30, 60, 300];

  const [focusedUnit, setFocusedUnit] = useState<'hours' | 'minutes' | 'seconds' | null>(null);
  const [lastSelectedTrack, setLastSelectedTrack] = useState<string | null>(null);
  // only sync to server on blur or start
  const [localHours, setLocalHours] = useState(0);
  const [localMinutes, setLocalMinutes] = useState(0);
  const [localSeconds, setLocalSeconds] = useState(0);
  const hoursInputRef = React.useRef<HTMLInputElement>(null);
  const minutesInputRef = React.useRef<HTMLInputElement>(null);
  const secondsInputRef = React.useRef<HTMLInputElement>(null);
  const syncTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const timeInSeconds = Math.max(0, Math.floor(timePassed / 1000));
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;

  // UI state to carousel preset and clear highlight
  const [currentPresetIndex, setCurrentPresetIndex] = useState(0);
  const totalPresets = PRESET_SECONDS.length;

  // Visual cleanup is now handled directly in button callbacks

  // Sync local state with server state
  useEffect(() => {
    if (!running) {
      setLocalHours(hours);
      setLocalMinutes(minutes);
      setLocalSeconds(seconds);
    }
  }, [hours, minutes, seconds, running]);

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
  }, [time, timerSetTime, stopwatch, isPaused, timerReset]);

  const handleHoursChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value || '0', 10);
    if (Number.isNaN(value)) return;
    const newHours = Math.max(0, Math.min(value, MAX_HOURS));
    setLocalHours(newHours);
  };

  const handleHoursBlur = () => {
    syncTimeWithBackend(localHours, localMinutes, localSeconds);
  };

  const handleMinutesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value || '0', 10);
    if (Number.isNaN(value)) return;
    if (value >= 60) {
      const carryOver = Math.floor(value / 60);
      const newMinutes = value % 60;
      const newHours = Math.min(localHours + carryOver, MAX_HOURS);
      setLocalHours(newHours);
      setLocalMinutes(newMinutes);
      hoursInputRef.current?.focus();
      hoursInputRef.current?.select();
    } else {
      const newMinutes = Math.max(0, Math.min(value, 59));
      setLocalMinutes(newMinutes);
    }
  };

  const handleMinutesBlur = () => {
    syncTimeWithBackend(localHours, localMinutes, localSeconds);
  };

  const handleSecondsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value || '0', 10);
    if (Number.isNaN(value)) return;
    if (value >= 60) {
      const newSeconds = value % 60;
      const totalMinutes = localMinutes + Math.floor(value / 60);
      const additionalHours = Math.floor(totalMinutes / 60);
      const newMinutes = totalMinutes % 60;
      const newHours = Math.min(localHours + additionalHours, MAX_HOURS);
      setLocalHours(newHours);
      setLocalMinutes(newMinutes);
      setLocalSeconds(newSeconds);
      minutesInputRef.current?.focus();
      minutesInputRef.current?.select();
    } else {
      const clampedSeconds = Math.max(0, Math.min(value, 59));
      setLocalSeconds(clampedSeconds);
    }
  };

  const handleSecondsBlur = () => {
    syncTimeWithBackend(localHours, localMinutes, localSeconds);
  };

  const changeTime = useCallback((amountInSeconds: number) => {
    if (running) return;

    const { hours: h, minutes: m, seconds: s } = addTimeWithBounds(
      localHours,
      localMinutes,
      localSeconds,
      amountInSeconds,
      MAX_HOURS,
    );

    setLocalHours(h);
    setLocalMinutes(m);
    setLocalSeconds(s);
    syncTimeWithBackend(h, m, s);
  }, [running, localHours, localMinutes, localSeconds, syncTimeWithBackend, MAX_HOURS]);

  const setAbsoluteTime = useCallback((totalSeconds: number) => {
    if (running) return;
    const { hours: h, minutes: m, seconds: s } = convertSecondsToTime(totalSeconds);
    setLocalHours(h);
    setLocalMinutes(m);
    setLocalSeconds(s);
    syncTimeWithBackend(h, m, s);
  }, [running, syncTimeWithBackend]);

  // Visual cleanup is now handled directly in button callbacks

  // Preset navigation helpers
  const nextPreset = useCallback(() => {
    setCurrentPresetIndex(getNextPresetIndex(currentPresetIndex, totalPresets));
  }, [currentPresetIndex, totalPresets]);

  const prevPreset = useCallback(() => {
    setCurrentPresetIndex(getPrevPresetIndex(currentPresetIndex, totalPresets));
  }, [currentPresetIndex, totalPresets]);

  const visiblePresets = getVisiblePresets(currentPresetIndex, PRESET_SECONDS);

  // Removed external +/- panel buttons; inline arrows handle adjustments per unit.

  // Increment / decrement helpers for individual units (used by inline arrows)
  const incUnit = useCallback((unit: 'hours' | 'minutes' | 'seconds') => {
    if (running) return;

    const { hours: newHours, minutes: newMinutes, seconds: newSeconds } = incrementTimeUnit(
      localHours,
      localMinutes,
      localSeconds,
      unit,
      MAX_HOURS,
    );

    setLocalHours(newHours);
    setLocalMinutes(newMinutes);
    setLocalSeconds(newSeconds);
    setFocusedUnit(unit);

    // Cancel previous timeout to ensure only the last value is synced (avoid multiple calls)
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    // Sync to backend after delay (like input blur behavior)
    syncTimeoutRef.current = setTimeout(() => {
      syncTimeWithBackend(newHours, newMinutes, newSeconds);
      setFocusedUnit(null);
      syncTimeoutRef.current = null;
    }, 1000);
  }, [running, localHours, localMinutes, localSeconds, syncTimeWithBackend, MAX_HOURS]);

  const decUnit = useCallback((unit: 'hours' | 'minutes' | 'seconds') => {
    if (running) return;

    const { hours: newHours, minutes: newMinutes, seconds: newSeconds } = decrementTimeUnit(
      localHours,
      localMinutes,
      localSeconds,
      unit,
    );

    setLocalHours(newHours);
    setLocalMinutes(newMinutes);
    setLocalSeconds(newSeconds);
    setFocusedUnit(unit);

    // Cancel previous timeout to ensure only the last value is synced (avoid multiple calls)
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    // Sync to backend after delay (like input blur behavior)
    syncTimeoutRef.current = setTimeout(() => {
      syncTimeWithBackend(newHours, newMinutes, newSeconds);
      setFocusedUnit(null);
      syncTimeoutRef.current = null;
    }, 1000);
  }, [running, localHours, localMinutes, localSeconds, syncTimeWithBackend]);

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
                <Styled.TimerTrackItem key={track} isSelected={songTrack === track}>
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
  }, [songTrack, stopwatch, running, handleMusicSwitchChange, intl]);

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
            // Sync local time to backend before starting
            if (!stopwatch) {
              const newStartTime = (localHours * MILLI_IN_HOUR)
                + (localMinutes * MILLI_IN_MINUTE)
                + (localSeconds * MILLI_IN_SECOND);

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
      <PanelHeader
        panelId={PANELS.TIMER}
        title={intl.formatMessage(intlMessages.title)}
        dataTest="timerHeader"
        closeButtonDataTest="closeTimer"
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
              data-test="stopwatchCurrent"
            >
              {humanizeSeconds(Math.floor(timePassed / 1000))}
            </Styled.TimerCurrent>
          ) : (
            <>
              <Styled.TimerPresetsRow>
                <Styled.PresetArrowButton
                  role="button"
                  aria-label={intl.formatMessage(intlMessages.prevPreset)}
                  color="default"
                  icon="left_arrow"
                  size="sm"
                  onClick={prevPreset}
                  disabled={running}
                  hideLabel
                  data-test="prevPreset"
                />
                {visiblePresets.map(({ secs, isActive, idx }) => (
                  <Styled.TimerPresetButton
                    key={`preset-${secs}-${idx}`}
                    isActive={isActive}
                    onClick={() => setAbsoluteTime(secs)}
                    disabled={running}
                    aria-label={intl.formatMessage(
                      intlMessages.setTimerTo,
                      { label: formatPresetLabel(secs) },
                    )}
                    data-test={`preset-${secs}`}
                  >
                    {formatPresetLabel(secs)}
                  </Styled.TimerPresetButton>
                ))}
                <Styled.PresetArrowButton
                  role="button"
                  aria-label={intl.formatMessage(intlMessages.nextPreset)}
                  color="default"
                  icon="right_arrow"
                  size="sm"
                  onClick={nextPreset}
                  disabled={running}
                  hideLabel
                  data-test="nextPreset"
                />
              </Styled.TimerPresetsRow>
              <Styled.TimeInputWrapper>
                <Styled.TimeInputGroup>
                  <Styled.TimeUnitContainer>
                    <Styled.TimerInput
                      type="number"
                      readOnly={running}
                      disabled={running}
                      value={String(running ? hours : localHours).padStart(2, '0')}
                      max={MAX_HOURS}
                      min="0"
                      step="1"
                      onChange={handleHoursChange}
                      onBlur={handleHoursBlur}
                      onFocus={() => setFocusedUnit('hours')}
                      ref={hoursInputRef}
                      data-test="timerHoursInput"
                      isSelected={!running && focusedUnit === 'hours'}
                      tabIndex={running ? -1 : 0}
                    />
                    <Styled.InputArrows disabled={running} aria-hidden={running} isSelected={!running && focusedUnit === 'hours'}>
                      <Styled.InputArrowButton
                        role="button"
                        aria-label={intl.formatMessage(intlMessages.incrementHours, { amount: 1 })}
                        disabled={running}
                        onClick={() => incUnit('hours')}
                        tabIndex={-1}
                        icon="up_arrow"
                        size="sm"
                        color="default"
                        hideLabel
                        isSelected={!running && focusedUnit === 'hours'}
                      />
                      <Styled.InputArrowButtonDown
                        role="button"
                        aria-label={intl.formatMessage(intlMessages.decrementHours, { amount: 1 })}
                        disabled={running}
                        onClick={() => decUnit('hours')}
                        tabIndex={-1}
                        icon="up_arrow"
                        size="sm"
                        color="default"
                        hideLabel
                        isSelected={!running && focusedUnit === 'hours'}
                      />
                    </Styled.InputArrows>
                    <Styled.TimeUnitLabel>
                      {intl.formatMessage(intlMessages.hours)}
                    </Styled.TimeUnitLabel>
                  </Styled.TimeUnitContainer>
                  <Styled.TimeUnitContainer>
                    <Styled.TimerInput
                      type="number"
                      readOnly={running}
                      disabled={running}
                      value={String(running ? minutes : localMinutes).padStart(2, '0')}
                      max="59"
                      min="0"
                      step="1"
                      onChange={handleMinutesChange}
                      onBlur={handleMinutesBlur}
                      onFocus={() => setFocusedUnit('minutes')}
                      ref={minutesInputRef}
                      data-test="timerMinutesInput"
                      isSelected={!running && focusedUnit === 'minutes'}
                      tabIndex={running ? -1 : 0}
                    />
                    <Styled.InputArrows disabled={running} aria-hidden={running} isSelected={!running && focusedUnit === 'minutes'}>
                      <Styled.InputArrowButton
                        role="button"
                        aria-label={intl.formatMessage(intlMessages.incrementMinutes, { amount: 1 })}
                        disabled={running}
                        onClick={() => incUnit('minutes')}
                        tabIndex={-1}
                        icon="up_arrow"
                        size="sm"
                        color="default"
                        hideLabel
                        isSelected={!running && focusedUnit === 'minutes'}
                      />
                      <Styled.InputArrowButtonDown
                        role="button"
                        aria-label={intl.formatMessage(intlMessages.decrementMinutes, { amount: 1 })}
                        disabled={running}
                        onClick={() => decUnit('minutes')}
                        tabIndex={-1}
                        icon="up_arrow"
                        size="sm"
                        color="default"
                        hideLabel
                        isSelected={!running && focusedUnit === 'minutes'}
                      />
                    </Styled.InputArrows>
                    <Styled.TimeUnitLabel>
                      {intl.formatMessage(intlMessages.minutes)}
                    </Styled.TimeUnitLabel>
                  </Styled.TimeUnitContainer>
                  <Styled.TimeUnitContainer>
                    <Styled.TimerInput
                      type="number"
                      readOnly={running}
                      disabled={running}
                      value={String(running ? seconds : localSeconds).padStart(2, '0')}
                      max="59"
                      min="0"
                      step="1"
                      onChange={handleSecondsChange}
                      onBlur={handleSecondsBlur}
                      onFocus={() => setFocusedUnit('seconds')}
                      ref={secondsInputRef}
                      data-test="timerSecondsInput"
                      isSelected={!running && focusedUnit === 'seconds'}
                      tabIndex={running ? -1 : 0}
                    />
                    <Styled.InputArrows disabled={running} aria-hidden={running} isSelected={!running && focusedUnit === 'seconds'}>
                      <Styled.InputArrowButton
                        role="button"
                        aria-label={intl.formatMessage(intlMessages.incrementSeconds, { amount: 1 })}
                        disabled={running}
                        onClick={() => incUnit('seconds')}
                        tabIndex={-1}
                        icon="up_arrow"
                        size="sm"
                        color="default"
                        hideLabel
                        isSelected={!running && focusedUnit === 'seconds'}
                      />
                      <Styled.InputArrowButtonDown
                        role="button"
                        aria-label={intl.formatMessage(intlMessages.decrementSeconds, { amount: 1 })}
                        disabled={running}
                        onClick={() => decUnit('seconds')}
                        tabIndex={-1}
                        icon="up_arrow"
                        size="sm"
                        color="default"
                        hideLabel
                        isSelected={!running && focusedUnit === 'seconds'}
                      />
                    </Styled.InputArrows>
                    <Styled.TimeUnitLabel>
                      {intl.formatMessage(intlMessages.seconds)}
                    </Styled.TimeUnitLabel>
                  </Styled.TimeUnitContainer>
                </Styled.TimeInputGroup>
                {/* External +/- buttons removed; using inline arrows inside each input */}
                <Styled.TimerAddsRow>
                  {QUICK_ADD_BUTTONS.map((seconds) => {
                    const testId = `add${seconds}s`;
                    const timeLabel = seconds >= 60
                      ? `${Math.floor(seconds / 60)} minute${Math.floor(seconds / 60) > 1 ? 's' : ''}`
                      : `${seconds} second${seconds > 1 ? 's' : ''}`;

                    // Generate time format label like humanizeSeconds but with + prefix
                    const hours = Math.floor(seconds / 3600);
                    const minutes = Math.floor((seconds % 3600) / 60);
                    const secs = seconds % 60;
                    const formatNumber = (num: number) => (num < 10 ? `0${num}` : num.toString());

                    const displayLabel = hours > 0
                      ? `+${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(secs)}`
                      : `+${formatNumber(minutes)}:${formatNumber(secs)}`;

                    const tooltipMessage = intl.formatMessage(intlMessages.addTime, { time: timeLabel });

                    return (
                      <TooltipContainer
                        key={testId}
                        title={tooltipMessage}
                      >
                        <Styled.TimerAddButton
                          onClick={() => changeTime(seconds)}
                          disabled={running}
                          aria-label={tooltipMessage}
                          data-test={testId}
                        >
                          {displayLabel}
                        </Styled.TimerAddButton>
                      </TooltipContainer>
                    );
                  })}
                </Styled.TimerAddsRow>
              </Styled.TimeInputWrapper>

              {timerMusicOptions}
            </>
          )}

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
