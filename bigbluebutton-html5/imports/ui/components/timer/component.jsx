import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Session } from 'meteor/session';
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
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

class Timer extends PureComponent {
  constructor(props) {
    super(props);

    this.handleControlClick = this.handleControlClick.bind(this);
    this.handleSwitchToStopwatch = this.handleSwitchToStopwatch.bind(this);
    this.handleSwitchToTimer = this.handleSwitchToTimer.bind(this);
    this.handleOnHoursChange = this.handleOnHoursChange.bind(this);
    this.handleOnMinutesChange = this.handleOnMinutesChange.bind(this);
    this.handleOnSecondsChange = this.handleOnSecondsChange.bind(this);
  }

  handleControlClick() {
    const { timerStatus } = this.props;

    if (timerStatus.running) {
      Service.stopTimer();
    } else {
      Service.startTimer();
    }
  }

  handleOnHoursChange(event) {
    const { timerStatus } = this.props;
    const { target } = event;

    if (target && target.value) {
      const hours = parseInt(target.value);
      Service.setHours(hours, timerStatus.time);
    }
  }

  handleOnMinutesChange(event) {
    const { timerStatus } = this.props;
    const { target } = event;

    if (target && target.value) {
      const minutes = parseInt(target.value);
      Service.setMinutes(minutes, timerStatus.time);
    }
  }

  handleOnSecondsChange(event) {
    const { timerStatus } = this.props;
    const { target } = event;

    if (target && target.value) {
      const seconds = parseInt(target.value);
      Service.setSeconds(seconds, timerStatus.time);
    }
  }

  handleSwitchToStopwatch() {
    const { timerStatus } = this.props;

    if (!timerStatus.stopwatch) {
      Service.switchTimer(true);
    }
  }

  handleSwitchToTimer() {
    const { timerStatus } = this.props;

    if (timerStatus.stopwatch) {
      Service.switchTimer(false);
    }
  }

  renderControls() {
    const {
      intl,
      timerStatus,
    } = this.props;

    const { running } = timerStatus;

    const label = running ? intlMessages.stop : intlMessages.start;

    return (
      <Styled.TimerControls>
        <Styled.TimerControlButton
          color="primary"
          label={intl.formatMessage(label)}
          onClick={this.handleControlClick}
        />
        <Styled.TimerControlButton
          label={intl.formatMessage(intlMessages.reset)}
          onClick={() => Service.resetTimer()}
        />
      </Styled.TimerControls>
    );
  }

  renderPreset() {
    const { timerStatus } = this.props;
    const preset = Service.getPreset();

    return (
      <Styled.TimerPreset>
        {preset.map((p, index) => {
          const label = Service.buildPresetLabel(p);

          return (
            <Styled.TimerLine
              key={index}
            >
              <Styled.TimerPresetButton
                label="-"
                onClick={() => Service.subtractTime(p, timerStatus.time)}
              />
              <Styled.TimerPresetButton
                color="primary"
                label={label}
                onClick={() => Service.setTime(p)}
              />
              <Styled.TimerPresetButton
                label="+"
                onClick={() => Service.addTime(p, timerStatus.time)}
              />
            </Styled.TimerLine>
          );
        })}
      </Styled.TimerPreset>
    );
  }

  renderTimer() {
    const { timerStatus } = this.props;
    const { time } = timerStatus;

    const timeArray = Service.getTimeAsString(time).split(':');

    const hasHours = timeArray.length === 3;

    const hours = hasHours ? timeArray[0] : '00';
    const minutes = hasHours ? timeArray[1] : timeArray[0];
    const seconds = hasHours ? timeArray[2] : timeArray[1];

    return (
      <div>
        <Styled.StopwatchTime>
          <input
            type="number"
            value={hours}
            maxLength="2"
            max={Service.getMaxHours()}
            min="0"
            onChange={this.handleOnHoursChange}
          />
          <Styled.StopwatchTimeColon>:</Styled.StopwatchTimeColon>
          <input
            type="number"
            value={minutes}
            maxLength="2"
            max="59"
            min="0"
            onChange={this.handleOnMinutesChange}
          />
          <Styled.StopwatchTimeColon>:</Styled.StopwatchTimeColon>
          <input
            type="number"
            value={seconds}
            maxLength="2"
            max="59"
            min="0"
            onChange={this.handleOnSecondsChange}
          />
        </Styled.StopwatchTime>
        {this.renderPreset()}
        {this.renderControls()}
      </div>
    );
  }

  renderContent() {
    const {
      intl,
      timerStatus,
    } = this.props;

    const { stopwatch } = timerStatus;

    return (
      <Styled.TimerContent>
        <Styled.TimerType>
          <Styled.TimerSwitchButton
            color={stopwatch ? 'primary' : 'default'}
            label={intl.formatMessage(intlMessages.stopwatch)}
            onClick={this.handleSwitchToStopwatch}
          />
          <Styled.TimerSwitchButton
            color={stopwatch ? 'default' : 'primary'}
            label={intl.formatMessage(intlMessages.timer)}
            onClick={this.handleSwitchToTimer}
          />
        </Styled.TimerType>
        {stopwatch ? this.renderControls() : this.renderTimer()}
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
    } = this.props;

    if (!isActive || !isModerator) {
      Service.closePanel(layoutContextDispatch)
      return null;
    }

    return (
      <Styled.TimerSidebarContent
        data-test="timer"
      >
        <Styled.TimerHeader>
          <Styled.TimerTitle
            data-test="timerTitle"
          >
            <Styled.TimerMinimizeButton
              onClick={() => Service.closePanel(layoutContextDispatch)}
              aria-label={intl.formatMessage(intlMessages.hideTimerLabel)}
              label={intl.formatMessage(intlMessages.title)}
              icon={isRTL ? "right_arrow" : "left_arrow"}
            />
          </Styled.TimerTitle>
        </Styled.TimerHeader>
        {this.renderContent()}
      </Styled.TimerSidebarContent>
    );
  }
};

Timer.propTypes = propTypes;

export default injectWbResizeEvent(injectIntl(Timer));
