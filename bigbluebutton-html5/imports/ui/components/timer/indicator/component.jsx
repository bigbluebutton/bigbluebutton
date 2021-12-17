import React, { Component } from 'react';
import Icon from '/imports/ui/components/common/icon/component';
import TimerService from '/imports/ui/components/timer/service';
import Styled from './styles';

const CDN = Meteor.settings.public.app.cdn;
const BASENAME = Meteor.settings.public.app.basename;
const HOST = CDN + BASENAME;
const trackName = Meteor.settings.public.timer.music.track;

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
    const { timer } = this.props;
    const { timer: prevTimer } = prevProps;

    if (this.shouldPlayMusic()) {
      this.playMusic();
    }

    this.updateInterval(prevTimer, timer);
    this.updateAlarmTrigger(prevTimer, timer);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
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

  setUpMusic() {
    this.music = new Audio(`${HOST}/resources/sounds/${trackName}.mp3`);
    this.music.volume = TimerService.getMusicVolume();
    this.music.addEventListener('ended', () => {
      this.music.currentTime = 0;
      this.music.play();
    }, false);
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
      this.alarm.play();
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

    return isMusicActive && running && !stopwatch;
  }

  shouldStopMusic(time) {
    const { timer } = this.props;
    const {
      running,
      stopwatch,
    } = timer;

    const isActive = TimerService.isMusicActive();
    const zero = time === 0;
    const validMusic = this.music != null;

    const reachedZeroOrStopped = (running && zero) || (!running);

    return !isActive || !validMusic || stopwatch || reachedZeroOrStopped;
  }

  shoulNotifyTimerEnded(time) {
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

    if (this.shoulNotifyTimerEnded(updatedTime)) {
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

  updateTime() {
    const { current } = this.timeRef;
    if (current) {
      current.textContent = this.getTime();
    }
  }

  render() {
    const { isTimerActive } = this.props;
    if (!isTimerActive) {
      this.stopMusic();
      return null;
    }

    const {
      isModerator,
      hidden,
      timer,
    } = this.props;
    const { running } = timer;

    const onClick = running ? TimerService.stopTimer : TimerService.startTimer;

    return (
      <Styled.TimerWrapper>
        <Styled.Timer>
          <Styled.TimerIndicator
            role="button"
            tabIndex={0}
            running={running}
            disabled={!isModerator}
            hide={hidden}
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
                {this.getTime()}
              </Styled.TimerTime>
            </Styled.TimerContent>
          </Styled.TimerIndicator>
        </Styled.Timer>
      </Styled.TimerWrapper>
    );
  }
}

export default Indicator;
