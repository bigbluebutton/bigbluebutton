import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import Styled from '../styles';
import {
  TIMER_RESET,
  TIMER_SET_TIME,
} from '../../mutations';
import humanizeSeconds from '/imports/utils/humanizeSeconds';
import TimerSingleton from '/imports/ui/core/singletons/timer';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import {
  formatPresetLabel,
  getNextPresetIndex,
  getPrevPresetIndex,
  getVisiblePresets,
  incrementTimeUnit,
  decrementTimeUnit,
  convertSecondsToTime,
  addTimeWithBounds,
} from '../../service';

const MILLI_IN_HOUR = 3600000;
const MILLI_IN_MINUTE = 60000;
const MILLI_IN_SECOND = 1000;

const intlMessages = defineMessages({
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
  hoursAriaLabel: {
    id: 'app.timer.aria.hours',
    description: 'Accessible name for the timer hours input',
  },
  minutesAriaLabel: {
    id: 'app.timer.aria.minutes',
    description: 'Accessible name for the timer minutes input',
  },
  secondsAriaLabel: {
    id: 'app.timer.aria.seconds',
    description: 'Accessible name for the timer seconds input',
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
});

export interface TimerTimeSectionProps {
  stopwatch: boolean;
  running: boolean;
  time: number;
  isPaused: boolean;
  onSyncLocalTime?: (h: number, m: number, s: number) => void;
}

const TimerTimeSectionComponent: React.FC<TimerTimeSectionProps> = ({
  stopwatch,
  running,
  time,
  isPaused,
  onSyncLocalTime,
}) => {
  const intl = useIntl();
  const [timerSetTime] = useMutation(TIMER_SET_TIME);
  const [timerReset] = useMutation(TIMER_RESET);

  const TIMER_CONFIG = window.meetingClientSettings.public.timer;
  const MAX_HOURS = TIMER_CONFIG.maxHours;
  const PRESET_SECONDS = TIMER_CONFIG.presets;
  const QUICK_ADD_BUTTONS: number[] = Array.isArray(TIMER_CONFIG.quickAddButtons)
    ? TIMER_CONFIG.quickAddButtons.filter((item): item is number => typeof item === 'number' && item > 0)
    : [30, 60, 300];

  // Local subscription to TimerSingleton — isolated tick, does not bubble up
  const [timePassed, setTimePassed] = useState<number>(0);
  useEffect(() => {
    return TimerSingleton.subscribe((newTimePassed) => {
      setTimePassed(newTimePassed);
    });
  }, []);

  const timeInSeconds = Math.max(0, Math.floor(timePassed / 1000));
  const serverHours = Math.floor(timeInSeconds / 3600);
  const serverMinutes = Math.floor((timeInSeconds % 3600) / 60);
  const serverSeconds = timeInSeconds % 60;

  const [focusedUnit, setFocusedUnit] = useState<'hours' | 'minutes' | 'seconds' | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<'hours' | 'minutes' | 'seconds' | null>(null);
  const [focusedRunningValue, setFocusedRunningValue] = useState<number | null>(null);
  const [localHours, setLocalHours] = useState(0);
  const [localMinutes, setLocalMinutes] = useState(0);
  const [localSeconds, setLocalSeconds] = useState(0);
  const hoursInputRef = useRef<HTMLInputElement>(null);
  const minutesInputRef = useRef<HTMLInputElement>(null);
  const secondsInputRef = useRef<HTMLInputElement>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const focusCaptureVersionRef = useRef(0);

  const [currentPresetIndex, setCurrentPresetIndex] = useState(0);
  const totalPresets = PRESET_SECONDS.length;

  useEffect(() => {
    if (!running) {
      setFocusedRunningValue(null);
    } else if (focusedUnit) {
      const runningValues = {
        hours: localHours,
        minutes: localMinutes,
        seconds: localSeconds,
      };
      setFocusedRunningValue(runningValues[focusedUnit]);
    }
  }, [running]);

  // Sync local state with server state when stopped
  useEffect(() => {
    if (!running) {
      setLocalHours(serverHours);
      setLocalMinutes(serverMinutes);
      setLocalSeconds(serverSeconds);
    }
  }, [serverHours, serverMinutes, serverSeconds, running]);

  const syncTimeWithBackend = useCallback((h: number, m: number, s: number) => {
    let validSeconds = s;
    if (!stopwatch && h === 0 && m === 0 && s === 0) {
      validSeconds = 1;
    }

    const newTimeInMillis = (h * MILLI_IN_HOUR)
      + (m * MILLI_IN_MINUTE)
      + (validSeconds * MILLI_IN_SECOND);

    if (newTimeInMillis !== time) {
      timerSetTime({ variables: { time: newTimeInMillis } });
      if (isPaused) {
        timerReset();
      }
    }

    if (onSyncLocalTime) {
      onSyncLocalTime(h, m, validSeconds);
    }
  }, [time, timerSetTime, stopwatch, isPaused, timerReset, onSyncLocalTime]);

  const handleHoursChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value || '0', 10);
    if (Number.isNaN(value)) return;
    setLocalHours(Math.max(0, Math.min(value, MAX_HOURS)));
  };

  const handleHoursBlur = () => {
    setFocusedUnit(null);
    setSelectedUnit(null);
    setFocusedRunningValue(null);
    if (running) return;
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
      setLocalMinutes(Math.max(0, Math.min(value, 59)));
    }
  };

  const handleMinutesBlur = () => {
    setFocusedUnit(null);
    setSelectedUnit(null);
    setFocusedRunningValue(null);
    if (running) return;
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
      setLocalSeconds(Math.max(0, Math.min(value, 59)));
    }
  };

  const handleSecondsBlur = () => {
    setFocusedUnit(null);
    setSelectedUnit(null);
    setFocusedRunningValue(null);
    if (running) return;
    syncTimeWithBackend(localHours, localMinutes, localSeconds);
  };

  const handleInputFocus = (unit: 'hours' | 'minutes' | 'seconds', value: number) => {
    focusCaptureVersionRef.current += 1;
    setFocusedUnit(unit);
    setSelectedUnit(unit);
    setFocusedRunningValue(running ? value : null);
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

  const nextPreset = useCallback(() => {
    setCurrentPresetIndex(getNextPresetIndex(currentPresetIndex, totalPresets));
  }, [currentPresetIndex, totalPresets]);

  const prevPreset = useCallback(() => {
    setCurrentPresetIndex(getPrevPresetIndex(currentPresetIndex, totalPresets));
  }, [currentPresetIndex, totalPresets]);

  const visiblePresets = useMemo(
    () => getVisiblePresets(currentPresetIndex, PRESET_SECONDS),
    [currentPresetIndex, PRESET_SECONDS],
  );

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
    setSelectedUnit(unit);
    const focusCaptureVersion = focusCaptureVersionRef.current;

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      syncTimeWithBackend(newHours, newMinutes, newSeconds);
      if (focusCaptureVersionRef.current === focusCaptureVersion) setSelectedUnit(null);
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
    setSelectedUnit(unit);
    const focusCaptureVersion = focusCaptureVersionRef.current;

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      syncTimeWithBackend(newHours, newMinutes, newSeconds);
      if (focusCaptureVersionRef.current === focusCaptureVersion) setSelectedUnit(null);
      syncTimeoutRef.current = null;
    }, 1000);
  }, [running, localHours, localMinutes, localSeconds, syncTimeWithBackend]);

  if (stopwatch) {
    return (
      <Styled.TimerCurrent
        aria-hidden
        data-test="stopwatchCurrent"
      >
        {humanizeSeconds(Math.floor(timePassed / 1000))}
      </Styled.TimerCurrent>
    );
  }

  const displayedHours = running ? serverHours : localHours;
  const displayedMinutes = running ? serverMinutes : localMinutes;
  const displayedSeconds = running ? serverSeconds : localSeconds;
  const exposedHours = focusedUnit === 'hours' && focusedRunningValue !== null
    ? focusedRunningValue : displayedHours;
  const exposedMinutes = focusedUnit === 'minutes' && focusedRunningValue !== null
    ? focusedRunningValue : displayedMinutes;
  const exposedSeconds = focusedUnit === 'seconds' && focusedRunningValue !== null
    ? focusedRunningValue : displayedSeconds;

  return (
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
              aria-label={intl.formatMessage(intlMessages.hoursAriaLabel)}
              aria-valuetext={String(exposedHours)}
              aria-disabled={running}
              type="number"
              readOnly={running}
              value={String(exposedHours).padStart(2, '0')}
              max={MAX_HOURS}
              min="0"
              step="1"
              onChange={handleHoursChange}
              onBlur={handleHoursBlur}
              onFocus={() => handleInputFocus('hours', displayedHours)}
              ref={hoursInputRef}
              data-test="timerHoursInput"
              isSelected={!running && selectedUnit === 'hours'}
              tabIndex={0}
            />
            <Styled.InputArrows disabled={running} aria-hidden={running} isSelected={!running && selectedUnit === 'hours'}>
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
                isSelected={!running && selectedUnit === 'hours'}
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
                isSelected={!running && selectedUnit === 'hours'}
              />
            </Styled.InputArrows>
            <Styled.TimeUnitLabel>
              {intl.formatMessage(intlMessages.hours)}
            </Styled.TimeUnitLabel>
          </Styled.TimeUnitContainer>
          <Styled.TimeUnitContainer>
            <Styled.TimerInput
              aria-label={intl.formatMessage(intlMessages.minutesAriaLabel)}
              aria-valuetext={String(exposedMinutes)}
              aria-disabled={running}
              type="number"
              readOnly={running}
              value={String(exposedMinutes).padStart(2, '0')}
              max="59"
              min="0"
              step="1"
              onChange={handleMinutesChange}
              onBlur={handleMinutesBlur}
              onFocus={() => handleInputFocus('minutes', displayedMinutes)}
              ref={minutesInputRef}
              data-test="timerMinutesInput"
              isSelected={!running && selectedUnit === 'minutes'}
              tabIndex={0}
            />
            <Styled.InputArrows disabled={running} aria-hidden={running} isSelected={!running && selectedUnit === 'minutes'}>
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
                isSelected={!running && selectedUnit === 'minutes'}
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
                isSelected={!running && selectedUnit === 'minutes'}
              />
            </Styled.InputArrows>
            <Styled.TimeUnitLabel>
              {intl.formatMessage(intlMessages.minutes)}
            </Styled.TimeUnitLabel>
          </Styled.TimeUnitContainer>
          <Styled.TimeUnitContainer>
            <Styled.TimerInput
              aria-label={intl.formatMessage(intlMessages.secondsAriaLabel)}
              aria-valuetext={String(exposedSeconds)}
              aria-disabled={running}
              type="number"
              readOnly={running}
              value={String(exposedSeconds).padStart(2, '0')}
              max="59"
              min="0"
              step="1"
              onChange={handleSecondsChange}
              onBlur={handleSecondsBlur}
              onFocus={() => handleInputFocus('seconds', displayedSeconds)}
              ref={secondsInputRef}
              data-test="timerSecondsInput"
              isSelected={!running && selectedUnit === 'seconds'}
              tabIndex={0}
            />
            <Styled.InputArrows disabled={running} aria-hidden={running} isSelected={!running && selectedUnit === 'seconds'}>
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
                isSelected={!running && selectedUnit === 'seconds'}
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
                isSelected={!running && selectedUnit === 'seconds'}
              />
            </Styled.InputArrows>
            <Styled.TimeUnitLabel>
              {intl.formatMessage(intlMessages.seconds)}
            </Styled.TimeUnitLabel>
          </Styled.TimeUnitContainer>
        </Styled.TimeInputGroup>
        <Styled.TimerAddsRow>
          {QUICK_ADD_BUTTONS.map((addSeconds) => {
            const testId = `add${addSeconds}s`;
            const timeLabel = addSeconds >= 60
              ? `${Math.floor(addSeconds / 60)} minute${Math.floor(addSeconds / 60) > 1 ? 's' : ''}`
              : `${addSeconds} second${addSeconds > 1 ? 's' : ''}`;

            const h = Math.floor(addSeconds / 3600);
            const m = Math.floor((addSeconds % 3600) / 60);
            const s = addSeconds % 60;
            const fmt = (n: number) => (n < 10 ? `0${n}` : n.toString());
            const displayLabel = h > 0
              ? `+${fmt(h)}:${fmt(m)}:${fmt(s)}`
              : `+${fmt(m)}:${fmt(s)}`;
            const tooltipMessage = intl.formatMessage(intlMessages.addTime, { time: timeLabel });

            return (
              <TooltipContainer
                key={testId}
                title={tooltipMessage}
              >
                <Styled.TimerAddButton
                  onClick={() => changeTime(addSeconds)}
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
    </>
  );
};

const TimerTimeSection = React.memo(TimerTimeSectionComponent);
TimerTimeSection.displayName = 'TimerTimeSection';

export default TimerTimeSection;
