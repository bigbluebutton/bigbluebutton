import { useSubscription } from '@apollo/client';
import React, { useEffect, useRef, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import GET_TIMER, { GetTimerResponse } from './queries';
import logger from '/imports/startup/client/logger';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';
import humanizeSeconds from '/imports/utils/humanizeSeconds';
import useTimeSync from '/imports/ui/core/local-states/useTimeSync';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { startTimer, stopTimer } from './service';
import { layoutSelectInput } from '../../../layout/context';
import { Input } from '../../../layout/layoutTypes';

const CDN = Meteor.settings.public.app.cdn;
const BASENAME = Meteor.settings.public.app.basename;
const HOST = CDN + BASENAME;
const trackName = Meteor.settings.public.timer.music;

interface TimerIndicatorProps {
  passedTime: number;
  stopwatch: boolean;
  songTrack: string;
  running: boolean;
  isModerator: boolean;
  sidebarNavigationIsOpen: boolean;
  sidebarContentIsOpen: boolean;
  startedAt: number;
}

const TimerIndicator: React.FC<TimerIndicatorProps> = ({
  passedTime,
  stopwatch,
  songTrack,
  running,
  isModerator,
  sidebarNavigationIsOpen,
  sidebarContentIsOpen,
  startedAt,
}) => {
  const [time, setTime] = useState<number>(0);
  const timeRef = useRef<HTMLSpanElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const alarm = useRef<HTMLAudioElement>();
  const music = useRef<HTMLAudioElement>();
  const triggered = useRef<boolean>(true);
  const alreadyNotified = useRef<boolean>(false);

  useEffect(() => {
    alarm.current = new Audio(`${HOST}/resources/sounds/alarm.mp3`);
    if (songTrack in trackName) {
      music.current = new Audio(`${HOST}/resources/sounds/${trackName[songTrack]}.mp3`);
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
    setTime((prev) => {
      if (passedTime < prev) return passedTime;
      if (passedTime > prev) return passedTime;
      return prev;
    });
  }, [passedTime, stopwatch]);

  useEffect(() => {
    if (!timeRef.current) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (music.current) music.current.pause();
      if (alarm.current) alarm.current.pause();
    }
  }, [time]);

  useEffect(() => {
    if (startedAt === 0) {
      setTime(passedTime);
    }
  }, [startedAt]);

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
  if (!currentTimer.active) return null;

  const {
    accumulated,
    running,
    startedAt,
    stopwatch,
    songTrack,
    time,
  } = currentTimer;
  const currentDate: Date = new Date();
  const startedAtDate: Date = new Date(startedAt || Date.now());
  const adjustedCurrent: Date = new Date(currentDate.getTime() + timeSync);
  const timeDifferenceMs: number = adjustedCurrent.getTime() - startedAtDate.getTime();

  const timePassed = stopwatch ? (
    Math.floor(((running ? timeDifferenceMs : 0) + accumulated))
  ) : (
    Math.floor(((time) - accumulated))
  );

  return (
    <TimerIndicator
      passedTime={timePassed >= 0 ? timePassed : 0}
      stopwatch={stopwatch}
      songTrack={songTrack}
      running={running}
      isModerator={currentUser.isModerator ?? false}
      sidebarNavigationIsOpen={sidebarNavigationIsOpen}
      sidebarContentIsOpen={sidebarContentIsOpen}
      startedAt={startedAt}
    />
  );
};

export default TimerIndicatorContainer;
