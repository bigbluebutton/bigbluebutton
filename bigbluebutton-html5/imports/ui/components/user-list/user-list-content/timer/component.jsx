import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/component';
import TimerService from '/imports/ui/components/timer/service';
import Styled from './styles';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

const intlMessages = defineMessages({
  title: {
    id: 'app.userList.timerTitle',
    description: 'Title for the timer',
  },
});

class Timer extends Component {
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
      this.interval = setInterval(this.updateTime, TimerService.getInterval());
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

  getTime() {
    const { timer } = this.props;
    const {
      stopwatch,
      running,
      time,
      accumulated,
      timestamp,
    } = timer;

    const overTime = running ? (Date.now() - timestamp) : 0;
    const elapsedTime = accumulated + overTime;

    let updatedTime;
    if (stopwatch) {
      updatedTime = elapsedTime;
    } else {
      updatedTime = Math.max(time - elapsedTime, 0);
    }

    return TimerService.getTimeAsString(updatedTime, stopwatch);
  }

  updateTime() {
    const { current } = this.timeRef;
    if (current) {
      current.textContent = this.getTime();
    }
  }

  renderTimer() {
    const {
      timer,
      isModerator,
      sidebarContentPanel,
      layoutContextDispatch,
    } = this.props;

    const {
      stopwatch,
      accumulated,
    } = timer;

    if (!isModerator) {
      return (
        <Styled.ListItem
          tabIndex={0}
          disabled={true}
        >
          <Icon iconName="time" />
          <span
            aria-hidden
            ref={this.timeRef}
          >
            {this.getTime()}
          </span>
        </Styled.ListItem>
      );
    }

    return (
      <Styled.ListItem
        role="button"
        tabIndex={0}
        onClick={() => TimerService.togglePanel(sidebarContentPanel, layoutContextDispatch)}
      >
        <Icon iconName="time" />
        <span
          aria-hidden
          ref={this.timeRef}
        >
          {this.getTime()}
        </span>
      </Styled.ListItem>
    );
  }

  render() {
    const {
      intl,
      isTimerActive,
    } = this.props;

    if (!TimerService.isEnabled() || !isTimerActive) return null;

    return (
      <Styled.Messages>
        <Styled.Container>
          <Styled.SmallTitle>
            {intl.formatMessage(intlMessages.title)}
          </Styled.SmallTitle>
        </Styled.Container>
        <Styled.ScrollableList>
          <Styled.List>
            {this.renderTimer()}
          </Styled.List>
        </Styled.ScrollableList>
      </Styled.Messages>
    );
  }
}

Timer.propTypes = propTypes;

export default injectIntl(Timer);
