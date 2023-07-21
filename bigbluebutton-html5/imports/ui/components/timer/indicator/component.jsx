import React, { Component } from 'react';
import Icon from '/imports/ui/components/common/icon/component';
import TimerService from '/imports/ui/components/timer/service';
import logger from '/imports/startup/client/logger';
import PropTypes from 'prop-types';
import Styled from './styles';

const CDN = Meteor.settings.public.app.cdn;
const BASENAME = Meteor.settings.public.app.basename;
const HOST = CDN + BASENAME;
const trackName = Meteor.settings.public.timer.music;
const TAB_TIMER_INDICATOR = Meteor.settings.public.timer.tabIndicator;

const propTypes = {
  timer: PropTypes.shape({
    stopwatch: PropTypes.bool,
    running: PropTypes.bool,
    time: PropTypes.number,
    accumulated: PropTypes.number,
    timestamp: PropTypes.number,
  }).isRequired,
  isTimerActive: PropTypes.bool.isRequired,
  isMusicActive: PropTypes.bool.isRequired,
  sidebarNavigationIsOpen: PropTypes.bool.isRequired,
  sidebarContentIsOpen: PropTypes.bool.isRequired,
  timeOffset: PropTypes.number.isRequired,
  isModerator: PropTypes.bool.isRequired,
  currentTrack: PropTypes.bool.isRequired,
};

class Indicator extends Component {
  constructor(props) {
    super(props);

    this.timeRef = React.createRef();
    this.interval = null;

    this.alarm = null;
    this.music = null;

    // We need to avoid trigger on mount
    this.triggered = true;

    this.alreadyNotified = false;

    this.updateTime = this.updateTime.bind(this);
  }

  componentDidMount() {
    const { timer } = this.props;
    const { running } = timer;

    this.alarm = new Audio(`${HOST}/resources/sounds/alarm.mp3`);
    this.setUpMusic();

    this.triggered = this.initTriggered();

    const { current } = this.timeRef;
    if (current && running) {
      this.interval = setInterval(this.updateTime, TimerService.getInterval());
    }
  }

  componentDidUpdate(prevProps) {
    const { timer, isTimerActive } = this.props;
    const { timer: prevTimer, isTimerActive: prevTimerActive } = prevProps;

    if (this.shouldPlayMusic()) {
      this.playMusic();
    }

    if (!isTimerActive && prevTimerActive) {
      this.updateTabTitleTimer(true, this.getTime());
    }

    this.updateInterval(prevTimer, timer);
    this.updateAlarmTrigger(prevTimer, timer);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    this.stopMusic();
  }

  getTime() {
    const {
      timer,
      timeOffset,
    } = this.props;

    const {
      stopwatch,
      running,
      time,
      accumulated,
      timestamp,
    } = timer;

    const elapsedTime = TimerService.getElapsedTime(running, timestamp, timeOffset, accumulated);

    let updatedTime;
    if (stopwatch) {
      updatedTime = elapsedTime;
    } else {
      updatedTime = Math.max(time - elapsedTime, 0);
    }

    if (this.shouldNotifyTimerEnded(updatedTime)) {
      TimerService.timerEnded();
    }

    if (this.shouldStopMusic(updatedTime)) {
      this.stopMusic();
    }

    if (this.soundAlarm(updatedTime)) {
      this.play();
    }

    return TimerService.getTimeAsString(updatedTime, stopwatch);
  }

  setUpMusic() {
    const { currentTrack } = this.props;
    if (trackName[currentTrack] === undefined) return;
    if (this.music === null) {
      this.music = new Audio(`${HOST}/resources/sounds/${trackName[currentTrack]}.mp3`);
      this.music.volume = TimerService.getMusicVolume();
      this.music.addEventListener('timeupdate', () => {
        const buffer = 0.19;
        // Start playing the music before it ends to make the loop gapless
        if (this.music.currentTime > this.music.duration - buffer) {
          this.music.currentTime = 0;
          this.music.play();
        }
      });
    } else {
      this.music.src = `${HOST}/resources/sounds/${trackName[currentTrack]}.mp3`;
    }
    this.music.track = currentTrack;
  }

  updateInterval(prevTimer, timer) {
    const { running } = timer;
    const { running: prevRunning } = prevTimer;

    if (!prevRunning && running) {
      this.interval = setInterval(this.updateTime, TimerService.getInterval());
    }

    if (prevRunning && !running) {
      clearInterval(this.interval);
    }
  }

  updateAlarmTrigger(prevTimer, timer) {
    const {
      accumulated,
      timestamp,
    } = timer;

    const { timestamp: prevTimestamp } = prevTimer;

    const reseted = timestamp !== prevTimestamp && accumulated === 0;

    if (reseted) {
      this.triggered = false;
      this.alreadyNotified = false;
    }
  }

  initTriggered() {
    const {
      timer,
      timeOffset,
    } = this.props;

    const {
      stopwatch,
      running,
    } = timer;

    if (stopwatch || !running) return false;

    const {
      time,
      accumulated,
      timestamp,
    } = timer;

    const elapsedTime = TimerService.getElapsedTime(running, timestamp, timeOffset, accumulated);
    const updatedTime = Math.max(time - elapsedTime, 0);

    if (updatedTime === 0) return true;

    return false;
  }

  play() {
    if (this.alarm && !this.triggered) {
      this.triggered = true;
      this.alarm.play().catch((error) => {
        logger.error({
          logCode: 'timer_sound_error',
          extraInfo: { error },
        }, `Timer beep failed: ${error}`);
      });
    }
  }

  soundAlarm(time) {
    const { timer } = this.props;
    const {
      running,
      stopwatch,
    } = timer;

    const enabled = TimerService.isAlarmEnabled();
    const zero = time === 0;

    return enabled && running && zero && !stopwatch;
  }

  playMusic() {
    const handleUserInteraction = () => {
      this.music.play();
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('auxclick', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };

    const playMusicAfterUserInteraction = () => {
      window.addEventListener('click', handleUserInteraction);
      window.addEventListener('auxclick', handleUserInteraction);
      window.addEventListener('keydown', handleUserInteraction);
      window.addEventListener('touchstart', handleUserInteraction);
    };

    this.handleUserInteraction = handleUserInteraction;

    if (this.music !== null) {
      this.music.play()
        .catch((error) => {
          if (error.name === 'NotAllowedError') {
            playMusicAfterUserInteraction();
          }
        });
    }
  }

  stopMusic() {
    if (this.music !== null) {
      this.music.pause();
      this.music.currentTime = 0;
      window.removeEventListener('click', this.handleUserInteraction);
      window.removeEventListener('auxclick', this.handleUserInteraction);
      window.removeEventListener('keydown', this.handleUserInteraction);
      window.removeEventListener('touchstart', this.handleUserInteraction);
    }
  }

  shouldPlayMusic() {
    const {
      timer,
      isMusicActive,
    } = this.props;

    const {
      running,
      stopwatch,
    } = timer;
    const validMusic = this.music != null;
    if (!validMusic) return false;

    const musicIsPlaying = !this.music.paused;

    return !musicIsPlaying && isMusicActive && running && !stopwatch;
  }

  shouldStopMusic(time) {
    const {
      timer,
      isTimerActive,
      isMusicActive,
      currentTrack,
    } = this.props;

    const {
      running,
      stopwatch,
    } = timer;

    const zero = time === 0;
    const validMusic = this.music != null;
    const musicIsPlaying = validMusic && !this.music.paused;
    const trackChanged = this.music?.track !== currentTrack;

    const reachedZeroOrStopped = (running && zero) || (!running);

    return musicIsPlaying
      && (!isMusicActive || stopwatch || reachedZeroOrStopped || !isTimerActive || trackChanged);
  }

  shouldNotifyTimerEnded(time) {
    const { timer } = this.props;
    const {
      running,
      stopwatch,
    } = timer;

    if (stopwatch || !running) return false;

    const reachedZero = time === 0;

    if (reachedZero && !this.alreadyNotified) {
      this.alreadyNotified = true;
      return true;
    }
    return false;
  }

  updateTime() {
    const { current } = this.timeRef;
    if (current) {
      current.textContent = this.getTime();
      this.updateTabTitleTimer(false, current.textContent);
    }
  }

  updateTabTitleTimer(deactivation, timeString) {
    if (!TAB_TIMER_INDICATOR) return;

    const matchTimerString = /\[[0-9][0-9]:[0-9][0-9]:[0-9][0-9]\]/g;

    if (deactivation) {
      document.title = document.title.replace(matchTimerString, '');
    } else {
      if (RegExp(matchTimerString).test(document.title)) {
        document.title = document.title.replace(matchTimerString, '');
        document.title = '[' + timeString + '] ' + document.title;
      } else {
        document.title = '[' + timeString + '] ' + document.title;
      }
    }
  }

  render() {
    const { isTimerActive } = this.props;
    const time = this.getTime();
    if (!isTimerActive) return null;

    const {
      isModerator,
      timer,
      sidebarNavigationIsOpen,
      sidebarContentIsOpen,
      currentTrack,
    } = this.props;
    const { running } = timer;
    const trackChanged = this.music?.track !== currentTrack;
    if (trackChanged) {
      this.setUpMusic();
    }

    const onClick = running ? TimerService.stopTimer : TimerService.startTimer;
    this.updateTabTitleTimer(false, time);
    return (
      <Styled.TimerWrapper>
        <Styled.Timer>
          <Styled.TimerButton
            running={running}
            disabled={!isModerator}
            hide={sidebarNavigationIsOpen && sidebarContentIsOpen}
            role="button"
            tabIndex={0}
            onClick={isModerator ? onClick : null}
          >
            <Styled.TimerContent>
              <Styled.TimerIcon>
                <Icon iconName="time" />
              </Styled.TimerIcon>
              <Styled.TimerTime
                aria-hidden
                ref={this.timeRef}
              >
                {time}
              </Styled.TimerTime>
            </Styled.TimerContent>
          </Styled.TimerButton>
        </Styled.Timer>
      </Styled.TimerWrapper>
    );
  }
}

Indicator.propTypes = propTypes;

export default Indicator;
