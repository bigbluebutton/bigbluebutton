import { useSubscription, useMutation } from '@apollo/client';
import React, { useEffect, useRef, useState } from 'react';
import GET_TIMER, { GetTimerResponse } from '../queries';
import logger from '/imports/startup/client/logger';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';
import humanizeSeconds from '/imports/utils/humanizeSeconds';
import useTimeSync from '/imports/ui/core/local-states/useTimeSync';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { layoutSelectInput } from '../../../layout/context';
import { Input } from '../../../layout/layoutTypes';
import { TIMER_START, TIMER_STOP } from '../../mutations';

const CDN = window.meetingClientSettings.public.app.cdn;
const BASENAME = window.meetingClientSettings.public.app.basename;
const HOST = CDN + BASENAME;
const trackName = window.meetingClientSettings.public.timer.music;

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

type ObjectKey = keyof typeof trackName;

const TimerIndicator: React.FC<TimerIndicatorProps> = ({
  passedTime,
  stopwatch,
  songTrack,
  running,
  isModerator,
  sidebarNavigationIsOpen,
  sidebarContentIsOpen,
  startedOn,
}) => {
  const [time, setTime] = useState<number>(0);
  const timeRef = useRef<HTMLSpanElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const alarm = useRef<HTMLAudioElement>();
  const music = useRef<HTMLAudioElement>();
  const triggered = useRef<boolean>(true);
  const alreadyNotified = useRef<boolean>(false);
  const [startTimerMutation] = useMutation(TIMER_START);
  const [stopTimerMutation] = useMutation(TIMER_STOP);
  const [songTrackState, setSongTrackState] = useState<string>(songTrack);

  const startTimer = () => {
    startTimerMutation();
  };

  const stopTimer = () => {
    stopTimerMutation();
  };

  useEffect(() => {
    if (songTrackState !== songTrack) {
      if (music.current) music.current.pause();
    }
    if (songTrack in trackName) {
      music.current = new Audio(`${HOST}/resources/sounds/${trackName[songTrack as ObjectKey]}.mp3`);
      setSongTrackState(songTrack);
      music.current.addEventListener('timeupdate', () => {
        const buffer = 0.19;
        // Start playing the music before it ends to make the loop gapless
        if (!music.current) return null;
        if (music.current.currentTime > music.current.duration - buffer) {
          music.current.currentTime = 0;
          music.current.play();
        }
        return null;
      });
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (music.current) music.current.pause();
    };
  }, [songTrack]);

  useEffect(() => {
    setTime(passedTime);
  }, []);

  useEffect(() => {
    alarm.current = new Audio(`${HOST}/resources/sounds/alarm.mp3`);
  }, []);

  useEffect(() => {
    if (running) {
      setTime(passedTime);
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (stopwatch) return (Math.round(prev / 1000) * 1000) + 1000;
          const t = (Math.floor(prev / 1000) * 1000) - 1000;
          if (t <= 0) {
            if (!alreadyNotified.current) {
              triggered.current = false;
              alreadyNotified.current = true;
              if (alarm.current) alarm.current.play();
            }
          }
          return t < 0 ? 0 : t;
        });
      }, 1000);
    } else if (!running) {
      clearInterval(intervalRef.current);
    }
  }, [running]);

  useEffect(() => {
    if (!running) return;

    const timePassed = passedTime >= 0 ? passedTime : 0;

    setTime((prev) => {
      if (timePassed < prev) return timePassed;
      if (timePassed > prev) return timePassed;
      return prev;
    });
  }, [passedTime, stopwatch, startedOn]);

  useEffect(() => {
    if (!timeRef.current) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (music.current) music.current.pause();
      if (alarm.current) alarm.current.pause();
    }
  }, [time]);

  useEffect(() => {
    if (running && songTrack !== 'noTrack') {
      if (music.current) music.current.play();
    } else if (!running || songTrack === 'noTrack') {
      if (music.current) music.current.pause();
    }
    if (running && alreadyNotified.current) {
      alreadyNotified.current = false;
    }
  }, [running, songTrackState]);

  useEffect(() => {
    if (startedOn === 0) {
      setTime(passedTime);
    }
  }, [startedOn]);

  const onClick = running ? stopTimer : startTimer;

  return (
    <Styled.TimerWrapper>
      <Styled.Timer>
        <Styled.TimerButton
          running={running}
          disabled={!isModerator}
          hide={sidebarNavigationIsOpen && sidebarContentIsOpen}
          role="button"
          tabIndex={0}
          onClick={isModerator ? onClick : () => {}}
          data-test="timeIndicator"
        >
          <Styled.TimerContent>
            <Styled.TimerIcon>
              <Icon iconName="time" />
            </Styled.TimerIcon>
            <Styled.TimerTime
              aria-hidden
              ref={timeRef}
            >
              {humanizeSeconds(Math.floor(time / 1000))}
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

  const {
    loading: timerLoading,
    error: timerError,
    data: timerData,
  } = useSubscription<GetTimerResponse>(GET_TIMER);

  const [timeSync] = useTimeSync();

  const sidebarNavigation = layoutSelectInput((i: Input) => i.sidebarNavigation);
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const sidebarNavigationIsOpen = sidebarNavigation.isOpen;
  const sidebarContentIsOpen = sidebarContent.isOpen;

  if (timerLoading || !timerData || !currentUser) return null;

  if (timerError) {
    logger.error('TimerIndicatorContainer', timerError);
    return (<div>{JSON.stringify(timerError)}</div>);
  }

  const { timer } = timerData;
  const [currentTimer] = timer;
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
    Math.floor(((running ? timeDifferenceMs : 0) + accumulated))
  ) : (
    Math.floor(((time) - (accumulated + (running ? timeDifferenceMs : 0)))));

  return (
    <TimerIndicator
      passedTime={timePassed}
      stopwatch={stopwatch}
      songTrack={songTrack}
      running={running}
      isModerator={currentUser.isModerator ?? false}
      sidebarNavigationIsOpen={sidebarNavigationIsOpen}
      sidebarContentIsOpen={sidebarContentIsOpen}
      startedOn={startedOn}
    />
  );
};

export default TimerIndicatorContainer;
