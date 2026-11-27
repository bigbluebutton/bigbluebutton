import { useMutation } from '@apollo/client';
import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';
import humanizeSeconds from '/imports/utils/humanizeSeconds';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { layoutSelectInput } from '../../layout/context';
import { Input } from '../../layout/layoutTypes';
import { TIMER_START, TIMER_STOP } from '../mutations';
import useTimer from '/imports/ui/core/hooks/useTimer';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';

const intlMessages = defineMessages({
  hoursSingular: {
    id: 'app.timer.aria.hoursSingular',
    description: 'Accessible timer duration in hours, singular',
  },
  hoursPlural: {
    id: 'app.timer.aria.hoursPlural',
    description: 'Accessible timer duration in hours, plural',
  },
  minutesSingular: {
    id: 'app.timer.aria.minutesSingular',
    description: 'Accessible timer duration in minutes, singular',
  },
  minutesPlural: {
    id: 'app.timer.aria.minutesPlural',
    description: 'Accessible timer duration in minutes, plural',
  },
  secondsSingular: {
    id: 'app.timer.aria.secondsSingular',
    description: 'Accessible timer duration in seconds, singular',
  },
  secondsPlural: {
    id: 'app.timer.aria.secondsPlural',
    description: 'Accessible timer duration in seconds, plural',
  },
});

interface TimerIndicatorProps {
  timePassed: number;
  songTrack: string;
  elapsed?: boolean;
  running: boolean;
  isModerator: boolean;
  sidebarNavigationIsOpen: boolean;
  sidebarContentIsOpen: boolean;
}

const TimerIndicator: React.FC<TimerIndicatorProps> = ({
  timePassed,
  songTrack,
  elapsed,
  running,
  isModerator,
  sidebarNavigationIsOpen,
  sidebarContentIsOpen,
}) => {
  const intl = useIntl();
  const timeRef = useRef<HTMLSpanElement>(null);
  const alarm = useRef<HTMLAudioElement>();
  const music = useRef<HTMLAudioElement>();
  const triggered = useRef<boolean>(true);
  const alreadyNotified = useRef<boolean>(false);
  const [startTimerMutation] = useMutation(TIMER_START);
  const [stopTimerMutation] = useMutation(TIMER_STOP);
  const [songTrackState, setSongTrackState] = useState<string>(songTrack);
  const prevElapsed = usePreviousValue<boolean | undefined>(elapsed);

  const CDN = window.meetingClientSettings.public.app.cdn;
  const BASENAME = window.meetingClientSettings.public.app.basename;
  const HOST = CDN + BASENAME;
  const trackName = window.meetingClientSettings.public.timer.music;
  const MUSIC_VOLUME = window.meetingClientSettings.public.timer.music.volume;

  type ObjectKey = keyof typeof trackName;

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
      music.current.volume = MUSIC_VOLUME;
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
      if (music.current) music.current.pause();
    };
  }, [songTrack]);

  useEffect(() => {
    alarm.current = new Audio(`${HOST}/resources/sounds/alarm.mp3`);
  }, []);

  useEffect(() => {
    // Prevent the alarm from triggering for users that join the conference
    // after the timer has elapsed. It only triggers for users that see the
    // elapsed property of timer change from false to true
    if (elapsed && prevElapsed === false) {
      if (!alreadyNotified.current) {
        triggered.current = false;
        alreadyNotified.current = true;
        if (alarm.current) alarm.current.play();
      }
    }
  }, [elapsed]);

  useEffect(() => {
    if (!timeRef.current) {
      if (music.current) music.current.pause();
      if (alarm.current) alarm.current.pause();
    }
  }, [timePassed]);

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

  const onClick = running ? stopTimer : startTimer;
  const timeInSeconds = Math.max(0, Math.floor(timePassed / 1000));
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;
  const timeParts = [
    hours > 0 && intl.formatMessage(
      hours === 1 ? intlMessages.hoursSingular : intlMessages.hoursPlural,
      { count: hours },
    ),
    minutes > 0 && intl.formatMessage(
      minutes === 1 ? intlMessages.minutesSingular : intlMessages.minutesPlural,
      { count: minutes },
    ),
    (seconds > 0 || timeInSeconds === 0) && intl.formatMessage(
      seconds === 1 ? intlMessages.secondsSingular : intlMessages.secondsPlural,
      { count: seconds },
    ),
  ].filter((part): part is string => Boolean(part));
  const accessibleTime = intl.formatList(timeParts, { type: 'unit' });

  return (
    <Styled.TimerWrapper
      className={cx('bbb-timer-indicator', { 'bbb-timer-indicator--running': running })}
    >
      <Styled.Timer>
        <Styled.TimerButton
          running={running}
          disabled={!isModerator}
          hide={sidebarNavigationIsOpen && sidebarContentIsOpen && !running}
          role="button"
          tabIndex={0}
          onClick={isModerator ? onClick : () => {}}
          className="bbb-timer-indicator__button"
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
              {humanizeSeconds(timeInSeconds)}
            </Styled.TimerTime>
          </Styled.TimerContent>
        </Styled.TimerButton>
        <span className="sr-only" data-test="timerIndicatorAccessibleTime">{accessibleTime}</span>
      </Styled.Timer>
    </Styled.TimerWrapper>
  );
};

const TimerIndicatorContainer: React.FC = () => {
  const { data: currentUser } = useCurrentUser((u) => ({
    isModerator: u.isModerator,
  }));

  const {
    data: timerData,
  } = useTimer(true);

  const sidebarNavigation = layoutSelectInput((i: Input) => i.sidebarNavigation);
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const sidebarNavigationIsOpen = sidebarNavigation.isOpen;
  const sidebarContentIsOpen = sidebarContent.isOpen;

  const currentTimer = timerData;
  if (!currentTimer?.active) return null;
  const {
    timePassed = 0,
    songTrack,
    elapsed,
    running,
  } = currentTimer;

  return (
    <TimerIndicator
      timePassed={timePassed}
      songTrack={songTrack}
      elapsed={elapsed}
      running={running}
      isModerator={currentUser?.isModerator ?? false}
      sidebarNavigationIsOpen={sidebarNavigationIsOpen}
      sidebarContentIsOpen={sidebarContentIsOpen}
    />
  );
};

export default TimerIndicatorContainer;
