import { useMutation } from '@apollo/client';
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';
import humanizeSeconds from '/imports/utils/humanizeSeconds';
import useTimeSync from '/imports/ui/core/local-states/useTimeSync';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { layoutSelectInput } from '../../layout/context';
import { Input } from '../../layout/layoutTypes';
import { TIMER_START, TIMER_STOP } from '../mutations';
import useTimer from '/imports/ui/core/hooks/useTImer';

const useTimerLogic = (initialTime: number, isRunning: boolean, isStopwatch: boolean) => {
  const [time, setTime] = useState(initialTime);
  const startTimeRef = useRef(Date.now());
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (isRunning) {
      const updateTimer = () => {
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        const newTime = isStopwatch
          ? initialTime + elapsed
          : Math.max(0, initialTime - elapsed);

        setTime(newTime);
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      };

      startTimeRef.current = Date.now();
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setTime(initialTime);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [initialTime, isRunning, isStopwatch]);

  return time;
};

interface TimerIndicatorProps {
  passedTime: number;
  stopwatch: boolean;
  songTrack: string;
  running: boolean;
  isModerator: boolean;
  sidebarNavigationIsOpen: boolean;
  sidebarContentIsOpen: boolean;
  startedOn: number;
}

const TimerIndicator: React.FC<TimerIndicatorProps> = ({
  passedTime,
  stopwatch,
  songTrack,
  running,
  isModerator,
  sidebarNavigationIsOpen,
  sidebarContentIsOpen,
  // It is used in the container
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  startedOn,
}) => {
  const [startTimerMutation] = useMutation(TIMER_START);
  const [stopTimerMutation] = useMutation(TIMER_STOP);

  const time = useTimerLogic(passedTime, running, stopwatch);

  const CDN = window.meetingClientSettings.public.app.cdn;
  const BASENAME = window.meetingClientSettings.public.app.basename;
  const HOST = useMemo(() => CDN + BASENAME, [CDN, BASENAME]);
  const trackName = window.meetingClientSettings.public.timer.music;

  const startTimer = useCallback(() => {
    startTimerMutation();
  }, [startTimerMutation]);

  const stopTimer = useCallback(() => {
    stopTimerMutation();
  }, [stopTimerMutation]);

  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    if (songTrack in trackName) {
      audio = new Audio(`${HOST}/resources/sounds/${trackName[songTrack as keyof typeof trackName]}.mp3`);
      if (running) {
        audio.play().catch(() => { });
      }
    }
    return () => {
      if (audio) {
        audio.pause();
        audio = null;
      }
    };
  }, [songTrack, running, HOST]);

  const onClick = useCallback(() => {
    if (isModerator) {
      if (running) {
        stopTimer();
      } else {
        startTimer();
      }
    }
  }, [isModerator, running, stopTimer, startTimer]);

  const displayTime = useMemo(() => humanizeSeconds(Math.floor(time / 1000)), [time]);

  return (
    <Styled.TimerWrapper>
      <Styled.Timer>
        <Styled.TimerButton
          running={running}
          disabled={!isModerator}
          hide={sidebarNavigationIsOpen && sidebarContentIsOpen}
          role="button"
          tabIndex={0}
          onClick={onClick}
          data-test="timeIndicator"
        >
          <Styled.TimerContent>
            <Styled.TimerIcon>
              <Icon iconName="time" />
            </Styled.TimerIcon>
            <Styled.TimerTime aria-hidden>
              {displayTime}
            </Styled.TimerTime>
          </Styled.TimerContent>
        </Styled.TimerButton>
      </Styled.Timer>
    </Styled.TimerWrapper>
  );
};

const TimerIndicatorContainer: React.FC = () => {
  const { data: currentUser } = useCurrentUser((u) => ({
    isModerator: u.isModerator,
  }));

  const { data: timerData } = useTimer();

  const [timeSync] = useTimeSync();

  const sidebarNavigation = layoutSelectInput((i: Input) => i.sidebarNavigation);
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const sidebarNavigationIsOpen = sidebarNavigation.isOpen;
  const sidebarContentIsOpen = sidebarContent.isOpen;

  const currentTimer = timerData;
  if (!currentTimer?.active) return null;

  const {
    accumulated,
    running,
    startedOn,
    stopwatch,
    songTrack,
    time,
  } = currentTimer;
  const currentDate: Date = new Date();
  const startedAtDate: Date = new Date(startedOn || Date.now());
  const adjustedCurrent: Date = new Date(currentDate.getTime() + timeSync);
  const timeDifferenceMs: number = adjustedCurrent.getTime() - startedAtDate.getTime();

  const timePassed = stopwatch ? (
    Math.floor(((running ? timeDifferenceMs : 0) + (accumulated ?? 0)))
  ) : (
    Math.floor(((time ?? 0) - ((accumulated ?? 0) + (running ? timeDifferenceMs : 0))))
  );

  return (
    <TimerIndicator
      passedTime={timePassed}
      stopwatch={stopwatch ?? false}
      songTrack={songTrack ?? 'noTrack'}
      running={running ?? false}
      isModerator={currentUser?.isModerator ?? false}
      sidebarNavigationIsOpen={sidebarNavigationIsOpen}
      sidebarContentIsOpen={sidebarContentIsOpen}
      startedOn={startedOn ?? 0}
    />
  );
};

export default TimerIndicatorContainer;
