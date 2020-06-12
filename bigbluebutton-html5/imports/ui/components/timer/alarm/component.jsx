import React, { PureComponent } from 'react';
import TimerService from '/imports/ui/components/timer/service';

const CDN = Meteor.settings.public.app.cdn;
const BASENAME = Meteor.settings.public.app.basename;
const HOST = CDN + BASENAME;

const ALARM_INTERVAL = 1000;

class TimerAlarm extends PureComponent {
  constructor(props) {
    super(props);

    this.interval = null;
    this.alarm = null;

    // We need to avoid trigger on mount
    this.triggered = true;

    this.checkTime = this.checkTime.bind(this);
  }

  componentDidMount() {
    const { timer } = this.props;
    const { running } = timer;

    this.alarm = new Audio(`${HOST}/resources/sounds/alarm.mp3`);
    this.triggered = this.checkTime(true);

    if (running) {
      this.interval = setInterval(this.checkTime, ALARM_INTERVAL);
    }
  }

  componentDidUpdate(prevProps) {
    const { timer } = this.props;
    const { timer: prevTimer } = prevProps;

    this.updateInterval(prevTimer, timer);
    this.updateAlarmTrigger(prevTimer, timer);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  updateInterval(prevTimer, timer) {
    const { stopwatch } = timer;

    if (stopwatch) {
      clearInterval(this.interval);
      return;
    }

    const { running } = timer;
    const { running: prevRunning } = prevTimer;

    if (!prevRunning && running) {
      this.interval = setInterval(this.checkTime, ALARM_INTERVAL);
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
    }
  }

  play() {
    if (this.alarm && !this.triggered) {
      this.triggered = true;
      this.alarm.play();
    }
  }

  checkTime(onMount = false) {
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

    if (updatedTime === 0) {
      if (onMount) return true;
      this.play();
    }

    return false;
  }

  render() { return null }
}

export default TimerAlarm;
