import React, {
  useState, useCallback, useRef, useEffect,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import useTimeSync from '/imports/ui/core/local-states/useTimeSync';
import Styled from '../running-room/styles';
import { BREAKOUT_ROOM_SET_TIME } from '../../mutations';

const DEBOUNCE_DELAY = 1500;

const intlMessages = defineMessages({
  durationOfBreakout: {
    id: 'app.createBreakoutRoom.durationOfBreakout',
    description: 'Duration of Breakout Rooms label',
  },
  timerHours: {
    id: 'app.createBreakoutRoom.timerHours',
    description: 'Timer hours field label',
  },
  timerMinutes: {
    id: 'app.createBreakoutRoom.timerMinutes',
    description: 'Timer minutes field label',
  },
  timerSeconds: {
    id: 'app.createBreakoutRoom.timerSeconds',
    description: 'Timer seconds field label',
  },
  decreaseBreakoutTime: {
    id: 'app.createBreakoutRoom.decreaseBreakoutTime',
    description: 'Decrease breakout time button label',
  },
  increaseBreakoutTime: {
    id: 'app.createBreakoutRoom.increaseBreakoutTime',
    description: 'Increase breakout time button label',
  },
});

interface BreakoutTimerEditorProps {
  breakoutDurationInSeconds: number;
  breakoutStartedAt: number;
}

const BreakoutTimerEditorComponent: React.FC<BreakoutTimerEditorProps> = ({
  breakoutDurationInSeconds, breakoutStartedAt,
}) => {
  const intl = useIntl();
  const [timeSync] = useTimeSync();
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const innerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedTimerField, setSelectedTimerField] = useState<'h' | 'm' | 's'>('m');
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [editingTime, setEditingTime] = useState<number | null>(null);
  const [breakoutRoomSetTime] = useMutation(BREAKOUT_ROOM_SET_TIME);

  useEffect(() => {
    const calcRemaining = () => {
      if (!Number.isFinite(breakoutStartedAt) || breakoutStartedAt === 0
          || !Number.isFinite(breakoutDurationInSeconds)) {
        return 0;
      }
      const now = Date.now() + timeSync;
      const end = breakoutStartedAt + (breakoutDurationInSeconds * 1000);
      return Math.max(0, Math.floor((end - now) / 1000));
    };

    if (editingTime === null) {
      setRemainingTime(calcRemaining());
    }

    timerIntervalRef.current = setInterval(() => {
      if (editingTime === null) {
        setRemainingTime(calcRemaining());
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [breakoutDurationInSeconds, breakoutStartedAt, timeSync, editingTime]);

  useEffect(() => () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (innerTimerRef.current) clearTimeout(innerTimerRef.current);
  }, []);

  const displayedTime = editingTime ?? remainingTime;
  const hours = Math.floor(displayedTime / 3600);
  const minutes = Math.floor((displayedTime % 3600) / 60);
  const seconds = displayedTime % 60;
  const padNum = (n: number) => n.toString().padStart(2, '0');

  const commitTimeChange = useCallback((newTotalSeconds: number) => {
    const clamped = Math.max(60, newTotalSeconds);
    setEditingTime(clamped);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      breakoutRoomSetTime({ variables: { timeInSeconds: clamped } });
      if (innerTimerRef.current) clearTimeout(innerTimerRef.current);
      innerTimerRef.current = setTimeout(() => setEditingTime(null), 500);
    }, DEBOUNCE_DELAY);
  }, [breakoutRoomSetTime]);

  const adjustTime = useCallback((deltaSeconds: number) => {
    const base = editingTime ?? remainingTime;
    commitTimeChange(base + deltaSeconds);
  }, [editingTime, remainingTime, commitTimeChange]);

  const handleTimerInputChange = useCallback((
    field: 'h' | 'm' | 's',
    value: number,
  ) => {
    const newH = field === 'h' ? Math.max(0, Math.min(23, value)) : hours;
    const newM = field === 'm' ? Math.max(0, Math.min(59, value)) : minutes;
    const newS = field === 's' ? Math.max(0, Math.min(59, value)) : seconds;
    const totalSeconds = (newH * 3600) + (newM * 60) + newS;
    commitTimeChange(totalSeconds);
  }, [hours, minutes, seconds, commitTimeChange]);

  return (
    <Styled.TimerSection>
      <Styled.TimerLabel>
        {intl.formatMessage(intlMessages.durationOfBreakout)}
      </Styled.TimerLabel>
      <Styled.TimeInputGroup data-test="breakoutRemainingTime">
        <Styled.TimeUnitContainer>
          <Styled.TimerInput
            type="number"
            min={0}
            max={23}
            value={padNum(hours)}
            $selected={selectedTimerField === 'h'}
            onClick={() => setSelectedTimerField('h')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleTimerInputChange('h', Number(e.target.value));
            }}
            aria-label={intl.formatMessage(intlMessages.timerHours)}
            data-test="breakoutRoomTimerHoursInput"
          />
          <Styled.InputArrows $selected={selectedTimerField === 'h'}>
            <Styled.InputArrowButton
              type="button"
              onClick={() => adjustTime(3600)}
              aria-label={intl.formatMessage(intlMessages.increaseBreakoutTime)}
            />
            <Styled.InputArrowButtonDown
              type="button"
              onClick={() => adjustTime(-3600)}
              aria-label={intl.formatMessage(intlMessages.decreaseBreakoutTime)}
            />
          </Styled.InputArrows>
          <Styled.TimeUnitLabel>
            {intl.formatMessage(intlMessages.timerHours)}
          </Styled.TimeUnitLabel>
        </Styled.TimeUnitContainer>
        <Styled.TimeUnitContainer>
          <Styled.TimerInput
            type="number"
            min={0}
            max={59}
            value={padNum(minutes)}
            $selected={selectedTimerField === 'm'}
            onClick={() => setSelectedTimerField('m')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleTimerInputChange('m', Number(e.target.value));
            }}
            aria-label={intl.formatMessage(intlMessages.timerMinutes)}
            data-test="breakoutRoomTimerMinutesInput"
          />
          <Styled.InputArrows $selected={selectedTimerField === 'm'}>
            <Styled.InputArrowButton
              type="button"
              onClick={() => adjustTime(60)}
              aria-label={intl.formatMessage(intlMessages.increaseBreakoutTime)}
              data-test="increaseBreakoutTimeButton"
            />
            <Styled.InputArrowButtonDown
              type="button"
              onClick={() => adjustTime(-60)}
              aria-label={intl.formatMessage(intlMessages.decreaseBreakoutTime)}
              data-test="decreaseBreakoutTimeButton"
            />
          </Styled.InputArrows>
          <Styled.TimeUnitLabel>
            {intl.formatMessage(intlMessages.timerMinutes)}
          </Styled.TimeUnitLabel>
        </Styled.TimeUnitContainer>
        <Styled.TimeUnitContainer>
          <Styled.TimerInput
            type="number"
            min={0}
            max={59}
            value={padNum(seconds)}
            $selected={selectedTimerField === 's'}
            onClick={() => setSelectedTimerField('s')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleTimerInputChange('s', Number(e.target.value));
            }}
            aria-label={intl.formatMessage(intlMessages.timerSeconds)}
            data-test="breakoutRoomTimerSecondsInput"
          />
          <Styled.InputArrows $selected={selectedTimerField === 's'}>
            <Styled.InputArrowButton
              type="button"
              onClick={() => adjustTime(1)}
              aria-label={intl.formatMessage(intlMessages.increaseBreakoutTime)}
            />
            <Styled.InputArrowButtonDown
              type="button"
              onClick={() => adjustTime(-1)}
              aria-label={intl.formatMessage(intlMessages.decreaseBreakoutTime)}
            />
          </Styled.InputArrows>
          <Styled.TimeUnitLabel>
            {intl.formatMessage(intlMessages.timerSeconds)}
          </Styled.TimeUnitLabel>
        </Styled.TimeUnitContainer>
      </Styled.TimeInputGroup>
    </Styled.TimerSection>
  );
};

const BreakoutTimerEditor = React.memo(BreakoutTimerEditorComponent);
BreakoutTimerEditor.displayName = 'BreakoutTimerEditor';

export default BreakoutTimerEditor;
