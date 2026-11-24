import { useMutation } from '@apollo/client';
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import cx from 'classnames';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';
import humanizeSeconds from '/imports/utils/humanizeSeconds';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { layoutSelectInput } from '../../layout/context';
import { Input } from '../../layout/layoutTypes';
import { TIMER_START, TIMER_STOP } from '../mutations';
import useTimer from '/imports/ui/core/hooks/useTimer';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import logger from '/imports/startup/client/logger';

const intlMessages = defineMessages({
  muteMusic: {
    id: 'app.timer.muteMusic',
    description: 'Label of the button that mutes the timer music for the current user only',
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
  const timeRef = useRef<HTMLSpanElement>(null);
  const alarm = useRef<HTMLAudioElement>();
  const music = useRef<HTMLAudioElement>();
  const triggered = useRef<boolean>(true);
  const alreadyNotified = useRef<boolean>(false);
  const [startTimerMutation] = useMutation(TIMER_START);
  const [stopTimerMutation] = useMutation(TIMER_STOP);
  // Each participant can silence the music on their own device; nothing is sent to the server
  const [musicMuted, setMusicMuted] = useState<boolean>(false);
  const prevElapsed = usePreviousValue<boolean | undefined>(elapsed);
  const intl = useIntl();

  const CDN = window.meetingClientSettings.public.app.cdn;
  const BASENAME = window.meetingClientSettings.public.app.basename;
  const HOST = CDN + BASENAME;
  const trackName = window.meetingClientSettings.public.timer.music;
  const MUSIC_VOLUME = window.meetingClientSettings.public.timer.music.volume;

  type ObjectKey = keyof typeof trackName;

  const hasMusicTrack = songTrack !== 'noTrack' && songTrack in trackName;
  const isMusicPlaying = running && hasMusicTrack;

  const startTimer = () => {
    startTimerMutation();
  };

  const stopTimer = () => {
    stopTimerMutation();
  };

  const toggleMusicMuted = useCallback(() => {
    setMusicMuted((muted) => !muted);
  }, []);

  useEffect(() => {
    if (!hasMusicTrack) {
      music.current = undefined;
      return undefined;
    }
    const audio = new Audio(`${HOST}/resources/sounds/${trackName[songTrack as ObjectKey]}.mp3`);
    audio.volume = MUSIC_VOLUME;
    audio.addEventListener('timeupdate', () => {
      const buffer = 0.19;
      // Start playing the music before it ends to make the loop gapless
      if (audio.currentTime > audio.duration - buffer) {
        audio.currentTime = 0;
        audio.play();
      }
    });
    music.current = audio;

    return () => {
      audio.pause();
      if (music.current === audio) music.current = undefined;
    };
  }, [songTrack]);

  // Declared after the effect above, so a track change mid-run creates the new track before it plays
  useEffect(() => {
    if (!music.current) return;
    if (isMusicPlaying && !musicMuted) {
      music.current.play().catch((error) => {
        logger.warn({
          logCode: 'timer_music_play_failed',
          extraInfo: { errorName: error?.name, errorMessage: error?.message },
        }, `Timer music could not be played: ${error?.message}`);
      });
    } else {
      music.current.pause();
    }
  }, [isMusicPlaying, musicMuted, songTrack]);

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
    if (running && alreadyNotified.current) {
      alreadyNotified.current = false;
    }
  }, [running]);

  const onClick = running ? stopTimer : startTimer;

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
              {humanizeSeconds(Math.floor(timePassed / 1000))}
            </Styled.TimerTime>
          </Styled.TimerContent>
        </Styled.TimerButton>
        {isMusicPlaying && (
          <TooltipContainer title={intl.formatMessage(intlMessages.muteMusic)}>
            <Styled.MusicMuteButton
              type="button"
              aria-pressed={musicMuted}
              aria-label={intl.formatMessage(intlMessages.muteMusic)}
              onClick={toggleMusicMuted}
              className="bbb-timer-indicator__music-mute-button"
              data-test="timerMusicMuteButton"
            >
              <Icon iconName={musicMuted ? 'no_audio' : 'volume_level_2'} />
            </Styled.MusicMuteButton>
          </TooltipContainer>
        )}
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
