import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Service from './service';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import Styled from './styles';

const intlMessages = defineMessages({
  hideTimerLabel: {
    id: 'app.timer.hideTimerLabel',
    description: 'Label for hiding timer button',
  },
  title: {
    id: 'app.timer.title',
    description: 'Title for timer',
  },
  stopwatch: {
    id: 'app.timer.button.stopwatch',
    description: 'Stopwatch switch button',
  },
  timer: {
    id: 'app.timer.button.timer',
    description: 'Timer switch button',
  },
  start: {
    id: 'app.timer.button.start',
    description: 'Timer start button',
  },
  stop: {
    id: 'app.timer.button.stop',
    description: 'Timer stop button',
  },
  reset: {
    id: 'app.timer.button.reset',
    description: 'Timer reset button',
  },
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
  songs: {
    id: 'app.timer.songs',
    description: 'Songs title label',
  },
  noTrack: {
    id: 'app.timer.noTrack',
    description: 'No track radio label',
  },
  track1: {
    id: 'app.timer.track1',
    description: 'Track 1 radio label',
  },
  track2: {
    id: 'app.timer.track2',
    description: 'Track 2 radio label',
  },
  track3: {
    id: 'app.timer.track3',
    description: 'Track 3 radio label',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  timer: PropTypes.shape({
    stopwatch: PropTypes.bool,
    running: PropTypes.bool,
    time: PropTypes.string,
    accumulated: PropTypes.number,
    timestamp: PropTypes.number,
  }).isRequired,
  layoutContextDispatch: PropTypes.shape().isRequired,
  timeOffset: PropTypes.number.isRequired,
  isRTL: PropTypes.bool.isRequired,
  isActive: PropTypes.bool.isRequired,
  isModerator: PropTypes.bool.isRequired,
  currentTrack: PropTypes.string.isRequired,
  isResizing: PropTypes.bool.isRequired,
};

class Timer extends Component {
  static handleOnTrackChange(event) {
    Service.setTrack(event.target.value);
  }

  constructor(props) {
    super(props);

    this.timeRef = React.createRef();
    this.interval = null;

    this.updateTime = this.updateTime.bind(this);
  }

  componentDidMount() {
    const { timer } = this.props;
    const { running } = timer;

    const { current } = this.timeRef;
    if (current && running) {
      this.interval = setInterval(this.updateTime, Service.getInterval());
    }
  }

  componentDidUpdate(prevProps) {
    const { timer } = this.props;
    const { timer: prevTimer } = prevProps;

    this.updateInterval(prevTimer, timer);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  handleControlClick() {
    const { timer } = this.props;

    if (timer.running) {
      Service.stopTimer();
    } else {
      Service.startTimer();
    }
  }

  handleOnHoursChange(event) {
    const { timer } = this.props;
    const { target } = event;

    if (target && target.value) {
      const hours = parseInt(target.value, 10);
      Service.setHours(hours, timer.time);
    }
  }

  handleOnMinutesChange(event) {
    const { timer } = this.props;
    const { target } = event;

    if (target && target.value) {
      const minutes = parseInt(target.value, 10);
      Service.setMinutes(minutes, timer.time);
    }
  }

  handleOnSecondsChange(event) {
    const { timer } = this.props;
    const { target } = event;

    if (target && target.value) {
      const seconds = parseInt(target.value, 10);
      Service.setSeconds(seconds, timer.time);
    }
  }

  handleSwitchToStopwatch() {
    const { timer } = this.props;

    if (!timer.stopwatch) {
      Service.switchTimer(true);
    }
  }

  handleSwitchToTimer() {
    const { timer } = this.props;

    if (timer.stopwatch) {
      Service.switchTimer(false);
    }
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

    const elapsedTime = Service.getElapsedTime(running, timestamp, timeOffset, accumulated);

    let updatedTime;
    if (stopwatch) {
      updatedTime = elapsedTime;
    } else {
      updatedTime = Math.max(time - elapsedTime, 0);
    }

    return Service.getTimeAsString(updatedTime, stopwatch);
  }

  updateTime() {
    const { current } = this.timeRef;
    if (current) {
      current.textContent = this.getTime();
    }
  }

  updateInterval(prevTimer, timer) {
    const { running } = timer;
    const { running: prevRunning } = prevTimer;

    if (!prevRunning && running) {
      this.interval = setInterval(this.updateTime, Service.getInterval());
    }

    if (prevRunning && !running) {
      clearInterval(this.interval);
    }
  }

  renderControls() {
    const {
      intl,
      timer,
    } = this.props;

    const { running } = timer;

    const label = running ? intlMessages.stop : intlMessages.start;
    const color = running ? 'danger' : 'primary';

    return (
      <Styled.TimerControls>
        <Styled.TimerControlButton
          color={color}
          label={intl.formatMessage(label)}
          onClick={() => this.handleControlClick()}
        />
        <Styled.TimerControlButton
          color="secondary"
          label={intl.formatMessage(intlMessages.reset)}
          onClick={() => Service.resetTimer()}
        />
      </Styled.TimerControls>
    );
  }

  renderSongSelectorRadios() {
    const {
      intl,
      timer,
      currentTrack,
    } = this.props;

    const {
      stopwatch,
    } = timer;

    return (
      <Styled.TimerSongsWrapper>
        <Styled.TimerSongsTitle
          stopwatch={stopwatch}
        >
          {intl.formatMessage(intlMessages.songs)}
        </Styled.TimerSongsTitle>
        <Styled.TimerTracks>
          {Service.TRACKS.map((track) => (
            <Styled.TimerTrackItem
              key={track}
            >
              <label htmlFor={track}>
                <input
                  type="radio"
                  name="track"
                  id={track}
                  value={track}
                  checked={currentTrack === track}
                  onChange={Timer.handleOnTrackChange}
                  disabled={stopwatch}
                />
                {intl.formatMessage(intlMessages[track])}
              </label>
            </Styled.TimerTrackItem>
          ))}
        </Styled.TimerTracks>
      </Styled.TimerSongsWrapper>
    );
  }

  renderTimer() {
    const {
      intl,
      timer,
    } = this.props;

    const {
      time,
      stopwatch,
    } = timer;

    if (stopwatch) return this.renderControls();

    const timeArray = Service.getTimeAsString(time).split(':');

    const hasHours = timeArray.length === 3;

    const hours = hasHours ? timeArray[0] : '00';
    const minutes = hasHours ? timeArray[1] : timeArray[0];
    const seconds = hasHours ? timeArray[2] : timeArray[1];

    return (
      <div>
        <Styled.StopwatchTime>
          <Styled.StopwatchTimeInput>
            <Styled.TimerInput
              type="number"
              disabled={stopwatch}
              value={hours}
              maxLength="2"
              max={Service.getMaxHours()}
              min="0"
              onChange={(event) => this.handleOnHoursChange(event)}
            />
            <Styled.StopwatchTimeInputLabel>
              {intl.formatMessage(intlMessages.hours)}
            </Styled.StopwatchTimeInputLabel>
          </Styled.StopwatchTimeInput>
          <Styled.StopwatchTimeColon>:</Styled.StopwatchTimeColon>
          <Styled.StopwatchTimeInput>
            <Styled.TimerInput
              type="number"
              disabled={stopwatch}
              value={minutes}
              maxLength="2"
              max="59"
              min="0"
              onChange={(event) => this.handleOnMinutesChange(event)}
            />
            <Styled.StopwatchTimeInputLabel>
              {intl.formatMessage(intlMessages.minutes)}
            </Styled.StopwatchTimeInputLabel>
          </Styled.StopwatchTimeInput>
          <Styled.StopwatchTimeColon>:</Styled.StopwatchTimeColon>
          <Styled.StopwatchTimeInput>
            <Styled.TimerInput
              type="number"
              disabled={stopwatch}
              value={seconds}
              maxLength="2"
              max="59"
              min="0"
              onChange={(event) => this.handleOnSecondsChange(event)}
            />
            <Styled.StopwatchTimeInputLabel>
              {intl.formatMessage(intlMessages.seconds)}
            </Styled.StopwatchTimeInputLabel>
          </Styled.StopwatchTimeInput>
        </Styled.StopwatchTime>
        { Service.isMusicEnabled()
          ? this.renderSongSelectorRadios() : null}
        {this.renderControls()}
      </div>
    );
  }

  renderContent() {
    const {
      intl,
      isResizing,
      timer,
    } = this.props;

    const { stopwatch } = timer;

    return (
      <Styled.TimerContent
        isResizing={isResizing}
      >
        <Styled.TimerCurrent
          aria-hidden
          ref={this.timeRef}
        >
          {this.getTime()}
        </Styled.TimerCurrent>
        <Styled.TimerType>
          <Styled.TimerSwitchButton
            label={intl.formatMessage(intlMessages.stopwatch)}
            onClick={() => this.handleSwitchToStopwatch()}
            color={stopwatch ? 'primary' : 'secondary'}
          />
          <Styled.TimerSwitchButton
            label={intl.formatMessage(intlMessages.timer)}
            onClick={() => this.handleSwitchToTimer()}
            color={!stopwatch ? 'primary' : 'secondary'}
          />
        </Styled.TimerType>
        {this.renderTimer()}
      </Styled.TimerContent>
    );
  }

  render() {
    const {
      intl,
      isRTL,
      isActive,
      isModerator,
      layoutContextDispatch,
      timer,
    } = this.props;

    if (!isActive || !isModerator) {
      Service.closePanel(layoutContextDispatch);
      return null;
    }

    const { stopwatch } = timer;
    const message = stopwatch ? intlMessages.stopwatch : intlMessages.timer;

    return (
      <Styled.TimerSidebarContent
        data-test="timer"
      >
        <Styled.TimerHeader>
          <Styled.TimerTitle>
            <Styled.TimerMinimizeButton
              onClick={() => Service.closePanel(layoutContextDispatch)}
              aria-label={intl.formatMessage(intlMessages.hideTimerLabel)}
              label={intl.formatMessage(message)}
              icon={isRTL ? 'right_arrow' : 'left_arrow'}
            />
          </Styled.TimerTitle>
        </Styled.TimerHeader>
        {this.renderContent()}
      </Styled.TimerSidebarContent>
    );
  }
}

Timer.propTypes = propTypes;

export default injectWbResizeEvent(injectIntl(Timer));
