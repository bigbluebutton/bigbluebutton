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

    this.handleOnClick = this.handleOnClick.bind(this);
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

    if (!prevTimer.running && timer.running) {
      this.interval = setInterval(this.updateTime, TimerService.getInterval());
    }

    if (prevTimer.running && !timer.running) {
      clearInterval(this.interval);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  handleOnClick() {
    const { timer } = this.props;

    if (timer.running) {
      TimerService.stopTimer();
    } else {
      TimerService.startTimer(0);
    }
  }

  updateTime() {
    const { timer } = this.props;
    const {
      accumulated,
      timestamp,
    } = timer;

    const { current } = this.timeRef;
    if (current) {
      current.textContent = TimerService.getTimeAsString(accumulated + (Date.now() - timestamp));
    }
  }

  renderTimer() {
    const { timer } = this.props;

    return (
      <Styled.ListItem
        role="button"
        tabIndex={0}
        onClick={this.handleOnClick}
      >
        <Icon iconName="time" />
        <span
          aria-hidden
          ref={this.timeRef}
        >
          {TimerService.getTimeAsString(timer.accumulated)}
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
