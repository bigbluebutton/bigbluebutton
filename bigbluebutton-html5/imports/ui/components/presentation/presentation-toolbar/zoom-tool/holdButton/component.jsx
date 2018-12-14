import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

const DELAY_MILLISECONDS = 300;
const STEP_TIME = 100;

class HoldDownButton extends Component {
  constructor(props) {
    super(props);
    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
    this.touchStart = this.touchStart.bind(this);
    this.touchEnd = this.touchEnd.bind(this);
    this.execInterval = this.execInterval.bind(this);
    this.onClick = this.onClick.bind(this);
    this.setInt = 0;
    this.state = {
      mouseHolding: false,
    };
  }

  onClick() {
    const {
      exec,
      minBound,
      maxBound,
      value,
    } = this.props;
    const bounds = (value === maxBound) || (value === minBound);
    if (bounds) return;
    exec();
  }

  execInterval() {
    const interval = () => {
      clearInterval(this.setInt);
      this.setInt = setInterval(this.onClick, STEP_TIME);
    };

    setTimeout(() => {
      if (this.state.mouseHolding) {
        interval();
      }
    }, DELAY_MILLISECONDS);
  }

  mouseDownHandler() {
    this.setState({
      ...this.state,
      mouseHolding: true,
    }, () => {
      this.execInterval();
    });
  }

  mouseUpHandler() {
    this.setState({
      ...this.state,
      mouseHolding: false,
    }, () => clearInterval(this.setInt));
  }

  touchStart() {
    this.setState({
      ...this.state,
      mouseHolding: true,
    }, () => {
      this.execInterval();
    });
  }

  touchEnd() {
    this.setState({
      ...this.state,
      mouseHolding: false,
    }, () => clearInterval(this.setInt));
  }


  render() {
    const {
      uniqueKey,
      className,
      children,
    } = this.props;

    return (
      <span
        role="button"
        key={uniqueKey}
        onClick={this.onClick}
        onMouseDown={this.mouseDownHandler}
        onMouseUp={this.mouseUpHandler}
        onTouchStart={this.touchStart}
        onTouchEnd={this.touchEnd}
        onMouseLeave={this.mouseUpHandler}
        className={className}
      >
        {children}
      </span>
    );
  }
}

const defaultProps = {
  exec: () => {},
  minBound: null,
  maxBound: Infinity,
  uniqueKey: _.uniqueId('holdButton-'),
  value: 0,
};

const propTypes = {
  uniqueKey: PropTypes.string,
  exec: PropTypes.func.isRequired,
  minBound: PropTypes.number,
  maxBound: PropTypes.number,
  children: PropTypes.node.isRequired,
};

HoldDownButton.defaultProps = propTypes;
HoldDownButton.defaultProps = defaultProps;

export default HoldDownButton;
